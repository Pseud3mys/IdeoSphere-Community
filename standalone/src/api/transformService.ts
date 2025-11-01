import { User, Idea, Post } from '../types';
import { getValidAvatar } from './avatarService';

/**
 * Service de transformation pur
 * Convertit les données API en objets de domaine avec chargement progressif
 * 
 * Note : Les IDs préfixés (ideas/XXX, posts/XXX) sont maintenant conservés
 * partout dans l'application pour supporter le format d'URL unifié /content/:id
 */

/**
 * Convertit une carte d'idée (données minimales depuis le feed) en Idea avec champs vides
 * Les relations et données enrichies seront chargées progressivement selon les onglets consultés
 * @param ideaCard - Données minimales de l'idée depuis l'API feed
 * @returns Objet Idea pour le store (avec champs non chargés vides)
 */
export function transformIdeaCardToIdea(ideaCard: any): Idea {
  return {
    id: ideaCard.id, // Conserver l'ID préfixé (ideas/XXX)
    title: ideaCard.title,
    summary: ideaCard.summary,
    description: ideaCard.description || '', // Peut être vide, chargé dans onglet description
    location: ideaCard.location,
    // ✅ Garder les creatorIds tels quels (déjà des IDs dans ideaCard)
    creatorIds: ideaCard.creatorIds || [],
    status: ideaCard.status,
    createdAt: new Date(ideaCard.createdAt),
    supportCount: ideaCard.supporters?.length || 0, // ✅ Calculer dynamiquement
    tags: ideaCard.tags || [],
    // Champs chargés progressivement - initialisés vides
    supporters: [], // Chargé dans onglet description
    discussionIds: [], // Chargé dans onglet discussions
    ratingCriteria: [], // Chargé dans onglet évaluation
    ratings: [], // Chargé dans onglet évaluation
    sourceIdeas: [], // Chargé dans onglet versions
    derivedIdeas: [], // Chargé dans onglet versions
    sourcePosts: [] // Chargé dans onglet versions
  };
}

/**
 * Convertit une carte de post (données minimales depuis le feed) en Post avec champs vides
 * Les relations et données enrichies seront chargées progressivement selon les onglets consultés
 * @param postCard - Données minimales du post depuis l'API feed
 * @returns Objet Post pour le store (avec champs non chargés vides)
 */
export function transformPostCardToPost(postCard: any): Post {
  return {
    id: postCard.id, // Conserver l'ID préfixé (posts/XXX)
    content: postCard.content,
    location: postCard.location,
    authorId: postCard.authorId, // ✅ Migré de author: object vers authorId: string
    createdAt: new Date(postCard.createdAt),
    supportCount: postCard.supporters?.length || 0, // ✅ Calculer dynamiquement
    tags: postCard.tags || [],
    // Champs chargés progressivement - initialisés vides
    supporters: [], // Chargé dans onglet détails
    replies: [], // Chargé dans onglet discussions
    derivedIdeas: [], // Chargé dans onglet versions
    derivedPosts: [], // Chargé dans onglet versions
    sourcePosts: [] // Chargé dans onglet versions
  };
}

/**
 * Convertit les données minimales d'un créateur en objet User
 * @param creator - Données minimales du créateur
 * @returns Objet User complet
 */
function transformCreatorToUser(creator: any): User {
  return {
    id: creator.id,
    name: creator.name,
    avatar: getValidAvatar(creator.name, creator.avatar),
    email: creator.email || '',
    bio: creator.bio || '',
    address: creator.address,
    birthYear: creator.birthYear,
    createdAt: creator.createdAt ? new Date(creator.createdAt) : new Date(),
    isRegistered: creator.isRegistered !== undefined ? creator.isRegistered : true
  };
}

/**
 * Convertit des données de lineage en objets Idea/Post minimaux
 * @param lineageItem - Item du lineage
 * @returns Objet Idea ou Post minimal
 */
export function transformLineageItemToEntity(lineageItem: any): Idea | Post {
  if (lineageItem.type === 'idea') {
    return {
      id: lineageItem.id,
      title: lineageItem.title || '',
      summary: lineageItem.summary || '',
      description: '',
      location: '',
      creatorIds: lineageItem.authors?.map((author: any) => author.id || author) || [], // ✅ Migré vers creatorIds
      status: 'published',
      createdAt: new Date(lineageItem.createdAt),
      supportCount: 0,
      supporters: [],
      ratings: [],
      ratingCriteria: [],
      tags: [],
      discussionIds: [],
      sourceIdeas: [],
      sourcePosts: [],
      derivedIdeas: []
    } as Idea;
  } else {
    return {
      id: lineageItem.id,
      content: lineageItem.content || '',
      location: '',
      authorId: lineageItem.authors[0]?.id || 'unknown', // ✅ Migré de author: object vers authorId: string
      createdAt: new Date(lineageItem.createdAt),
      supporters: [],
      supportCount: 0,
      replies: [],
      tags: [],
      derivedIdeas: [],
      derivedPosts: [],
      sourcePosts: []
    } as Post;
  }
}

/**
 * Crée un utilisateur visiteur par défaut
 * @param visitorId - ID unique pour le visiteur
 * @returns Objet User visiteur
 */
export function createVisitorUser(visitorId: string): User {
  return {
    id: visitorId,
    name: 'Visiteur',
    email: '',
    bio: 'Utilisateur visiteur',
    avatar: getValidAvatar('Visiteur'),
    address: '',
    birthYear: new Date().getFullYear() - 30,
    createdAt: new Date(),
    isRegistered: false
  };
}