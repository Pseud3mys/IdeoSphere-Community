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
  authors: User[];
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
 */
export async function fetchLineage(
  itemId: string, 
  itemType: 'idea' | 'post',
  maxDepth: number = 3
): Promise<LineageResult | null> {
  await simulateApiDelay(150);

  try {
    const data = await loadMockDataSet();
    const allUsers = [data.guestUser, data.currentUser, ...data.users];

    let currentElement: Idea | Post | null = null;
    
    if (itemType === 'idea') {
      currentElement = data.ideas.find(i => i.id === itemId) || null;
    } else {
      currentElement = data.posts.find(p => p.id === itemId) || null;
    }

    if (!currentElement) {
      return null;
    }

    const currentItem: LineageItem = {
      id: currentElement.id,
      type: itemType,
      title: 'title' in currentElement ? currentElement.title : undefined,
      content: 'content' in currentElement ? currentElement.content : undefined,
      summary: 'summary' in currentElement ? currentElement.summary : undefined,
      authors: 'creators' in currentElement 
        ? currentElement.creators 
        : [('author' in currentElement ? currentElement.author : currentElement.creators[0])],
      createdAt: currentElement.createdAt,
      level: 0,
      relationshipType: 'current'
    };

    const parents = await getParentLineage(currentElement, itemType, allUsers, maxDepth);
    const children = await getChildrenLineage(currentElement, itemType, allUsers, maxDepth);

    const result: LineageResult = {
      currentItem,
      parents,
      children,
      totalLevels: Math.max(parents.length, children.length) + 1
    };

    return result;
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
          authors: sourceIdea.creators,
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
          authors: [sourcePost.author],
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

  if (type === 'idea' && 'derivedIdeas' in element) {
    const derivedIds = element.derivedIdeas || [];
    for (const derivedId of derivedIds.slice(0, maxDepth)) {
      const derivedIdea = ideas.find(i => i.id === derivedId);
      if (derivedIdea) {
        children.push({
          id: derivedIdea.id,
          type: 'idea',
          title: derivedIdea.title,
          summary: derivedIdea.summary,
          authors: derivedIdea.creators,
          createdAt: derivedIdea.createdAt,
          level: 1,
          relationshipType: 'child'
        });
      }
    }
  }

  return children;
}
