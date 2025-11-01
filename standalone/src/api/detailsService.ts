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
  users?: User[]; // ✅ Ajout des utilisateurs pour les discussions
  ratings?: any[];
  versions?: Idea[];
}

export interface PostDetailsResult {
  post: Post;
  discussions?: DiscussionTopic[];
  users?: User[]; // ✅ Ajout des utilisateurs pour les discussions
  replies?: any[];
}

/**
 * Récupère les discussions associées à une idée ou un post
 * @returns { discussions: DiscussionTopic[], users: User[] } - Les discussions et les utilisateurs associés
 */
export async function fetchDiscussions(
  itemId: string,
  itemType: 'idea' | 'post'
): Promise<{ discussions: DiscussionTopic[], users: User[] }> {
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

    // ✅ Extraire tous les IDs utilisateurs des discussions et posts de discussion
    const userIds = new Set<string>();
    relatedDiscussions.forEach(discussion => {
      // Ajouter l'auteur du topic
      userIds.add(discussion.authorId);
      
      // Ajouter les auteurs de tous les posts dans cette discussion
      discussion.posts.forEach(post => {
        userIds.add(post.authorId);
      });
      
      // Ajouter les IDs des utilisateurs qui ont upvoté le topic
      discussion.upvotes?.forEach(userId => userIds.add(userId));
      
      // Ajouter les IDs des utilisateurs qui ont upvoté les posts
      discussion.posts.forEach(post => {
        post.upvotes?.forEach(userId => userIds.add(userId));
      });
    });

    // ✅ Récupérer les objets User correspondants
    const users = data.users.filter(user => userIds.has(user.id));

    console.log(`✅ [API] fetchDiscussions - ${relatedDiscussions.length} discussions, ${users.length} utilisateurs`);

    return {
      discussions: relatedDiscussions,
      users: users
    };
    
  } catch (error) {
    console.error(`❌ [API] fetchDiscussions - Erreur:`, error);
    return { discussions: [], users: [] };
  }
}

/**
 * Récupère les notations/évaluations d'une idée
 */
export async function fetchIdeaRatings(ideaId: string): Promise<any[]> {
  await simulateApiDelay(100);

  try {
    const ideas = await getAllIdeas();
    const idea = ideas.find(i => i.id === ideaId);
    
    if (!idea) {
      console.log(`⚠️ [API] fetchIdeaRatings - Idée ${ideaId} non trouvée`);
      return [];
    }

    // ✅ Retourner le tableau de ratings de l'idée (peut être undefined)
    const ratings = idea.ratings || [];
    console.log(`✅ [API] fetchIdeaRatings - ${ratings.length} évaluations trouvées pour idée ${ideaId}`);
    
    return ratings;
    
  } catch (error) {
    console.error(`❌ [API] fetchIdeaRatings - Erreur:`, error);
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
      case 'discussions': {
        const { discussions, users } = await fetchDiscussions(ideaId, 'idea');
        result.discussions = discussions;
        result.users = users;
        break;
      }
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
      case 'discussions': {
        const { discussions, users } = await fetchDiscussions(postId, 'post');
        result.discussions = discussions;
        result.users = users;
        break;
      }
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