import { loadMockDataSet, getUserById, getIdeaById, getPostById } from './dataService';

// Simuler un délai d'API
const simulateApiDelay = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service d'interactions utilisateur
 * Gère les likes, soutiens, et autres interactions
 */

/**
 * Interface pour le résultat du toggle de soutien (unifié pour idées et posts)
 */
export interface SupportResult {
  success: boolean;
  isSupporting: boolean;
  supportCount: number;
  supporters: any[]; // Pour idées: objets User, pour posts: IDs string
}

/**
 * Basculer le soutien d'un contenu (idée ou post)
 * @param contentId - ID du contenu (idée ou post)
 * @param userId - ID de l'utilisateur
 * @param contentType - Type de contenu ('idea' ou 'post')
 * @param isCurrentlySupporting - Indique si l'utilisateur soutient déjà le contenu (calculé dans les hooks)
 * @returns Résultat avec les nouvelles valeurs ou null si erreur
 */
export async function toggleSupportOnApi(
  contentId: string,
  userId: string,
  contentType: 'idea' | 'post',
  isCurrentlySupporting: boolean
): Promise<SupportResult | null> {
  await simulateApiDelay(150);
  
  console.log(`🔄 [API] Toggle soutien ${contentType}:`, contentId, 'par:', userId, 'actuellement:', isCurrentlySupporting);
  
  if (contentType === 'idea') {
    // IDÉE
    const [idea, user] = await Promise.all([
      getIdeaById(contentId),
      getUserById(userId)
    ]);
    
    if (!idea) {
      console.log('❌ [API] Idée non trouvée:', contentId);
      return null;
    }
    
    if (!user) {
      console.log('❌ [API] Utilisateur non trouvé:', userId);
      return null;
    }
    
    let newSupporters: any[];
    let newIsSupporting: boolean;
    
    if (isCurrentlySupporting) {
      newSupporters = (idea.supporters || []).filter(s => s.id !== userId);
      newIsSupporting = false;
      console.log('✅ [API] Soutien retiré pour idée:', idea.title);
    } else {
      newSupporters = [...(idea.supporters || []), user];
      newIsSupporting = true;
      console.log('✅ [API] Soutien ajouté pour idée:', idea.title);
    }
    
    // ✅ Calculer supportCount dynamiquement depuis la longueur du tableau
    const newSupportCount = newSupporters.length;
    
    return {
      success: true,
      isSupporting: newIsSupporting,
      supportCount: newSupportCount,
      supporters: newSupporters
    };
    
  } else {
    // POST
    const [post, user] = await Promise.all([
      getPostById(contentId),
      getUserById(userId)
    ]);
    
    if (!post) {
      console.log('❌ [API] Post non trouvé:', contentId);
      return null;
    }
    
    if (!user) {
      console.log('❌ [API] Utilisateur non trouvé:', userId);
      return null;
    }
    
    let newSupporters: string[];
    let newIsSupporting: boolean;
    
    if (isCurrentlySupporting) {
      newSupporters = (post.supporters || []).filter(id => id !== userId);
      newIsSupporting = false;
      console.log('✅ [API] Soutien retiré pour post');
    } else {
      newSupporters = [...(post.supporters || []), userId];
      newIsSupporting = true;
      console.log('✅ [API] Soutien ajouté pour post');
    }
    
    // ✅ Calculer supportCount dynamiquement depuis la longueur du tableau
    const newSupportCount = newSupporters.length;
    
    return {
      success: true,
      isSupporting: newIsSupporting,
      supportCount: newSupportCount,
      supporters: newSupporters
    };
  }
}

/**
 * @deprecated Utilisez toggleSupportOnApi avec contentType: 'idea' et isCurrentlySupporting
 */
export async function toggleIdeaSupportOnApi(
  ideaId: string, 
  userId: string
): Promise<SupportResult | null> {
  // Pour la rétrocompatibilité, calculer isCurrentlySupporting ici
  const idea = await getIdeaById(ideaId);
  const isCurrentlySupporting = idea?.supporters?.some(s => s.id === userId) || false;
  return toggleSupportOnApi(ideaId, userId, 'idea', isCurrentlySupporting);
}

/**
 * @deprecated Utilisez toggleSupportOnApi avec contentType: 'post' et isCurrentlySupporting
 */
export async function togglePostLikeOnApi(
  postId: string, 
  userId: string
): Promise<SupportResult | null> {
  // Pour la rétrocompatibilité, calculer isCurrentlySupporting ici
  const post = await getPostById(postId);
  const isCurrentlySupporting = post?.supporters?.includes(userId) || false;
  return toggleSupportOnApi(postId, userId, 'post', isCurrentlySupporting);
}

/**
 * Évaluer une idée selon un critère
 * @param ideaId - ID de l'idée
 * @param userId - ID de l'utilisateur
 * @param criterionId - ID du critère d'évaluation
 * @param value - Note donnée (1-5)
 * @returns true si succès, false sinon
 */
export async function rateIdeaOnApi(
  ideaId: string,
  userId: string,
  criterionId: string,
  value: number
): Promise<boolean> {
  await simulateApiDelay(120);
  
  // Validation de la note
  if (value < 1 || value > 5) {
    console.log('❌ [API] Note invalide:', value);
    return false;
  }
  
  // Vérifier que l'idée et l'utilisateur existent
  const [idea, user] = await Promise.all([
    getIdeaById(ideaId),
    getUserById(userId)
  ]);
  
  if (!idea) {
    console.log('❌ [API] Idée non trouvée:', ideaId);
    return false;
  }
  
  if (!user) {
    console.log('❌ [API] Utilisateur non trouvé:', userId);
    return false;
  }
  
  // Vérifier que le critère existe
  const criterion = idea.ratingCriteria.find(c => c.id === criterionId);
  if (!criterion) {
    console.log('❌ [API] Critère non trouvé:', criterionId);
    return false;
  }
  
  // Dans un vrai système, on mettrait à jour la BD ici
  return true;
}

/**
 * Signaler un contenu inapproprié
 * @param contentType - Type de contenu ('idea' ou 'post')
 * @param contentId - ID du contenu
 * @param userId - ID de l'utilisateur qui signale
 * @param reason - Raison du signalement
 * @returns true si succès, false sinon
 */
export async function reportContentOnApi(
  contentType: 'idea' | 'post',
  contentId: string,
  userId: string,
  reason: string
): Promise<boolean> {
  await simulateApiDelay(200);
  
  console.log('🔄 [API] Signalement de contenu:', contentType, contentId, 'par:', userId, 'raison:', reason);
  
  // Vérifier que l'utilisateur existe
  const user = await getUserById(userId);
  if (!user) {
    console.log('❌ [API] Utilisateur non trouvé:', userId);
    return false;
  }
  
  // Vérifier que le contenu existe
  let contentExists = false;
  if (contentType === 'idea') {
    contentExists = await getIdeaById(contentId) !== null;
  } else if (contentType === 'post') {
    contentExists = await getPostById(contentId) !== null;
  }
  
  if (!contentExists) {
    console.log('❌ [API] Contenu non trouvé:', contentType, contentId);
    return false;
  }
  
  console.log('✅ [API] Signalement enregistré et envoyé à la modération');
  // Dans un vrai système, on enverrait le signalement au système de modération
  return true;
}

/**
 * Ignorer un contenu (pour ne plus le voir dans le feed)
 * @param contentType - Type de contenu ('idea' ou 'post')
 * @param contentId - ID du contenu
 * @param userId - ID de l'utilisateur
 * @returns true si succès, false sinon
 */
export async function ignoreContentOnApi(
  contentType: 'idea' | 'post',
  contentId: string,
  userId: string
): Promise<boolean> {
  await simulateApiDelay(100);
  
  console.log('🔄 [API] Ignorer contenu:', contentType, contentId, 'par:', userId);
  
  // Vérifier que l'utilisateur existe
  const user = await getUserById(userId);
  if (!user) {
    console.log('❌ [API] Utilisateur non trouvé:', userId);
    return false;
  }
  
  console.log('✅ [API] Contenu ajouté à la liste des ignorés');
  // Dans un vrai système, on mettrait à jour les préférences utilisateur
  return true;
}

/**
 * Partager un contenu (générer lien de partage)
 * @param contentType - Type de contenu ('idea' ou 'post')
 * @param contentId - ID du contenu
 * @param userId - ID de l'utilisateur qui partage
 * @returns URL de partage ou null
 */
export async function shareContentOnApi(
  contentType: 'idea' | 'post',
  contentId: string,
  userId: string
): Promise<string | null> {
  await simulateApiDelay(100);
  
  console.log('🔄 [API] Génération lien de partage:', contentType, contentId, 'par:', userId);
  
  // Vérifier que le contenu existe
  let contentExists = false;
  if (contentType === 'idea') {
    contentExists = await getIdeaById(contentId) !== null;
  } else if (contentType === 'post') {
    contentExists = await getPostById(contentId) !== null;
  }
  
  if (!contentExists) {
    console.log('❌ [API] Contenu non trouvé pour partage:', contentType, contentId);
    return null;
  }
  
  // Générer une URL de partage
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ideosphere.fr';
  const shareUrl = `${baseUrl}/shared/${contentType}/${contentId}?ref=${userId}`;
  
  console.log('✅ [API] Lien de partage généré:', shareUrl);
  return shareUrl;
}

/**
 * Suivre/ne plus suivre un utilisateur
 * @param targetUserId - ID de l'utilisateur à suivre
 * @param currentUserId - ID de l'utilisateur actuel
 * @returns true si succès, false sinon
 */
export async function toggleUserFollowOnApi(
  targetUserId: string,
  currentUserId: string
): Promise<boolean> {
  await simulateApiDelay(120);
  
  console.log('🔄 [API] Toggle suivi utilisateur:', targetUserId, 'par:', currentUserId);
  
  if (targetUserId === currentUserId) {
    console.log('❌ [API] Impossible de se suivre soi-même');
    return false;
  }
  
  // Vérifier que les utilisateurs existent
  const [targetUser, currentUser] = await Promise.all([
    getUserById(targetUserId),
    getUserById(currentUserId)
  ]);
  
  if (!targetUser || !currentUser) {
    console.log('❌ [API] Utilisateur non trouvé');
    return false;
  }
  
  console.log('✅ [API] Toggle suivi réussi pour:', targetUser.name);
  // Dans un vrai système, on mettrait à jour les relations utilisateur
  return true;
}

/**
 * Basculer le like d'une réponse à un post
 * @param postId - ID du post
 * @param replyId - ID de la réponse
 * @param userId - ID de l'utilisateur
 * @returns true si succès, false sinon
 */
export async function togglePostReplyLikeOnApi(
  postId: string,
  replyId: string,
  userId: string
): Promise<boolean> {
  await simulateApiDelay(100);
  
  console.log('🔄 [API] Toggle like réponse:', replyId, 'par:', userId);
  
  // Vérifier que le post et l'utilisateur existent
  const [post, user] = await Promise.all([
    getPostById(postId),
    getUserById(userId)
  ]);
  
  if (!post) {
    console.log('❌ [API] Post non trouvé:', postId);
    return false;
  }
  
  if (!user) {
    console.log('❌ [API] Utilisateur non trouvé:', userId);
    return false;
  }
  
  // Vérifier que la réponse existe
  const reply = post.replies.find(r => r.id === replyId);
  if (!reply) {
    console.log('❌ [API] Réponse non trouvée:', replyId);
    return false;
  }
  
  console.log('✅ [API] Toggle like réponse réussi');
  // Dans un vrai système, on mettrait à jour la BD ici
  return true;
}

/**
 * Ajouter une réponse à un post
 * @param postId - ID du post
 * @param userId - ID de l'utilisateur
 * @param content - Contenu de la réponse
 * @returns Objet PostReply complet ou null si erreur
 */
export async function addPostReplyOnApi(
  postId: string,
  userId: string,
  content: string
): Promise<import('../types').PostReply | null> {
  await simulateApiDelay(150);
  
  console.log('🔄 [API] Ajout réponse au post:', postId, 'par:', userId);
  
  if (!content || content.trim().length === 0) {
    console.log('❌ [API] Contenu de réponse vide');
    return null;
  }
  
  // Vérifier que le post et l'utilisateur existent
  const [post, user] = await Promise.all([
    getPostById(postId),
    getUserById(userId)
  ]);
  
  if (!post) {
    console.log('❌ [API] Post non trouvé:', postId);
    return null;
  }
  
  if (!user) {
    console.log('❌ [API] Utilisateur non trouvé:', userId);
    return null;
  }
  
  // Créer l'objet PostReply complet
  const newReply: import('../types').PostReply = {
    id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    authorId: user.id,
    content: content.trim(),
    createdAt: new Date(),
    likes: [],
    likeCount: 0
  };
  
  console.log('✅ [API] Réponse ajoutée avec ID:', newReply.id);
  // Dans un vrai système, on ajouterait la réponse en BD
  return newReply;
}

/**
 * Upvoter un topic de discussion
 * @param topicId - ID du topic
 * @param userId - ID de l'utilisateur
 * @returns true si succès, false sinon
 */
export async function upvoteDiscussionTopicOnApi(
  topicId: string,
  userId: string
): Promise<boolean> {
  await simulateApiDelay(100);
  
  console.log('🔄 [API] Upvote topic de discussion:', topicId, 'par:', userId);
  
  // Vérifier que l'utilisateur existe
  const user = await getUserById(userId);
  if (!user) {
    console.log('❌ [API] Utilisateur non trouvé:', userId);
    return false;
  }
  
  console.log('✅ [API] Upvote topic de discussion réussi');
  // Dans un vrai système, on mettrait à jour la BD ici
  return true;
}

/**
 * Upvoter un post de discussion
 * @param topicId - ID du topic
 * @param postId - ID du post
 * @param userId - ID de l'utilisateur
 * @returns true si succès, false sinon
 */
export async function upvoteDiscussionPostOnApi(
  topicId: string,
  postId: string,
  userId: string
): Promise<boolean> {
  await simulateApiDelay(100);
  
  console.log('🔄 [API] Upvote post de discussion:', postId, 'dans topic:', topicId, 'par:', userId);
  
  // Vérifier que l'utilisateur existe
  const user = await getUserById(userId);
  if (!user) {
    console.log('❌ [API] Utilisateur non trouvé:', userId);
    return false;
  }
  
  console.log('✅ [API] Upvote post de discussion réussi');
  // Dans un vrai système, on mettrait à jour la BD ici
  return true;
}

/**
 * Créer un nouveau topic de discussion
 * @param ideaId - ID de l'idée
 * @param userId - ID de l'utilisateur
 * @param data - Données du topic (title, content, type)
 * @returns ID du nouveau topic ou null si erreur
 */
export async function createDiscussionTopicOnApi(
  ideaId: string,
  userId: string,
  data: {
    title: string;
    content: string;
    type: 'general' | 'question' | 'suggestion' | 'technical';
  }
): Promise<string | null> {
  await simulateApiDelay(200);
  
  console.log('🔄 [API] Création topic de discussion pour idée:', ideaId, 'par:', userId);
  
  if (!data.title || data.title.trim().length === 0) {
    console.log('❌ [API] Titre du topic vide');
    return null;
  }
  
  if (!data.content || data.content.trim().length === 0) {
    console.log('❌ [API] Contenu du topic vide');
    return null;
  }
  
  // Vérifier que l'idée et l'utilisateur existent
  const [idea, user] = await Promise.all([
    getIdeaById(ideaId),
    getUserById(userId)
  ]);
  
  if (!idea) {
    console.log('❌ [API] Idée non trouvée:', ideaId);
    return null;
  }
  
  if (!user) {
    console.log('❌ [API] Utilisateur non trouvé:', userId);
    return null;
  }
  
  // Générer un ID pour le nouveau topic
  const topicId = `dt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('✅ [API] Topic de discussion créé avec ID:', topicId);
  // Dans un vrai système, on ajouterait le topic en BD
  return topicId;
}

/**
 * Créer un post dans un topic de discussion
 * @param topicId - ID du topic
 * @param userId - ID de l'utilisateur
 * @param content - Contenu du post
 * @returns ID du nouveau post ou null si erreur
 */
export async function createDiscussionPostOnApi(
  topicId: string,
  userId: string,
  content: string
): Promise<string | null> {
  await simulateApiDelay(150);
  
  console.log('🔄 [API] Création post de discussion dans topic:', topicId, 'par:', userId);
  
  if (!content || content.trim().length === 0) {
    console.log('❌ [API] Contenu du post vide');
    return null;
  }
  
  // Vérifier que l'utilisateur existe
  const user = await getUserById(userId);
  if (!user) {
    console.log('❌ [API] Utilisateur non trouvé:', userId);
    return null;
  }
  
  // Générer un ID pour le nouveau post
  const postId = `dp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('✅ [API] Post de discussion créé avec ID:', postId);
  // Dans un vrai système, on ajouterait le post en BD
  return postId;
}

/**
 * Marquer un post de discussion comme réponse acceptée
 * @param topicId - ID du topic
 * @param postId - ID du post
 * @param userId - ID de l'utilisateur (doit être le créateur de l'idée ou du topic)
 * @returns true si succès, false sinon
 */
export async function markDiscussionPostAsAnswerOnApi(
  topicId: string,
  postId: string,
  userId: string
): Promise<boolean> {
  await simulateApiDelay(120);
  
  console.log('🔄 [API] Marquer post comme réponse:', postId, 'dans topic:', topicId, 'par:', userId);
  
  // Vérifier que l'utilisateur existe
  const user = await getUserById(userId);
  if (!user) {
    console.log('❌ [API] Utilisateur non trouvé:', userId);
    return false;
  }
  
  console.log('✅ [API] Post marqué comme réponse acceptée');
  // Dans un vrai système, on mettrait à jour la BD ici
  return true;
}