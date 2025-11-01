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

/**
 * Récupère le lineage complet d'une idée ou d'un post
 * @returns { lineage: LineageResult, users: User[] } - Le lineage et les utilisateurs associés
 */
export async function fetchLineage(
  itemId: string, 
  itemType: 'idea' | 'post',
  maxDepth: number = 3
): Promise<{ lineage: LineageResult, users: User[] } | null> {
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

    const parents = await getParentLineage(currentElement, itemType, allUsers, maxDepth);
    const children = await getChildrenLineage(currentElement, itemType, allUsers, maxDepth);

    const lineageResult: LineageResult = {
      currentItem,
      parents,
      children,
      totalLevels: Math.max(parents.length, children.length) + 1
    };

    // ✅ Extraire tous les utilisateurs uniques du lineage
    const userIds = new Set<string>();
    const collectUserIds = (item: LineageItem) => {
      if (item.authorId) {
        userIds.add(item.authorId);
      }
      if (item.creatorIds) {
        item.creatorIds.forEach(creatorId => userIds.add(creatorId));
      }
    };

    collectUserIds(currentItem);
    parents.forEach(collectUserIds);
    children.forEach(collectUserIds);

    // ✅ Récupérer les objets User correspondants
    const users = allUsers.filter(user => userIds.has(user.id));

    console.log(`✅ [API] fetchLineage - ${parents.length} parents, ${children.length} enfants, ${users.length} utilisateurs`);

    const returnValue = {
      lineage: lineageResult,
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
