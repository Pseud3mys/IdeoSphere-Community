import { User, Idea, Post, DiscussionTopic } from '../types';

/**
 * Service de données pur - Point d'accès unique aux données mockées
 * Toutes les autres APIs doivent passer par ce service pour accéder aux données
 */

// Interface pour les données complètes
export interface MockDataSet {
  ideas: Idea[];
  posts: Post[];
  users: User[];
  currentUser: User;
  guestUser: User;
  discussions: DiscussionTopic[];
}

// Cache pour éviter les imports multiples
let mockDataCache: MockDataSet | null = null;

/**
 * Charge et retourne toutes les données mockées
 * @returns Ensemble complet des données mockées
 */
export async function loadMockDataSet(): Promise<MockDataSet> {
  if (mockDataCache) {
    return mockDataCache;
  }

  try {
    const [
      { mockIdeas },
      { mockPosts },
      { currentUser, users, guestUser },
      { discussionTopics }
    ] = await Promise.all([
      import('../data/ideas'),
      import('../data/posts'),
      import('../data/users'),
      import('../data/discussions')
    ]);

    mockDataCache = {
      ideas: mockIdeas || [],
      posts: mockPosts || [],
      users: users || [],
      currentUser,
      guestUser,
      discussions: discussionTopics || []
    };

    return mockDataCache;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des données mockées:', error);
    // Retourner un dataset vide en cas d'erreur
    return {
      ideas: [],
      posts: [],
      users: [],
      currentUser: {
        id: 'error-user',
        name: 'Erreur',
        email: '',
        bio: '',
        avatar: '',
        createdAt: new Date(),
        isRegistered: false
      },
      guestUser: {
        id: 'guest-error',
        name: 'Invité',
        email: '',
        bio: '',
        avatar: '',
        createdAt: new Date(),
        isRegistered: false
      },
      discussions: []
    };
  }
}

/**
 * Invalide le cache des données mockées
 * Utile pour forcer un rechargement des données
 */
export function invalidateMockDataCache(): void {
  mockDataCache = null;
}

/**
 * Retourne un utilisateur par ID
 * @param userId - ID de l'utilisateur
 * @returns Utilisateur trouvé ou null
 */
export async function getUserById(userId: string): Promise<User | null> {
  const data = await loadMockDataSet();
  const allUsers = [data.guestUser, data.currentUser, ...data.users];
  return allUsers.find(user => user.id === userId) || null;
}

/**
 * Retourne un utilisateur par email
 * @param email - Email de l'utilisateur
 * @returns Utilisateur trouvé ou null
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const data = await loadMockDataSet();
  const allUsers = [data.guestUser, data.currentUser, ...data.users];
  return allUsers.find(user => user.email?.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Retourne une idée par ID
 * @param ideaId - ID de l'idée
 * @returns Idée trouvée ou null
 */
export async function getIdeaById(ideaId: string): Promise<Idea | null> {
  const data = await loadMockDataSet();
  return data.ideas.find(idea => idea.id === ideaId) || null;
}

/**
 * Retourne un post par ID
 * @param postId - ID du post
 * @returns Post trouvé ou null
 */
export async function getPostById(postId: string): Promise<Post | null> {
  const data = await loadMockDataSet();
  return data.posts.find(post => post.id === postId) || null;
}

/**
 * Retourne toutes les idées d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @returns Liste des idées de l'utilisateur
 */
export async function getIdeasByUserId(userId: string): Promise<Idea[]> {
  const data = await loadMockDataSet();
  return data.ideas.filter(idea => 
    idea.creators?.some(creator => creator.id === userId)
  );
}

/**
 * Retourne tous les posts d'un utilisateur
 * @param userId - ID de l'utilisateur
 * @returns Liste des posts de l'utilisateur
 */
export async function getPostsByUserId(userId: string): Promise<Post[]> {
  const data = await loadMockDataSet();
  return data.posts.filter(post => post.author.id === userId);
}

/**
 * Retourne toutes les discussions
 * @returns Liste de toutes les discussions
 */
export async function getAllDiscussions(): Promise<DiscussionTopic[]> {
  const data = await loadMockDataSet();
  return data.discussions;
}

/**
 * Retourne toutes les idées
 * @returns Liste de toutes les idées
 */
export async function getAllIdeas(): Promise<Idea[]> {
  const data = await loadMockDataSet();
  return data.ideas;
}

/**
 * Retourne tous les posts
 * @returns Liste de tous les posts
 */
export async function getAllPosts(): Promise<Post[]> {
  const data = await loadMockDataSet();
  return data.posts;
}

/**
 * Retourne tous les utilisateurs
 * @returns Liste de tous les utilisateurs (incluant currentUser et guestUser)
 */
export async function getAllUsers(): Promise<User[]> {
  const data = await loadMockDataSet();
  return [data.guestUser, data.currentUser, ...data.users];
}