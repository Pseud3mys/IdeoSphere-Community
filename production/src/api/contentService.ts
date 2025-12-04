// src/services/contentService.ts

import { Idea, Post, User, Location } from '../types';
import apiClient from './apiClient';
import { transformIdea, transformPost, transformUser, RawIdea, RawPost, RawUser } from './transformService';

interface CreateIdeaPayload {
  authorId: string;
  title: string;
  description: string;
  summary?: string;
  tags?: string[];
  location?: Location | string;
  // Les champs spécifiques que le frontend envoie
  sourceIdeas?: string[];
  sourcePosts?: string[];
  sourceDiscussions?: string[];
  groupIds?: string[];
}

interface CreatePostPayload {
  authorId: string;
  content: string;
  type?: 'general' | 'question' | 'suggestion' | 'technical'; 
  title?: string;
  tags?: string[];
  location?: Location | string;
  author?: User; // Added to match usage in apiActions
  groupIds?: string[]; // Added to match usage in apiActions
  // Les champs spécifiques que le frontend envoie
  sourceIdeas?: string[];
  sourcePosts?: string[];
  sourcePostIds?: string[]; // bug... ne devrait pas être appelé comme ça.
}

/**
 * Crée une nouvelle idée.
 * Corresponds à POST /ideas
 */
export async function createIdeaOnApi(payload: CreateIdeaPayload): Promise<Idea | null> {
  console.log(`[API] createIdeaOnApi - "${payload.title}"`);
  try {
    // 1. Agréger toutes les sources en un seul tableau `sourceIds`
    const sourceIds = [
      ...(payload.sourceIdeas || []),
      ...(payload.sourcePosts || []),
      ...(payload.sourceDiscussions || []),
    ];
    // 2. Préparer le payload final pour l'API, en retirant les clés spécifiques
    const { sourceIdeas, sourcePosts, sourceDiscussions, ...basePayload } = payload;
    const apiPayload = {
      ...basePayload,
      sourceIds: sourceIds, // L'API recevra la clé générique `sourceIds`
    };
    const response = await apiClient.post<RawIdea>('/ideas', apiPayload);
    
    return transformIdea(response.data);
  } catch (error) {
    console.error('❌ Error creating idea:', error);
    return null;
  }
}

/**
 * Crée un nouveau post.
 * Corresponds à POST /posts
 */
export async function createPostOnApi(payload: CreatePostPayload): Promise<Post | null> {
  console.log(`[API] createPostOnApi - Auteur: ${payload.authorId}`);
  try {
    // 1. Agréger toutes les sources en un seul tableau `sourceIds`
    const sourceIds = [
      ...(payload.sourceIdeas || []),
      ...(payload.sourcePosts || []),
      ...(payload.sourcePostIds || []),
    ];

    // 2. Préparer le payload final pour l'API
    const { sourceIdeas, sourcePosts, sourcePostIds, ...basePayload } = payload;
    const apiPayload = {
      ...basePayload,
      sourceIds: sourceIds,
    };
    
    // 3. Envoyer le payload agrégé à l'API
    const response = await apiClient.post<RawPost>('/posts', apiPayload);

    return transformPost(response.data, new Map());
  } catch (error) {
    console.error('❌ Error creating post:', error);
    return null;
  }
}

/**
 * Récupère les détails complets d'une idée.
 * Corresponds à GET /ideas/{key}
 */
export async function fetchIdeaDetails(ideaId: string): Promise<{ idea: Idea; users: User[] } | null> {
  console.log(`[API] fetchIdeaDetails - ${ideaId}`);
  try {
    const ideaKey = ideaId.split('/')[1];
    const response = await apiClient.get<{ content: RawIdea, users: RawUser[] }>(`/ideas/${ideaKey}`);
    
    // Transformer la liste brute des utilisateurs
    const users = response.data.users.map(transformUser);
    
    // Créer une map pour la transformation de l'idée, si nécessaire
    const usersMap = new Map(users.map(u => [u.id, u]));
    
    // Transformer l'idée brute
    const idea = transformIdea(response.data.content);

    // Retourner l'objet combiné
    return { idea, users };
  } catch (error) {
    console.error(`❌ Error fetching idea ${ideaId}:`, error);
    return null;
  }
}

/**
 * Récupère les détails complets d'un post.
 * Corresponds à GET /posts/{key}
 */
export async function fetchPostDetails(postId: string): Promise<{ post: Post; users: User[] } | null> {
  console.log(`[API] fetchPostDetails - ${postId}`);
  try {
    const postKey = postId.split('/')[1];
    const response = await apiClient.get<{ content: RawPost, users: RawUser[] }>(`/posts/${postKey}`);

    // Transformer la liste brute des utilisateurs
    const users = response.data.users.map(transformUser);
    
    // Créer une map pour la transformation du post
    const usersMap = new Map(users.map(u => [u.id, u]));
    
    // Transformer le post brut
    const post = transformPost(response.data.content, usersMap);

    // Retourner l'objet combiné
    return { post, users };
  } catch (error) {
    console.error(`❌ Error fetching post ${postId}:`, error);
    return null;
  }
}

/**
 * Récupère le profil complet d'un utilisateur.
 * Corresponds à GET /users/{key}
 */
export async function fetchUserProfileFromApi(userId: string): Promise<User | null> {
  console.log(`[API] fetchUserProfileFromApi - ${userId}`);
  try {
    const userKey = userId.split('/')[1];
    const response = await apiClient.get<RawUser>(`/users/${userKey}`);
    return transformUser(response.data);
  } catch (error) {
    console.error(`❌ Error fetching user ${userId}:`, error);
    return null;
  }
}

/**
 * Met à jour le profil de l'utilisateur.
 * @param userId - L'ID interne de l'utilisateur (ex: '12345')
 * @param data - Les données à mettre à jour (name, bio, location, avatar, etc.)
 */
export async function updateUserProfileOnApi(userId: string, data: Partial<User>): Promise<User> {
  try {
    // La route backend est PATCH /users/<user_key>
    const response = await apiClient.patch(`/${userId}`, data);
    return transformUser(response.data);
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du profil:", error);
    throw error;
  }
}

/**
 * Supprime le compte utilisateur.
 * - Supprime le compte Keycloak (SSO)
 * - Anonymise les données dans la base de données
 * @param userId - L'ID interne de l'utilisateur
 */
export async function deleteUserAccountOnApi(userId: string): Promise<void> {
  try {
    // La route backend est DELETE /users/<user_key>
    await apiClient.delete(`/${userId}`);
    console.log("✅ Compte supprimé avec succès.");
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du compte:", error);
    throw error;
  }
}