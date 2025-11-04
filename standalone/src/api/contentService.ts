import { Idea, Post, User } from '../types';
import { extractHashtagsFromMultipleTexts } from '../utils/hashtagUtils';
import { loadMockDataSet, getUserById, getIdeaById, getPostById, addDynamicIdea, addDynamicPost, addDynamicUser } from './dataService';
import { getValidAvatar } from './avatarService';

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
    creatorIds: [payload.authorId], // ✅ Utiliser creatorIds (array d'IDs) au lieu de creators
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
  
  // ✅ Ajouter l'idée au cache dynamique pour qu'elle soit accessible via getIdeaById
  addDynamicIdea(newIdea);
  
  console.log(`[api] createIdeaOnApi - Créée: ${newIdea.id} avec ${finalTags.length} tags`);
  return newIdea;
}

/**
 * Création d'un nouveau post
 */
export async function createPostOnApi(payload: {
  title?: string;
  content: string;
  location?: string;
  authorId: string;
  author?: User; // ✅ Objet author optionnel pour éviter de chercher dans les données mockées
  sourcePostIds?: string[];
  tags?: string[]; // Tags fournis par l'appelant (incluant les hashtags extraits)
}): Promise<Post> {
  console.log(`[api] createPostOnApi - Auteur: ${payload.authorId}`);
  await simulateApiDelay(200);
  
  // ✅ Utiliser l'auteur fourni ou le chercher par ID
  let author: User | null = payload.author || null;
  if (!author) {
    author = await getUserById(payload.authorId);
  }
  
  if (!author) {
    throw new Error(`L'auteur '${payload.authorId}' n'existe pas.`);
  }
  
  // Utiliser les tags fournis, sinon extraire du contenu (fallback)
  const finalTags = payload.tags && payload.tags.length > 0 
    ? payload.tags 
    : extractHashtagsFromMultipleTexts(payload.content);
  
  const newPost: Post = {
    id: `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: payload.title,
    content: payload.content,
    location: payload.location,
    authorId: payload.authorId,
    createdAt: new Date(),
    supporters: [],
    supportCount: 0,
    replies: [],
    tags: finalTags,
    derivedIdeas: [],
    derivedPosts: [],
    sourcePosts: payload.sourcePostIds || []
  };
  
  // ✅ Ajouter le post au cache dynamique pour qu'il soit accessible via getPostById
  addDynamicPost(newPost);
  
  console.log(`[api] createPostOnApi - Créé: ${newPost.id} avec ${finalTags.length} tag(s)`);
  return newPost;
}

/**
 * Récupération des détails complets d'une idée avec ses créateurs
 * @returns { idea, users } où users contient tous les créateurs de l'idée
 */
export async function fetchIdeaDetails(ideaId: string): Promise<{ idea: Idea; users: User[] } | null> {
  await simulateApiDelay(100);
  
  const idea = await getIdeaById(ideaId);
  
  if (!idea) {
    return null;
  }
  
  // Récupérer tous les créateurs de l'idée
  const users: User[] = [];
  if (idea.creatorIds && idea.creatorIds.length > 0) {
    for (const creatorId of idea.creatorIds) {
      const creator = await getUserById(creatorId);
      if (creator) {
        users.push(creator);
      }
    }
  }
  
  return { idea, users };
}

/**
 * Récupération des détails complets d'un post avec son auteur
 * @returns { post, users } où users contient l'auteur du post
 */
export async function fetchPostDetails(postId: string): Promise<{ post: Post; users: User[] } | null> {
  await simulateApiDelay(100);
  
  const post = await getPostById(postId);
  
  if (!post) {
    return null;
  }
  
  // Récupérer l'auteur du post
  const users: User[] = [];
  if (post.authorId) {
    const author = await getUserById(post.authorId);
    if (author) {
      users.push(author);
    }
  }
  
  return { post, users };
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

/**
 * Création d'un compte utilisateur
 */
export async function createUserAccountOnApi(userData: {
  name: string;
  email: string;
  address?: string;
  bio?: string;
  birthYear?: number;
}): Promise<User> {
  console.log(`[api] createUserAccountOnApi - ${userData.email}`);
  await simulateApiDelay(250);
  
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: userData.name,
    email: userData.email,
    avatar: getValidAvatar(userData.name),
    bio: userData.bio || 'Nouveau membre de la communauté IdeoSphere',
    address: userData.address,
    birthYear: userData.birthYear || new Date().getFullYear() - 25,
    createdAt: new Date(),
    isRegistered: true
  };
  
  // ✅ Ajouter l'utilisateur au cache dynamique pour qu'il soit accessible via getUserById
  addDynamicUser(newUser);
  
  console.log(`[api] createUserAccountOnApi - Créé: ${newUser.name}`);
  return newUser;
}

/**
 * Mise à jour du profil utilisateur
 */
export async function updateUserProfileOnApi(userId: string, updates: Partial<User>): Promise<User | null> {
  console.log(`[api] updateUserProfileOnApi - ${userId}`, updates);
  await simulateApiDelay(200);
  
  // Récupérer l'utilisateur actuel
  const user = await getUserById(userId);
  
  if (!user) {
    console.error(`[api] updateUserProfileOnApi - Utilisateur non trouvé: ${userId}`);
    return null;
  }
  
  // Fusionner les mises à jour avec l'utilisateur existant
  const updatedUser: User = {
    ...user,
    ...updates,
    // S'assurer que l'ID et createdAt ne sont pas modifiés
    id: user.id,
    createdAt: user.createdAt
  };
  
  // Si le nom a changé et qu'il n'y a pas de nouvel avatar, générer un nouvel avatar par défaut
  if (updates.name && updates.name !== user.name && !updates.avatar) {
    updatedUser.avatar = getValidAvatar(updates.name, user.avatar);
  }
  
  console.log(`[api] updateUserProfileOnApi - Mis à jour: ${updatedUser.name}`);
  return updatedUser;
}
