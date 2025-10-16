import { Idea, Post, User } from '../types';
import { extractHashtagsFromMultipleTexts } from '../utils/hashtagUtils';
import { loadMockDataSet, getUserById, getIdeaById, getPostById } from './dataService';

// Simuler un délai d'API
const simulateApiDelay = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service de gestion du contenu
 * Gère la création, modification et chargement progressif du contenu
 */

/**
 * Création d'une nouvelle idée
 */
export async function createIdeaOnApi(payload: {
  title: string;
  summary: string;
  description: string;
  location?: string;
  authorId: string;
  tags?: string[]; // ✅ Tags fournis par l'appelant (incluant les hashtags extraits)
  sourceIdeas?: string[];
  sourcePosts?: string[];
  sourceDiscussions?: string[];
}): Promise<Idea> {
  console.log(`[api] createIdeaOnApi - "${payload.title}"`);
  await simulateApiDelay(300);
  
  const creator = await getUserById(payload.authorId);
  if (!creator) {
    throw new Error('Créateur non trouvé');
  }
  
  const { defaultRatingCriteria } = await import('../data/ratings');
  
  // ✅ Utiliser les tags fournis, sinon extraire du titre, résumé et description (fallback)
  const finalTags = payload.tags && payload.tags.length > 0 
    ? payload.tags 
    : extractHashtagsFromMultipleTexts(
        payload.title,
        payload.summary,
        payload.description
      );
  
  const newIdea: Idea = {
    id: `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: payload.title,
    summary: payload.summary,
    description: payload.description,
    location: payload.location,
    creators: [creator],
    status: 'published',
    createdAt: new Date(),
    supportCount: 0,
    supporters: [],
    ratings: [],
    ratingCriteria: defaultRatingCriteria,
    tags: finalTags, // ✅ Utiliser les tags finaux (fournis ou extraits)
    discussionIds: [],
    sourceIdeas: payload.sourceIdeas || [],
    sourcePosts: payload.sourcePosts || [],
    sourceDiscussions: payload.sourceDiscussions || [],
    derivedIdeas: []
  };
  
  console.log(`[api] createIdeaOnApi - Créée: ${newIdea.id} avec ${finalTags.length} tags`);
  return newIdea;
}

/**
 * Création d'un nouveau post
 */
export async function createPostOnApi(payload: {
  content: string;
  location?: string;
  authorId: string;
  sourcePostIds?: string[];
  tags?: string[]; // Tags fournis par l'appelant (incluant les hashtags extraits)
}): Promise<Post> {
  console.log(`[api] createPostOnApi - Auteur: ${payload.authorId}`);
  await simulateApiDelay(200);
  
  const author = await getUserById(payload.authorId);
  if (!author) {
    throw new Error('Auteur non trouvé');
  }
  
  // Utiliser les tags fournis, sinon extraire du contenu (fallback)
  const finalTags = payload.tags && payload.tags.length > 0 
    ? payload.tags 
    : extractHashtagsFromMultipleTexts(payload.content);
  
  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content: payload.content,
    location: payload.location,
    author: author,
    createdAt: new Date(),
    supporters: [],
    supportCount: 0,
    replies: [],
    tags: finalTags,
    linkedContent: [],
    derivedIdeas: [],
    derivedPosts: [],
    sourcePosts: payload.sourcePostIds || []
  };
  
  console.log(`[api] createPostOnApi - Créé: ${newPost.id} avec ${finalTags.length} tag(s)`);
  return newPost;
}

/**
 * Récupération des détails complets d'une idée
 */
export async function fetchIdeaDetails(ideaId: string): Promise<Idea | null> {
  console.log(`[api] fetchIdeaDetails - ${ideaId}`);
  await simulateApiDelay(100);
  
  const idea = await getIdeaById(ideaId);
  
  if (idea) {
    console.log(`[api] fetchIdeaDetails - Trouvée: "${idea.title}"`);
    return idea;
  }
  
  console.log(`[api] fetchIdeaDetails - Non trouvée: ${ideaId}`);
  return null;
}

/**
 * Récupération des détails complets d'un post
 */
export async function fetchPostDetails(postId: string): Promise<Post | null> {
  console.log(`[api] fetchPostDetails - ${postId}`);
  await simulateApiDelay(100);
  
  const post = await getPostById(postId);
  
  if (post) {
    console.log(`[api] fetchPostDetails - Trouvé`);
    return post;
  }
  
  console.log(`[api] fetchPostDetails - Non trouvé: ${postId}`);
  return null;
}

/**
 * Récupère le profil complet d'un utilisateur
 */
export async function fetchUserProfileFromApi(userId: string): Promise<User | null> {
  console.log(`[api] fetchUserProfileFromApi - ${userId}`);
  await simulateApiDelay(150);
  
  const user = await getUserById(userId);
  
  if (user) {
    console.log(`[api] fetchUserProfileFromApi - Trouvé: ${user.name}`);
    return user;
  }
  
  console.log(`[api] fetchUserProfileFromApi - Non trouvé: ${userId}`);
  return null;
}
