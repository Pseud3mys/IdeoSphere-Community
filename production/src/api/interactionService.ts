// src/services/interactionService.ts
import apiClient from './apiClient';
import { PostReply, Post, Rating, DiscussionTopic } from '../types';
import { transformComment, transformUser, RawComment, RawUser, transformPostToDiscussion, transformFeedbackToRatings, RawFeedback } from './transformService';

/**
 * Ajoute ou retire le soutien d'un utilisateur à une idée.
 * Corresponds à POST/DELETE /feedback
 */
export async function toggleSupportOnApi(contentId: string, userId: string, contentType: string, isCurrentlySupporting: boolean): Promise<{ success: boolean }> {
  console.log(`🔄 [API] Toggle soutien pour ${contentId}`);
  console.log(`🔄 [API] État actuel du soutien: ${isCurrentlySupporting}`);
  try {
    if (isCurrentlySupporting) {
      await apiClient.delete('/feedback', { params: { userId, contentId } });
    } else {
      await apiClient.post('/feedback', { userId, contentId, type: 'supports' });
    }
    // Si l'appel réussit (pas d'erreur), retourner un objet avec success: true
    return { success: true };
  } catch (error) {
    console.error(`❌ Error toggling support for ${contentId}:`, error);
    // En cas d'erreur, retourner un objet avec success: false
    return { success: false };
  }
}

/**
 * Permet à un utilisateur d'évaluer une idée selon un critère.
 * Corresponds à PUT /feedback
 */
export async function rateIdeaOnApi(ideaId: string, userId: string, criterionId: string, value: number): Promise<{ success: boolean, ratings: Rating[] }> {
  console.log(`🔄 [API] Évaluation pour ${ideaId}`);
  try {
    const ideaKey = ideaId.split('/')[1];
    const payload = {
        userId,
        rating: { criterionName: criterionId, value: value }
    };
    const response = await apiClient.post<RawFeedback[]>(`/ideas/${ideaKey}/rate`, payload);
    
    // CORRECTION: Transformer la réponse brute en format Rating[] attendu par le hook
    const ratings = transformFeedbackToRatings(response.data);

    return { success: true, ratings: ratings };

  } catch (error) {
    console.error(`❌ Error rating content ${ideaId}:`, error);
    return { success: false, ratings: [] };
  }
}
/**
 * Enregistre un signalement de contenu inapproprié.
 * Corresponds à POST /feedback avec type='reports'
 */
export async function reportContentOnApi(contentId: string, userId: string, reason: string): Promise<any> {
  console.log(`🔄 [API] Signalement pour ${contentId} par ${userId} pour raison: ${reason}`);
  try {
    return await apiClient.post('/feedback', { userId, contentId, type: 'reports' });
  } catch (error) {
    console.error(`❌ Error reporting content ${contentId}:`, error);
  }
}

/**
 * Ajoute une nouvelle réponse à un post.
 * Corresponds à POST /posts/{key}/comments
 */
export async function addPostReplyOnApi(postId: string, userId: string, content: string): Promise<PostReply | null> {
  try {
    const postKey = postId.split('/')[1];
    const payload = { authorId: userId, content: content };
    const response = await apiClient.post<{ comment: RawComment, user: RawUser }>(`/posts/${postKey}/comments`, payload);
    const usersMap = new Map([[response.data.user._id, transformUser(response.data.user)]]);
    return transformComment(response.data.comment, usersMap);
  } catch (error) {
    console.error(`❌ Error adding reply to post ${postId}:`, error);
    return null;
  }
}

/**
 * Ajoute ou retire le "like" sur une réponse à un post.
 * Corresponds à POST /posts/{key}/comments/{replyId}/upvote
 */
export async function togglePostReplyLikeOnApi(postId: string, replyId: string, userId: string): Promise<{ upvotes: string[] } | null> {
  console.log(`🔄 [API] Toggle like pour commentaire ${replyId}`);
  try {
    const postKey = postId.split('/')[1];
    const response = await apiClient.post(`/posts/${postKey}/comments/${replyId}/upvote`, { userId });
    return response.data;
  } catch (error) {
    console.error(`❌ Error toggling like for comment ${replyId}:`, error);
    return null;
  }
}

/**
 * Ajoute ou retire un vote positif sur un post dans une discussion (un commentaire).
 * C'est un alias pour togglePostReplyLikeOnApi.
 * @param topicId - L'ID du sujet de discussion parent (ex: 'posts/12345').
 * @param postId - L'ID du post/commentaire à voter.
 * @param userId - L'ID de l'utilisateur qui vote.
 */
export async function upvoteDiscussionPostOnApi(topicId: string, postId: string, userId: string): Promise<{ upvotes: string[] } | null> {
    console.log(`🔄 [API] Upvote pour le post de discussion ${postId} dans le topic ${topicId}`);
    // Un "post de discussion" est un commentaire, on réutilise donc la même fonction
    return togglePostReplyLikeOnApi(topicId, postId, userId);
}

/**
 * Crée un nouveau Post
 * @param ideaId L'ID de l'idée à laquelle ce sujet de discussion est rattaché.
 * @param userId L'ID de l'auteur du sujet de discussion.
 * @param data Les détails du sujet : titre, contenu et type.
 * @returns L'objet Post complet nouvellement créé, ou null en cas d'erreur.
 */
export async function createDiscussionTopicOnApi(
  ideaId: string,
  userId: string,
  data: {
    title: string;
    content: string;
    type: 'general' | 'question' | 'suggestion' | 'technical';
  }
): Promise<Post | null> {
  console.log(`🔄 [API] Création d'un topic de discussion pour l'idée ${ideaId}`);

  try {
    const payload = {
      authorId: userId,
      title: data.title,
      content: data.content,
      type: data.type,
      discussionForIdeaId: ideaId 
    };

    // L'appel à l'endpoint reste le même (POST /posts), mais le payload a changé.
    const response = await apiClient.post<Post>('/posts', payload);

    console.log('✅ [API] Topic de discussion (Post) créé et lié avec succès:', response.data);
    
    return response.data;

  } catch (error) {
    console.error(`❌ [API] Erreur lors de la création du topic pour l'idée ${ideaId}:`, error);
    return null;
  }
}

/**
 * Ajoute un nouveau commentaire (un post) à un topic de discussion (un Post parent).
 * @param topicOrId - L'ID complet du topic (chaîne) ou l'objet topic complet.
 * @param userId - L'ID de l'auteur du commentaire.
 * @param content - Le contenu textuel du commentaire.
 * @returns L'objet PostReply complet nouvellement créé, ou null en cas d'erreur.
 */
export async function createDiscussionPostOnApi(
  topicOrId: any, // On utilise 'any' pour accepter les deux types
  userId: string,
  content: string
): Promise<PostReply | null> {
  // --- DÉBUT DE LA CORRECTION ---
  let topicId: string;

  // On vérifie si on a reçu une chaîne de caractères (un ID) ou un objet
  if (typeof topicOrId === 'string') {
    topicId = topicOrId;
  } else if (topicOrId && typeof topicOrId === 'object') {
    // Si c'est un objet, on cherche la propriété `id` (frontend) ou `_id` (backend)
    topicId = topicOrId.id || topicOrId._id;
  } else {
    console.error('❌ [API] createDiscussionPostOnApi a été appelé avec un argument invalide pour le topic.');
    return null;
  }

  console.log(`🔄 [API] Ajout d'une réponse dans le topic ${topicId}`);

  if (!content || content.trim().length === 0) {
    console.log('❌ [API] Le contenu du post est vide.');
    return null;
  }

  try {
    const postKey = topicId.split('/')[1];
    const payload = { 
      authorId: userId, 
      content: content 
    };
    const response = await apiClient.post<PostReply>(`/posts/${postKey}/comments`, payload);
    console.log('✅ [API] Post de discussion (commentaire) créé avec succès !');
    return response.data;
  } catch (error) {
    console.error(`❌ [API] Erreur lors de l'ajout du post au topic ${topicId}:`, error);
    return null;
  }
}

/**
 * Marque un post de discussion (commentaire) comme réponse acceptée via l'API.
 * @param topic - L'objet du topic (le post parent).
 * @param post - L'objet du post à marquer (le commentaire).
 * @param userId - L'ID de l'utilisateur qui effectue l'action (pour validation).
 * @returns true si succès, false sinon.
 */
export async function markDiscussionPostAsAnswerOnApi(
  topic: any, // Le paramètre reçu est un objet, pas une chaîne
  post: any,  // Le paramètre reçu est un objet, pas une chaîne
  userId: string
): Promise<boolean> {
  // Le log confirme que des objets sont passés
  console.log(`🔄 [API] Marquer le post ${JSON.stringify(post, null, 2)} comme réponse dans le topic ${JSON.stringify(topic, null, 2)}`);

  try {
    // CORRECTION : On extrait les identifiants requis depuis les objets passés en paramètre.
    const topicIdString = topic._id; // On récupère la chaîne "posts/270270"
    const postIdString = post.id;    // On récupère l'ID unique du commentaire, ex: "fad05f4b-..."

    // On ajoute une sécurité pour s'assurer que les IDs sont bien des chaînes de caractères.
    if (typeof topicIdString !== 'string' || typeof postIdString !== 'string') {
        console.error('❌ [API] Les identifiants du topic ou du post sont invalides.');
        return false;
    }

    // 1. Extraire la clé du topic à partir de son ID complet (ex: "posts/270270" -> "270270")
    const topicKey = topicIdString.split('/')[1];

    // 2. Définir le payload.
    const payload = { userId: userId };

    // 3. Appeler la route de l'API avec les identifiants corrects.
    await apiClient.post(`/posts/${topicKey}/comments/${postIdString}/mark-as-answer`, payload);

    console.log('✅ [API] Post marqué comme réponse acceptée avec succès !');
    return true;

  } catch (error) {
    console.error(`❌ [API] Erreur lors du marquage du post comme réponse:`, error);
    return false;
  }
}

export async function getIdeaRatingsOnApi(ideaId: string): Promise<Rating[] | null> {
  console.log(`[API] getIdeaRatingsOnApi a été appelé pour ${ideaId}.`);
  try {
      const ideaKey = ideaId.split('/')[1];
      const response = await apiClient.get<RawFeedback[]>(`/ideas/${ideaKey}/feedback`);
      return transformFeedbackToRatings(response.data);
  } catch (error) {
      console.error(`❌ Error fetching ratings for idea ${ideaId}:`, error);
      return [];
  }
}


export async function ignoreContentOnApi(contentType: 'idea' | 'post', contentId: string, userId: string): Promise<boolean> {
  console.log(`LOG: ignoreContentOnApi a été appelé pour ${contentType} ${contentId} par ${userId}. Ce service nécessite un endpoint API dédié.`);
  // Simulation d'une réussite
  return Promise.resolve(true);
}

export async function shareContentOnApi(contentType: 'idea' | 'post', contentId: string, userId: string): Promise<string> {
  console.log(`LOG: shareContentOnApi a été appelé pour ${contentId}. Ce service ne nécessite pas d'API, il génère une URL côté client.`);
  return Promise.resolve(window.location.origin + `/${contentType}/${contentId}?ref=${userId}`);
}

export async function toggleUserFollowOnApi(targetUserId: string, currentUserId: string): Promise<boolean> {
  console.log(`LOG: toggleUserFollowOnApi a été appelé par ${currentUserId} pour suivre/unfollow ${targetUserId}. Ce service nécessite un endpoint API dédié.`);
  return Promise.resolve(true);
}

// jamais utilisée.
/*export async function upvoteDiscussionTopicOnApi(topicId: string, userId: string): Promise<boolean> {
  console.log(`LOG: upvoteDiscussionTopicOnApi a été appelé pour le topic ${topicId} par ${userId}. Ce service nécessite un endpoint API dédié.`);
  // Simuler une réussite
  return Promise.resolve(true);
}*/