// src/api/contentEditService.ts
import apiClient from './apiClient';
import { Post, Idea } from '../types';

/**
 * Service API pour l'édition de contenu.
 * Gère les modifications de posts et d'idées via le backend.
 * Le backend applique strictement la règle des 5 minutes après création.
 */

/**
 * Édite un post existant.
 * @param postId - ID complet du post (ex: "posts/123") ou clé (ex: "123")
 * @param updates - Champs à modifier (content, tags, location)
 */
export async function updatePost(
  postId: string,
  updates: Partial<Pick<Post, 'content' | 'tags' | 'location'>>
): Promise<Post | null> {
  // Extraction de la clé si l'ID est au format ArangoDB (collection/key)
  const postKey = postId.includes('/') ? postId.split('/')[1] : postId;

  try {
    // Note : L'authentification est gérée automatiquement par apiClient via le token interceptor
    const response = await apiClient.put<Post>(`/posts/${postKey}`, updates);
    return response.data;
  } catch (error: any) {
    console.error(`Erreur lors de la mise à jour du post ${postId}:`, error);
    
    // Si l'erreur vient de la restriction des 5 minutes (403 Forbidden)
    if (error.response?.status === 403) {
      throw new Error("la modification a été interdite par le serveur.");
    }
    throw error;
  }
}

/**
 * Édite une idée existante.
 * @param ideaId - ID complet de l'idée ou clé
 * @param updates - Champs à modifier (title, summary, description, tags, location)
 */
export async function updateIdea(
  ideaId: string,
  updates: Partial<Pick<Idea, 'title' | 'summary' | 'description' | 'tags' | 'location'>>
): Promise<Idea | null> {
  const ideaKey = ideaId.includes('/') ? ideaId.split('/')[1] : ideaId;

  try {
    const response = await apiClient.put<Idea>(`/ideas/${ideaKey}`, updates);
    return response.data;
  } catch (error: any) {
    console.error(`Erreur lors de la mise à jour de l'idée ${ideaId}:`, error);
    
    if (error.response?.status === 403) {
      throw new Error("la modification a été interdite par le serveur.");
    }
    throw error;
  }
}