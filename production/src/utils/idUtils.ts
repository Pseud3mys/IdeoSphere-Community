/**
 * Utilitaires pour nettoyer et normaliser les IDs
 * 
 * L'API Supabase peut retourner des IDs avec des préfixes (ex: "ideas/384539", "posts/123")
 * Ces fonctions normalisent les IDs pour qu'ils soient utilisables dans les URLs React Router
 */

/**
 * Nettoie un ID d'idée en supprimant le préfixe "idea/" ou "ideas/" si présent
 * @param ideaId - ID potentiellement préfixé
 * @returns ID nettoyé
 * @example
 * cleanIdeaId("ideas/384539") // "384539"
 * cleanIdeaId("384539") // "384539"
 */
export function cleanIdeaId(ideaId: string): string {
  return ideaId.replace(/^ideas?\//, '');
}

/**
 * Nettoie un ID de post en supprimant le préfixe "post/" ou "posts/" si présent
 * @param postId - ID potentiellement préfixé
 * @returns ID nettoyé
 * @example
 * cleanPostId("posts/123") // "123"
 * cleanPostId("123") // "123"
 */
export function cleanPostId(postId: string): string {
  return postId.replace(/^posts?\//, '');
}

/**
 * Nettoie un ID de discussion en supprimant le préfixe "discussion/" ou "discussions/" si présent
 * @param discussionId - ID potentiellement préfixé
 * @returns ID nettoyé
 * @example
 * cleanDiscussionId("discussions/456") // "456"
 * cleanDiscussionId("456") // "456"
 */
export function cleanDiscussionId(discussionId: string): string {
  return discussionId.replace(/^discussions?\//, '');
}

/**
 * Nettoie un ID de groupe en supprimant le préfixe "group/" ou "groups/" si présent
 * @param groupId - ID potentiellement préfixé
 * @returns ID nettoyé
 * @example
 * cleanGroupId("groups/g1") // "g1"
 * cleanGroupId("groups/pg1") // "pg1"
 * cleanGroupId("g1") // "g1"
 */
export function cleanGroupId(groupId: string): string {
  return groupId.replace(/^groups?\//, '');
}

/**
 * Ajoute le préfixe "groups/" à un ID s'il n'est pas déjà présent
 * @param groupId - ID potentiellement sans préfixe
 * @returns ID avec préfixe
 * @example
 * ensureGroupPrefix("g1") // "groups/g1"
 * ensureGroupPrefix("groups/g1") // "groups/g1"
 */
export function ensureGroupPrefix(groupId: string): string {
  return groupId.startsWith('groups/') ? groupId : `groups/${groupId}`;
}

/**
 * Nettoie un ID générique en supprimant tout préfixe de type "type/"
 * @param id - ID potentiellement préfixé
 * @returns ID nettoyé
 * @example
 * cleanId("users/123") // "123"
 * cleanId("123") // "123"
 */
export function cleanId(id: string): string {
  return id.replace(/^[a-z]+s?\//, '');
}
