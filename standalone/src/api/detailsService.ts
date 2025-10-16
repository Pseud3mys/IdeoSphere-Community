import { Idea, Post, DiscussionTopic, User } from '../types';
import { loadMockDataSet, getAllIdeas, getAllPosts } from './dataService';

const simulateApiDelay = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service de gestion des détails complémentaires (discussions, notations, versions)
 * Permet de charger les informations selon l'onglet actif
 */

export interface IdeaDetailsResult {
  idea: Idea;
  discussions?: DiscussionTopic[];
  ratings?: any[];
  versions?: Idea[];
}

export interface PostDetailsResult {
  post: Post;
  discussions?: DiscussionTopic[];
  replies?: any[];
}

/**
 * Récupère les discussions associées à une idée ou un post
 */
export async function fetchDiscussions(
  itemId: string,
  itemType: 'idea' | 'post'
): Promise<DiscussionTopic[]> {
  await simulateApiDelay(120);

  try {
    const data = await loadMockDataSet();
    let relatedDiscussions: DiscussionTopic[] = [];
    
    if (itemType === 'idea') {
      // Pour les idées, utiliser le champ discussionIds de l'idée
      const idea = data.ideas.find(i => i.id === itemId);
      
      if (idea && idea.discussionIds && idea.discussionIds.length > 0) {
        relatedDiscussions = data.discussions.filter(topic => 
          idea.discussionIds?.includes(topic.id)
        );
      }
    } else {
      // Pour les posts, utiliser le champ relatedPostIds des discussions
      relatedDiscussions = data.discussions.filter(topic => 
        topic.relatedPostIds?.includes(itemId)
      );
    }

    // Trier par date (plus récent en premier)
    relatedDiscussions.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return relatedDiscussions;
    
  } catch (error) {
    console.error(`❌ [API] fetchDiscussions - Erreur:`, error);
    return [];
  }
}

/**
 * Récupère les notations/évaluations d'une idée
 */
export async function fetchIdeaRatings(ideaId: string): Promise<any[]> {
  await simulateApiDelay(100);

  try {
    const { defaultRatingCriteria } = await import('../data/ratings');
    const ideas = await getAllIdeas();
    const idea = ideas.find(i => i.id === ideaId);
    
    if (!idea) {
      return [];
    }

    const ratings = defaultRatingCriteria.map(criterion => ({
      id: criterion.id,
      name: criterion.name,
      description: criterion.description,
      ideaId: ideaId,
      averageScore: idea.ratings?.[criterion.id] || 0,
      totalVotes: Math.floor(Math.random() * 50) + 10,
      userScore: null
    }));

    return ratings;
    
  } catch (error) {
    console.error(`[api] fetchIdeaRatings - Erreur:`, error);
    return [];
  }
}

/**
 * Récupère les réponses/commentaires d'un post
 */
export async function fetchPostReplies(postId: string): Promise<any[]> {
  await simulateApiDelay(90);

  try {
    const posts = await getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return [];
    }

    const replies = post.replies || [];
    replies.sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return replies;
  } catch (error) {
    console.error(`[api] fetchPostReplies - Erreur:`, error);
    return [];
  }
}

/**
 * Fonction unifiée pour récupérer tous les détails d'une idée selon l'onglet
 * Note : Pour l'onglet 'versions', utiliser directement fetchLineage de lineageService.ts
 */
export async function fetchIdeaTabDetails(
  ideaId: string, 
  tab: 'description' | 'discussions' | 'ratings' | 'lineage'
): Promise<IdeaDetailsResult | null> {
  try {
    const ideas = await getAllIdeas();
    const idea = ideas.find(i => i.id === ideaId);
    
    if (!idea) {
      return null;
    }

    const result: IdeaDetailsResult = { idea };

    switch (tab) {
      case 'discussions':
        result.discussions = await fetchDiscussions(ideaId, 'idea');
        break;
      case 'ratings':
        result.ratings = await fetchIdeaRatings(ideaId);
        break;
    }

    return result;
  } catch (error) {
    console.error(`[api] fetchIdeaTabDetails - Erreur:`, error);
    return null;
  }
}

/**
 * Fonction unifiée pour récupérer tous les détails d'un post selon l'onglet
 */
export async function fetchPostTabDetails(
  postId: string,
  tab: 'content' | 'discussions' | 'lineage'
): Promise<PostDetailsResult | null> {
  try {
    const posts = await getAllPosts();
    const post = posts.find(p => p.id === postId);
    
    if (!post) {
      return null;
    }

    const result: PostDetailsResult = { post };

    switch (tab) {
      case 'discussions':
        result.discussions = await fetchDiscussions(postId, 'post');
        break;
      case 'content':
        result.replies = await fetchPostReplies(postId);
        break;
    }

    return result;
  } catch (error) {
    console.error(`[api] fetchPostTabDetails - Erreur:`, error);
    return null;
  }
}