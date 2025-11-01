import { Post, Idea, FeedItem } from '../types';

/**
 * Représente un élément dans une chaîne de contenu
 */
export interface ChainNode {
  id: string;
  type: 'post' | 'idea';
  item: Post | Idea;
  level: number; // 0 = racine, 1 = niveau 1, etc.
  supportCount: number;
  createdAt: Date;
  seenByUser?: boolean; // Si l'utilisateur a déjà vu cet item
}

/**
 * Représente une chaîne complète d'inspiration
 */
export interface ContentChain {
  chainId: string; // ID basé sur la racine de la chaîne
  rootNode: ChainNode;
  nodes: ChainNode[]; // Tous les nœuds de la chaîne, triés par niveau
  maxSupportCount: number; // Support maximum dans la chaîne
  latestDate: Date; // Date de la dernière contribution
  totalNodes: number;
  hasUnseen: boolean; // Si la chaîne contient du contenu non vu
}

/**
 * Trouve l'élément racine d'une chaîne (en remontant les sources)
 */
function findRootId(
  itemId: string,
  itemType: 'post' | 'idea',
  postsMap: Map<string, Post>,
  ideasMap: Map<string, Idea>,
  visited: Set<string> = new Set()
): { id: string; type: 'post' | 'idea' } {
  // Éviter les boucles infinies
  if (visited.has(`${itemType}-${itemId}`)) {
    return { id: itemId, type: itemType };
  }
  visited.add(`${itemType}-${itemId}`);

  if (itemType === 'post') {
    const post = postsMap.get(itemId);
    if (!post) return { id: itemId, type: itemType };

    // Remonter aux sources
    const sourcePosts = post.sourcePosts || [];
    if (sourcePosts.length > 0) {
      // Prendre la première source
      return findRootId(sourcePosts[0], 'post', postsMap, ideasMap, visited);
    }
  } else {
    const idea = ideasMap.get(itemId);
    if (!idea) return { id: itemId, type: itemType };

    // Remonter aux sources (idées ou posts)
    const sourceIdeas = idea.sourceIdeas || [];
    const sourcePosts = idea.sourcePosts || [];
    
    if (sourceIdeas.length > 0) {
      return findRootId(sourceIdeas[0], 'idea', postsMap, ideasMap, visited);
    }
    if (sourcePosts.length > 0) {
      return findRootId(sourcePosts[0], 'post', postsMap, ideasMap, visited);
    }
  }

  // Pas de source = c'est la racine
  return { id: itemId, type: itemType };
}

/**
 * Construit une chaîne complète à partir d'une racine
 */
function buildChainFromRoot(
  rootId: string,
  rootType: 'post' | 'idea',
  postsMap: Map<string, Post>,
  ideasMap: Map<string, Idea>,
  seenItems: Set<string> = new Set()
): ChainNode[] {
  const nodes: ChainNode[] = [];
  const queue: Array<{ id: string; type: 'post' | 'idea'; level: number }> = [
    { id: rootId, type: rootType, level: 0 }
  ];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.type}-${current.id}`;

    if (visited.has(key)) continue;
    visited.add(key);

    let item: Post | Idea | undefined;
    let supportCount = 0;

    if (current.type === 'post') {
      item = postsMap.get(current.id);
      if (item) {
        supportCount = (item as Post).supporters?.length || 0;
        
        // Ajouter les posts dérivés
        const derivedPosts = (item as Post).derivedPosts || [];
        derivedPosts.forEach(derivedId => {
          queue.push({ id: derivedId, type: 'post', level: current.level + 1 });
        });

        // Ajouter les idées dérivées
        const derivedIdeas = (item as Post).derivedIdeas || [];
        derivedIdeas.forEach(derivedId => {
          queue.push({ id: derivedId, type: 'idea', level: current.level + 1 });
        });
      }
    } else {
      item = ideasMap.get(current.id);
      if (item) {
        supportCount = (item as Idea).supporters?.length || 0;
        
        // Ajouter les idées dérivées
        const derivedIdeas = (item as Idea).derivedIdeas || [];
        derivedIdeas.forEach(derivedId => {
          queue.push({ id: derivedId, type: 'idea', level: current.level + 1 });
        });
      }
    }

    if (item) {
      nodes.push({
        id: current.id,
        type: current.type,
        item,
        level: current.level,
        supportCount,
        createdAt: item.createdAt,
        seenByUser: seenItems.has(key)
      });
    }
  }

  return nodes.sort((a, b) => a.level - b.level || b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Analyse un feed et détecte les chaînes de contenu
 */
export function analyzeContentChains(
  posts: Post[],
  ideas: Idea[],
  seenItems: Set<string> = new Set()
): ContentChain[] {
  // Créer des maps pour un accès rapide
  const postsMap = new Map(posts.map(p => [p.id, p]));
  const ideasMap = new Map(ideas.map(i => [i.id, i]));

  // Map pour stocker les chaînes par racine
  const chainsByRoot = new Map<string, ContentChain>();

  // Analyser tous les items
  const allItems: Array<{ id: string; type: 'post' | 'idea' }> = [
    ...posts.map(p => ({ id: p.id, type: 'post' as const })),
    ...ideas.map(i => ({ id: i.id, type: 'idea' as const }))
  ];

  allItems.forEach(({ id, type }) => {
    // Trouver la racine de cet item
    const root = findRootId(id, type, postsMap, ideasMap);
    const rootKey = `${root.type}-${root.id}`;

    // Si on n'a pas encore construit cette chaîne
    if (!chainsByRoot.has(rootKey)) {
      const nodes = buildChainFromRoot(root.id, root.type, postsMap, ideasMap, seenItems);
      
      if (nodes.length > 0) {
        const maxSupportCount = Math.max(...nodes.map(n => n.supportCount));
        const latestDate = new Date(Math.max(...nodes.map(n => n.createdAt.getTime())));
        const hasUnseen = nodes.some(n => !n.seenByUser);

        chainsByRoot.set(rootKey, {
          chainId: rootKey,
          rootNode: nodes[0],
          nodes,
          maxSupportCount,
          latestDate,
          totalNodes: nodes.length,
          hasUnseen
        });
      }
    }
  });

  // Retourner les chaînes triées par activité récente et engagement
  return Array.from(chainsByRoot.values()).sort((a, b) => {
    // Prioriser les chaînes avec du contenu non vu
    if (a.hasUnseen && !b.hasUnseen) return -1;
    if (!a.hasUnseen && b.hasUnseen) return 1;

    // Puis par engagement (support max dans la chaîne)
    if (a.maxSupportCount !== b.maxSupportCount) {
      return b.maxSupportCount - a.maxSupportCount;
    }

    // Puis par date de dernière activité
    return b.latestDate.getTime() - a.latestDate.getTime();
  });
}

/**
 * Trouve le nœud le plus pertinent à montrer dans une chaîne
 * (le plus récent non vu, ou le plus soutenu)
 */
export function getMostRelevantNode(chain: ContentChain, seenItems: Set<string>): ChainNode {
  // 1. Priorité : dernier nœud non vu
  const unseenNodes = chain.nodes.filter(n => !seenItems.has(`${n.type}-${n.id}`));
  if (unseenNodes.length > 0) {
    return unseenNodes[unseenNodes.length - 1]; // Le plus récent
  }

  // 2. Sinon : nœud avec le plus de support
  const nodesBySupportDesc = [...chain.nodes].sort((a, b) => b.supportCount - a.supportCount);
  return nodesBySupportDesc[0];
}

/**
 * Obtient le résumé d'évolution d'une chaîne
 */
export function getChainEvolutionSummary(chain: ContentChain): string {
  if (chain.totalNodes === 1) {
    return chain.rootNode.type === 'post' ? 'Post original' : 'Projet original';
  }

  const posts = chain.nodes.filter(n => n.type === 'post').length;
  const ideas = chain.nodes.filter(n => n.type === 'idea').length;

  if (posts > 0 && ideas > 0) {
    return `${posts} post${posts > 1 ? 's' : ''} → ${ideas} projet${ideas > 1 ? 's' : ''}`;
  } else if (posts > 1) {
    return `Chaîne de ${posts} posts`;
  } else {
    return `Chaîne de ${ideas} projets`;
  }
}

/**
 * Contexte de chaîne pour un élément spécifique
 */
export interface ItemChainContext {
  isInChain: boolean;
  chainLength: number;
  position: 'root' | 'middle' | 'latest'; // Position dans la chaîne
  hasParents: boolean; // A des éléments sources
  hasChildren: boolean; // A des éléments dérivés
  parentCount: number;
  childCount: number;
  maxSupportInChain: number;
  hasUnseenInChain: boolean;
  evolutionSummary: string;
  chain?: ContentChain;
}

/**
 * Obtient le contexte de chaîne pour un élément spécifique
 */
export function getItemChainContext(
  itemId: string,
  itemType: 'post' | 'idea',
  chains: ContentChain[],
  seenItems: Set<string>
): ItemChainContext {
  // Trouver la chaîne contenant cet élément
  const chain = chains.find(c => 
    c.nodes.some(n => n.id === itemId && n.type === itemType)
  );

  if (!chain || chain.totalNodes === 1) {
    return {
      isInChain: false,
      chainLength: 1,
      position: 'root',
      hasParents: false,
      hasChildren: false,
      parentCount: 0,
      childCount: 0,
      maxSupportInChain: 0,
      hasUnseenInChain: false,
      evolutionSummary: ''
    };
  }

  const node = chain.nodes.find(n => n.id === itemId && n.type === itemType)!;
  const nodeIndex = chain.nodes.indexOf(node);
  
  // Déterminer la position
  let position: 'root' | 'middle' | 'latest';
  if (nodeIndex === 0) {
    position = 'root';
  } else if (nodeIndex === chain.nodes.length - 1) {
    position = 'latest';
  } else {
    position = 'middle';
  }

  // Compter parents et enfants
  const parentCount = chain.nodes.filter(n => n.level < node.level).length;
  const childCount = chain.nodes.filter(n => n.level > node.level).length;

  return {
    isInChain: true,
    chainLength: chain.totalNodes,
    position,
    hasParents: parentCount > 0,
    hasChildren: childCount > 0,
    parentCount,
    childCount,
    maxSupportInChain: chain.maxSupportCount,
    hasUnseenInChain: chain.hasUnseen,
    evolutionSummary: getChainEvolutionSummary(chain),
    chain
  };
}

/**
 * Obtient l'élément le plus soutenu dans une chaîne
 */
export function getMostSupportedItem(chain: ContentChain): ChainNode {
  return chain.nodes.reduce((max, node) => 
    node.supportCount > max.supportCount ? node : max
  , chain.nodes[0]);
}
