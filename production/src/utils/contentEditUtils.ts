/**
 * Utilitaires pour la modification de contenu
 * Gère la logique de permission d'édition dans les 5 minutes suivant la publication
 */

import { Idea, Post, User } from '../types';

/**
 * Délai de modification autorisé après publication (en millisecondes)
 */
const EDIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Vérifie si un post peut être modifié
 * Un post est modifiable si :
 * - Moins de 5 minutes se sont écoulées depuis sa création
 * - L'utilisateur actuel est l'auteur du post
 */
export function canEditPost(post: Post, currentUser: User | null): boolean {
  console.log('🔍 [canEditPost] Vérification:', {
    postId: post?.id,
    postAuthorId: post?.authorId,
    currentUserId: currentUser?.id,
    postCreatedAt: post?.createdAt,
    hasCurrentUser: !!currentUser,
    hasPost: !!post
  });
  
  if (!currentUser || !post) {
    console.log('❌ [canEditPost] Utilisateur ou post manquant');
    return false;
  }
  
  // Vérifier que l'utilisateur est l'auteur
  if (post.authorId !== currentUser.id) {
    console.log('❌ [canEditPost] Utilisateur n\'est pas l\'auteur');
    return false;
  }
  
  // Vérifier que moins de 5 minutes se sont écoulées
  const now = new Date().getTime();
  const createdAt = post.createdAt instanceof Date ? post.createdAt.getTime() : new Date(post.createdAt).getTime();
  const elapsedTime = now - createdAt;
  
  console.log('⏱️  [canEditPost] Temps écoulé:', {
    elapsedTimeMs: elapsedTime,
    elapsedTimeSec: Math.floor(elapsedTime / 1000),
    maxAllowedMs: EDIT_WINDOW_MS,
    canEdit: elapsedTime < EDIT_WINDOW_MS
  });
  
  return elapsedTime < EDIT_WINDOW_MS;
}

/**
 * Vérifie si une idée peut être modifiée
 * Une idée est modifiable si :
 * - Moins de 5 minutes se sont écoulées depuis sa création
 * - L'utilisateur actuel est un des créateurs de l'idée
 */
export function canEditIdea(idea: Idea, currentUser: User | null): boolean {
  console.log('🔍 [canEditIdea] Vérification:', {
    ideaId: idea?.id,
    ideaCreatorIds: idea?.creatorIds,
    currentUserId: currentUser?.id,
    ideaCreatedAt: idea?.createdAt,
    hasCurrentUser: !!currentUser,
    hasIdea: !!idea
  });
  
  if (!currentUser || !idea) {
    console.log('❌ [canEditIdea] Utilisateur ou idée manquant');
    return false;
  }
  
  // Vérifier que l'utilisateur est un des créateurs
  if (!idea.creatorIds || !idea.creatorIds.includes(currentUser.id)) {
    console.log('❌ [canEditIdea] Utilisateur n\'est pas un créateur');
    return false;
  }
  
  // Vérifier que moins de 5 minutes se sont écoulées
  const now = new Date().getTime();
  const createdAt = idea.createdAt instanceof Date ? idea.createdAt.getTime() : new Date(idea.createdAt).getTime();
  const elapsedTime = now - createdAt;
  
  console.log('⏱️  [canEditIdea] Temps écoulé:', {
    elapsedTimeMs: elapsedTime,
    elapsedTimeSec: Math.floor(elapsedTime / 1000),
    maxAllowedMs: EDIT_WINDOW_MS,
    canEdit: elapsedTime < EDIT_WINDOW_MS
  });
  
  return elapsedTime < EDIT_WINDOW_MS;
}

/**
 * Calcule le temps restant pour modifier un contenu (en secondes)
 * Retourne 0 si le délai est dépassé
 */
export function getEditTimeRemaining(createdAt: Date): number {
  const now = new Date().getTime();
  const createdTime = createdAt instanceof Date ? createdAt.getTime() : new Date(createdAt).getTime();
  const elapsedTime = now - createdTime;
  const remainingMs = Math.max(0, EDIT_WINDOW_MS - elapsedTime);
  
  return Math.floor(remainingMs / 1000); // Convertir en secondes
}

/**
 * Formate le temps restant en format lisible (ex: "4 min 30 s")
 */
export function formatEditTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes} min ${remainingSeconds} s`;
  }
  
  return `${remainingSeconds} s`;
}
