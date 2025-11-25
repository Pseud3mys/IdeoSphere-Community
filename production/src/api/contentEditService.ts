// src/api/contentEditService.ts
import apiClient from './apiClient';
import { Post, Idea } from '../types';
import { transformPost, transformIdea } from './transformService';

/**
 * Service API pour l'édition de contenu.
 * Gère les modifications de posts et d'idées via le backend.
 * Transforme les données brutes du backend en objets utilisables par le frontend.
 */

/**
 * Fonction utilitaire pour normaliser les erreurs d'édition.
 */
const handleEditError = (error: any, context: string) => {
  console.error(`Erreur lors de la modification (${context}):`, error);

  if (error.response) {
    const { status, data } = error.response;
    const backendMessage = (data?.message || '').toLowerCase();

    // Gestion des erreurs 403 (Forbidden)
    if (status === 403) {
      if (backendMessage.includes('5 minutes') || backendMessage.includes('délai')) {
        throw new Error("Le délai de 5 minutes pour modifier ce contenu est écoulé.");
      }
      if (backendMessage.includes('auteur') || backendMessage.includes('author')) {
        throw new Error("Vous n'avez pas les droits nécessaires pour modifier ce contenu.");
      }
      throw new Error("Modification refusée par le serveur.");
    }

    if (status === 404) {
      throw new Error("Le contenu est introuvable ou a été supprimé.");
    }
    
    if (status === 400) {
      throw new Error("Données invalides.");
    }
  }

  throw new Error("Impossible de joindre le serveur ou erreur inconnue.");
};

/**
 * Édite un post existant.
 */
export async function updatePost(
  postId: string,
  updates: Partial<Pick<Post, 'content' | 'tags' | 'location'>>
): Promise<Post | null> {
  const postKey = postId.includes('/') ? postId.split('/')[1] : postId;

  try {
    // On reçoit un objet brut (RawPost/RawContent) du backend
    const response = await apiClient.put<any>(`/posts/${postKey}`, updates);
    
    // On le transforme en objet Post propre
    // Note : on passe une Map vide pour les users car l'update ne renvoie pas les profils
    // (ce n'est pas bloquant car transformPost utilise raw.creators[0] pour l'authorId)
    return transformPost(response.data, new Map());
  } catch (error: any) {
    return handleEditError(error, `Post ${postId}`);
  }
}

/**
 * Édite une idée existante.
 */
export async function updateIdea(
  ideaId: string,
  updates: Partial<Pick<Idea, 'title' | 'summary' | 'description' | 'tags' | 'location'>>
): Promise<Idea | null> {
  const ideaKey = ideaId.includes('/') ? ideaId.split('/')[1] : ideaId;

  try {
    // On reçoit un objet brut (RawIdea/RawContent)
    const response = await apiClient.put<any>(`/ideas/${ideaKey}`, updates);
    
    // On le transforme en objet Idea propre
    return transformIdea(response.data);
  } catch (error: any) {
    return handleEditError(error, `Idea ${ideaId}`);
  }
}