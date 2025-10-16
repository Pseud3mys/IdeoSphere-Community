// src/services/contentService.ts

import { Idea, Post, User } from '../types';
import apiClient from './apiClient';
import { transformIdea, transformPost, transformUser, RawIdea, RawPost, RawUser } from './transformService';

interface CreateIdeaPayload {
  authorId: string;
  title: string;
  description: string;
  summary?: string;
  tags?: string[];
  location?: string;
  // Les champs spécifiques que le frontend envoie
  sourceIdeas?: string[];
  sourcePosts?: string[];
  sourceDiscussions?: string[];
}

interface CreatePostPayload {
  authorId: string;
  content: string;
  type: 'general' | 'question' | 'suggestion' | 'technical'; 
  title?: string;
  tags?: string[];
  location?: string;
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
    
    return transformIdea(response.data, new Map());
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
export async function fetchIdeaDetails(ideaId: string): Promise<Idea | null> {
  console.log(`[API] fetchIdeaDetails - ${ideaId}`);
  try {
    const ideaKey = ideaId.split('/')[1];
    const response = await apiClient.get<{ content: RawIdea, users: RawUser[] }>(`/ideas/${ideaKey}`);
    const usersMap = new Map(response.data.users.map(u => [u._id, transformUser(u)]));
    return transformIdea(response.data.content, usersMap);
  } catch (error) {
    console.error(`❌ Error fetching idea ${ideaId}:`, error);
    return null;
  }
}

/**
 * Récupère les détails complets d'un post.
 * Corresponds à GET /posts/{key}
 */
export async function fetchPostDetails(postId: string): Promise<Post | null> {
  console.log(`[API] fetchPostDetails - ${postId}`);
  try {
    const postKey = postId.split('/')[1];
    const response = await apiClient.get<{ content: RawPost, users: RawUser[] }>(`/posts/${postKey}`);
    const usersMap = new Map(response.data.users.map(u => [u._id, transformUser(u)]));
    return transformPost(response.data.content, usersMap);
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