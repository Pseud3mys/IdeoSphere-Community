import { Idea, Post, User, DiscussionTopic } from '../types';
import { loadMockDataSet, getAllIdeas, getAllPosts } from './dataService';

const simulateApiDelay = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service de gestion du lineage (arbre généalogique) des idées et posts
 */

export interface LineageItem {
  id: string;
  type: 'idea' | 'post';
  title?: string;
  content?: string;
  summary?: string;
  // ✅ Pour les Posts: authorId (string)
  // ✅ Pour les Ideas: creatorIds (string[])
  authorId?: string; // Pour les Posts uniquement
  creatorIds?: string[]; // Pour les Ideas uniquement
  createdAt: Date;
  level: number;
  relationshipType: 'parent' | 'child' | 'current';
}

export interface LineageResult {
  currentItem: LineageItem;
  parents: LineageItem[];
  children: LineageItem[];
  totalLevels: number;
}

// ✅ Nouvelle interface pour le retour avec objets complets
export interface LineageServiceResult {
  parents: (Idea | Post | DiscussionTopic)[];
  children: (Idea | Post | DiscussionTopic)[];
}

/**
 * Récupère le lineage complet d'une idée ou d'un post
 * @returns { lineage: LineageServiceResult, users: User[] } - Le lineage et les utilisateurs associés
 */
export async function fetchLineage(
  itemId: string, 
  itemType: 'idea' | 'post',
  maxDepth: number = 3
): Promise<{ lineage: LineageServiceResult, users: User[] } | null> {
  await simulateApiDelay(150);

  try {
    console.log(`🔍 [API] fetchLineage - Début - itemId: ${itemId}, itemType: ${itemType}`);
    const data = await loadMockDataSet();
    const allUsers = [data.guestUser, data.currentUser, ...data.users];

    let currentElement: Idea | Post | null = null;
    
    if (itemType === 'idea') {
      currentElement = data.ideas.find(i => i.id === itemId) || null;
    } else {
      currentElement = data.posts.find(p => p.id === itemId) || null;
    }

    if (!currentElement) {
      console.error(`❌ [API] fetchLineage - Élément non trouvé - itemId: ${itemId}, itemType: ${itemType}`);
      return null;
    }

    // ✅ Construire le LineageItem selon le type
    const currentItem: LineageItem = {
      id: currentElement.id,
      type: itemType,
      title: 'title' in currentElement ? currentElement.title : undefined,
      content: 'content' in currentElement ? currentElement.content : undefined,
      summary: 'summary' in currentElement ? currentElement.summary : undefined,
      // ✅ Pour Post: authorId (string)
      authorId: itemType === 'post' ? (currentElement as Post).authorId : undefined,
      // ✅ Pour Idea: creatorIds (string[])
      creatorIds: itemType === 'idea' ? (currentElement as Idea).creatorIds : undefined,
      createdAt: currentElement.createdAt,
      level: 0,
      relationshipType: 'current'
    };

    // ✅ Récupérer les objets complets pour parents et enfants
    const parentsComplete = await getParentLineageComplete(currentElement, itemType, data, maxDepth);
    const childrenComplete = await getChildrenLineageComplete(currentElement, itemType, data, maxDepth);

    const lineageServiceResult: LineageServiceResult = {
      parents: parentsComplete,
      children: childrenComplete
    };

    // ✅ Extraire tous les utilisateurs uniques du lineage
    const userIds = new Set<string>();
    
    // Collecter les IDs des auteurs du contenu actuel
    if (itemType === 'post') {
      userIds.add((currentElement as Post).authorId);
    } else {
      (currentElement as Idea).creatorIds?.forEach(id => userIds.add(id));
    }
    
    // Collecter les IDs des auteurs des parents
    parentsComplete.forEach(item => {
      if ('authorId' in item && item.authorId) {
        userIds.add(item.authorId);
      }
      if ('creatorIds' in item && item.creatorIds) {
        item.creatorIds.forEach(id => userIds.add(id));
      }
    });
    
    // Collecter les IDs des auteurs des enfants
    childrenComplete.forEach(item => {
      if ('authorId' in item && item.authorId) {
        userIds.add(item.authorId);
      }
      if ('creatorIds' in item && item.creatorIds) {
        item.creatorIds.forEach(id => userIds.add(id));
      }
    });

    // ✅ Récupérer les objets User correspondants
    const users = allUsers.filter(user => userIds.has(user.id));

    console.log(`✅ [API] fetchLineage - ${parentsComplete.length} parents, ${childrenComplete.length} enfants, ${users.length} utilisateurs`);

    const returnValue = {
      lineage: lineageServiceResult,
      users: users
    };
    
    console.log(`✅ [API] fetchLineage - Structure de retour:`, {
      hasLineage: !!returnValue.lineage,
      hasParents: !!returnValue.lineage?.parents,
      hasChildren: !!returnValue.lineage?.children,
      usersCount: returnValue.users.length
    });

    return returnValue;
  } catch (error) {
    console.error(`[api] fetchLineage - Erreur:`, error);
    return null;
  }
}



// ✅ Nouvelles fonctions pour récupérer les objets complets
async function getParentLineageComplete(
  element: Idea | Post,
  type: 'idea' | 'post',
  data: any,
  maxDepth: number
): Promise<(Idea | Post | DiscussionTopic)[]> {
  const parents: (Idea | Post | DiscussionTopic)[] = [];
  const ideas = data.ideas;
  const posts = data.posts;
  const discussions = data.discussions;

  if (type === 'idea' && 'sourceIdeas' in element) {
    // Ajouter les idées sources
    const sourceIdeas = element.sourceIdeas || [];
    for (const sourceId of sourceIdeas.slice(0, maxDepth)) {
      const sourceIdea = ideas.find((i: Idea) => i.id === sourceId);
      if (sourceIdea) {
        parents.push(sourceIdea);
      }
    }

    // Ajouter les posts sources
    const sourcePosts = element.sourcePosts || [];
    for (const postId of sourcePosts.slice(0, maxDepth)) {
      const sourcePost = posts.find((p: Post) => p.id === postId);
      if (sourcePost) {
        parents.push(sourcePost);
      }
    }

    // ✅ Ajouter les discussions sources
    const sourceDiscussions = element.sourceDiscussions || [];
    for (const discussionId of sourceDiscussions.slice(0, maxDepth)) {
      const sourceDiscussion = discussions.find((d: DiscussionTopic) => d.id === discussionId);
      if (sourceDiscussion) {
        parents.push(sourceDiscussion);
      }
    }
  } else if (type === 'post' && 'sourcePosts' in element) {
    // Pour les posts, ajouter les posts sources
    const sourcePosts = element.sourcePosts || [];
    for (const postId of sourcePosts.slice(0, maxDepth)) {
      const sourcePost = posts.find((p: Post) => p.id === postId);
      if (sourcePost) {
        parents.push(sourcePost);
      }
    }
  }

  return parents;
}

async function getChildrenLineageComplete(
  element: Idea | Post,
  type: 'idea' | 'post',
  data: any,
  maxDepth: number
): Promise<(Idea | Post | DiscussionTopic)[]> {
  const children: (Idea | Post | DiscussionTopic)[] = [];
  const ideas = data.ideas;
  const posts = data.posts;

  if (type === 'idea' && 'derivedIdeas' in element) {
    // Ideas dérivées d'une Idea
    const derivedIds = element.derivedIdeas || [];
    for (const derivedId of derivedIds.slice(0, maxDepth)) {
      const derivedIdea = ideas.find((i: Idea) => i.id === derivedId);
      if (derivedIdea) {
        children.push(derivedIdea);
      }
    }
  } else if (type === 'post') {
    // Ideas dérivées d'un Post
    const derivedIdeaIds = (element as Post).derivedIdeas || [];
    for (const derivedId of derivedIdeaIds.slice(0, maxDepth)) {
      const derivedIdea = ideas.find((i: Idea) => i.id === derivedId);
      if (derivedIdea) {
        children.push(derivedIdea);
      }
    }

    // Posts dérivés d'un Post
    const derivedPostIds = (element as Post).derivedPosts || [];
    for (const derivedId of derivedPostIds.slice(0, maxDepth)) {
      const derivedPost = posts.find((p: Post) => p.id === derivedId);
      if (derivedPost) {
        children.push(derivedPost);
      }
    }
  }

  return children;
}

// ✅ Garder les anciennes fonctions pour compatibilité (utilisées par LineageResult)
async function getParentLineage(
  element: Idea | Post,
  type: 'idea' | 'post',
  allUsers: User[],
  maxDepth: number
): Promise<LineageItem[]> {
  const parents: LineageItem[] = [];
  const ideas = await getAllIdeas();
  const posts = await getAllPosts();

  if (type === 'idea' && 'sourceIdeas' in element) {
    const sourceIdeas = element.sourceIdeas || [];
    for (const sourceId of sourceIdeas.slice(0, maxDepth)) {
      const sourceIdea = ideas.find(i => i.id === sourceId);
      if (sourceIdea) {
        parents.push({
          id: sourceIdea.id,
          type: 'idea',
          title: sourceIdea.title,
          summary: sourceIdea.summary,
          creatorIds: sourceIdea.creatorIds,
          createdAt: sourceIdea.createdAt,
          level: -1,
          relationshipType: 'parent'
        });
      }
    }

    const sourcePosts = element.sourcePosts || [];
    for (const postId of sourcePosts.slice(0, maxDepth)) {
      const sourcePost = posts.find(p => p.id === postId);
      if (sourcePost) {
        parents.push({
          id: sourcePost.id,
          type: 'post',
          content: sourcePost.content,
          authorId: sourcePost.authorId, // ✅ Posts: utiliser authorId (string)
          createdAt: sourcePost.createdAt,
          level: -1,
          relationshipType: 'parent'
        });
      }
    }
  } else if (type === 'post' && 'sourcePosts' in element) {
    // ✅ Gérer les sourcePosts pour les posts aussi !
    const sourcePosts = element.sourcePosts || [];
    for (const postId of sourcePosts.slice(0, maxDepth)) {
      const sourcePost = posts.find(p => p.id === postId);
      if (sourcePost) {
        parents.push({
          id: sourcePost.id,
          type: 'post',
          content: sourcePost.content,
          authorId: sourcePost.authorId,
          createdAt: sourcePost.createdAt,
          level: -1,
          relationshipType: 'parent'
        });
      }
    }
  }

  return parents;
}

async function getChildrenLineage(
  element: Idea | Post,
  type: 'idea' | 'post',
  allUsers: User[],
  maxDepth: number
): Promise<LineageItem[]> {
  const children: LineageItem[] = [];
  const ideas = await getAllIdeas();
  const posts = await getAllPosts();

  if (type === 'idea' && 'derivedIdeas' in element) {
    // Ideas dérivées d'une Idea
    const derivedIds = element.derivedIdeas || [];
    for (const derivedId of derivedIds.slice(0, maxDepth)) {
      const derivedIdea = ideas.find(i => i.id === derivedId);
      if (derivedIdea) {
        children.push({
          id: derivedIdea.id,
          type: 'idea',
          title: derivedIdea.title,
          summary: derivedIdea.summary,
          creatorIds: derivedIdea.creatorIds,
          createdAt: derivedIdea.createdAt,
          level: 1,
          relationshipType: 'child'
        });
      }
    }
  } else if (type === 'post') {
    // Ideas dérivées d'un Post
    const derivedIdeaIds = (element as Post).derivedIdeas || [];
    for (const derivedId of derivedIdeaIds.slice(0, maxDepth)) {
      const derivedIdea = ideas.find(i => i.id === derivedId);
      if (derivedIdea) {
        children.push({
          id: derivedIdea.id,
          type: 'idea',
          title: derivedIdea.title,
          summary: derivedIdea.summary,
          creatorIds: derivedIdea.creatorIds,
          createdAt: derivedIdea.createdAt,
          level: 1,
          relationshipType: 'child'
        });
      }
    }

    // Posts dérivés d'un Post
    const derivedPostIds = (element as Post).derivedPosts || [];
    for (const derivedId of derivedPostIds.slice(0, maxDepth)) {
      const derivedPost = posts.find(p => p.id === derivedId);
      if (derivedPost) {
        children.push({
          id: derivedPost.id,
          type: 'post',
          content: derivedPost.content,
          authorId: derivedPost.authorId, // ✅ Posts: utiliser authorId (string)
          createdAt: derivedPost.createdAt,
          level: 1,
          relationshipType: 'child'
        });
      }
    }
  }

  return children;
}
