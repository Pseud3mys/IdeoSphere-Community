// src/services/transformService.ts

import { 
  User, 
  Idea, 
  Post, 
  PostReply,
  Rating,
  IdeaStatus,
  DiscussionTopic,
  DiscussionPost,
  Group,
  GroupType,
  PendingGroupCreation,
  GroupMembership,
  VerticalGroupLink,
  HorizontalGroupLink,
  Location
} from '../types';
import { defaultRatingCriteria } from '../data/ratings';

// Helper to parse location
function parseLocation(loc: string | Location | undefined): Location | undefined {
  if (!loc) return undefined;
  if (typeof loc === 'string') {
    return { label: loc, lon: 0, lat: 0 };
  }
  return loc;
}

// =============================================================================
// RAW INTERFACES - Mirror the JSON structure from the Python API
// =============================================================================

export interface RawUser {
  _id: string;
  _key: string;
  name: string;
  email: string;
  createdAt: string; // ISO String
  bio?: string;
  location?: string | Location;
  avatar?: string;
  birthYear?: number;
  isRegistered?: boolean;
}

export interface RawComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO String
  upvotes: string[]; // List of user _ids
  isAnswer?: boolean;
}

export interface RawContent {
  _id: string;
  _key: string;
  // Common fields
  createdAt: string; // ISO String
  creators: string[]; // List of user _ids
  tags?: string[];
  location?: string | Location;
  title?: string;
  groupIds?: string[]; // List of group _ids
  // Idea-specific
  description?: string;
  summary?: string;
  supporters?: string[]; // List of user _ids
  // Post-specific
  content?: string;
  upvotes?: string[]; // List of user _ids
  comments?: RawComment[];
  type?: string; 
  isDiscussion?: boolean;
}


export interface RawFeedData {
  content: RawContent[];
  users: RawUser[];
}

export interface RawLineageData {
  sources: RawContent[];
  versions: RawContent[];
  users: RawUser[];
}

export interface RawFeedback {
  _id: string;
  _from: string; 
  _to: string;   
  type: 'supports' | 'reports' | 'objects' | 'ignores';
  ratings?: { [criterionName: string]: number };
}

export type RawPost = RawContent;
export type RawIdea = RawContent;

// --- NOUVEAUX RAW TYPES (pour les Groupes) ---

export interface RawGroup {
  _id: string;
  _key: string;
  name: string;
  description: string;
  shortDescription: string;
  type: GroupType;
  avatar?: string;
  banner?: string;
  location?: string | Location;
  tags: string[];
  createdAt: string; // ISO String
  createdBy: string;
  status: "pending" | "active" | "archived";
  // Champs optionnels pour les statistiques (fournis par le backend dans certains endpoints)
  memberCount?: number;
  ideaCount?: number;
  projectCount?: number;
}

export interface RawPendingGroup extends RawGroup {
  status: "pending";
  pendingFounders: string[];
  pendingConfirmations: string[];
  pendingExpiresAt: string; // ISO String
}

export interface RawMembership {
  _id: string;
  _key: string;
  _from: string; // User ID
  _to: string; // Group ID
  role: 'animator' | 'member';
  joinedAt: string; // ISO String
}

export interface RawVerticalLink {
  _id: string;
  _key: string;
  parentGroupId: string; // Vient de la transformation AQL
  childGroupId: string;  // Vient de la transformation AQL
  createdAt: string; // ISO String
  createdBy: string;
}

export interface RawHorizontalLink {
  _id: string;
  _key: string;
  groupId1: string; // Vient de la transformation AQL
  groupId2: string; // Vient de la transformation AQL
  createdAt: string; // ISO String
  createdBy: string;
}

// =============================================================================
// FONCTIONS DE TRANSFORMATION (Existantes)
// =============================================================================

/**
 * Convertit une carte d'idée (données minimales depuis le feed) en Idea avec champs vides
 * Les relations et données enrichies seront chargées progressivement selon les onglets consultés
 * @param ideaCard - Données minimales de l'idée depuis l'API feed
 * @returns Objet Idea pour le store (avec champs non chargés vides)
 */
export function transformIdeaCardToIdea(ideaCard: any): Idea {
  return {
    id: ideaCard.id,
    title: ideaCard.title,
    summary: ideaCard.summary,
    description: ideaCard.description || '', // Peut être vide, chargé dans onglet description
    location: ideaCard.location,
    creatorIds: ideaCard.creatorIds || [],
    status: ideaCard.status,
    createdAt: new Date(ideaCard.createdAt),
    tags: ideaCard.tags || [],
    supporters: ideaCard.supporters || [],
    groupIds: ideaCard.groupIds || [],
    // Champs chargés progressivement - initialisés vides
    discussionIds: [], // Chargé dans onglet discussions
    ratingCriteria: defaultRatingCriteria, // CORRIGÉ
    ratings: [], // Chargé dans onglet évaluation
    sourceIdeas: [], // Chargé dans onglet versions
    derivedIdeas: [], // Chargé dans onglet versions
    sourcePosts: [], // Chargé dans onglet versions
    sourceDiscussions: [], // Ajouté pour correspondre au type Idea
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
    id: postCard.id,
    title: postCard.title,
    content: postCard.content,
    location: postCard.location,
    authorId: postCard.authorId,
    createdAt: new Date(postCard.createdAt),
    supporters: postCard.supporters || [],
    groupIds: postCard.groupIds || [],
    tags: postCard.tags || [],
    // Champs chargés progressivement - initialisés vides
    replies: [], // Chargé dans onglet discussions
    derivedIdeas: [], // Chargé dans onglet versions
    derivedPosts: [], // Chargé dans onglet versions
    sourcePosts: [] // Chargé dans onglet versions
  };
}

const unknownUser: User = {
  id: 'unknown',
  name: 'Utilisateur Inconnu apitransform',
  email: '',
  avatar: '/assets/images/avatars/default.png',
  bio: '',
  location: undefined,
  createdAt: new Date(),
  isRegistered: false,
};

/**
 * Transforms a RawUser into the frontend User type.
 */
export const transformUser = (raw: RawUser): User => ({
  id: raw._id,
  name: raw.name,
  email: raw.email,
  createdAt: new Date(raw.createdAt),
  avatar: raw.avatar || '',
  bio: raw.bio || '',
  location: parseLocation(raw.location),
  birthYear: raw.birthYear,
  isRegistered: raw.isRegistered ?? false,
});

/**
 * Transforms a RawComment into the frontend PostReply type.
 * Requires a map of users to populate the author field.
 */
export const transformComment = (raw: RawComment, usersMap: Map<string, User>): DiscussionPost => ({
  id: raw.id,
  authorId: raw.authorId,
  content: raw.content,
  timestamp: new Date(raw.createdAt),
  upvotes: raw.upvotes || [],
  isAnswer: raw.isAnswer
});

/**
 * Transforms a RawPost into the frontend Post type.
 */
export const transformPost = (raw: RawPost, usersMap: Map<string, User>): Post => {

  return {
    id: raw._id, // c'est le trucentier posts/123345
    title: raw.title || '',
    content: raw.content || raw.title || '',
    authorId: raw.creators?.[0],
    createdAt: new Date(raw.createdAt),
    supporters: raw.supporters || [],
    groupIds: raw.groupIds || [],
    replies: (raw.comments || []).map(comment => transformComment(comment, usersMap) as unknown as PostReply), // Temporary cast to fix type mismatch
    tags: raw.tags || [],
    location: parseLocation(raw.location),
    // Initialize progressive load fields as empty
    derivedIdeas: [],
    derivedPosts: [],
    sourcePosts: [],
  };
};

/**
 * Transforms a RawIdea into the frontend Idea type.
 */
export const transformIdea = (raw: RawIdea): Idea => {

  return {
    id: raw._id,
    title: raw.title || 'Sans titre',
    summary: raw.summary || (raw.description || '').slice(0, 150),
    description: raw.description || '',
    createdAt: new Date(raw.createdAt),
    creatorIds: raw.creators,
    supporters: raw.supporters || [],
    status: 'published' as IdeaStatus, // Default status
    tags: raw.tags || [],
    groupIds: raw.groupIds || [],
    location: parseLocation(raw.location),
    // Initialize progressive load fields as empty
    discussionIds: [],
    ratingCriteria: defaultRatingCriteria, // CORRIGÉ
    ratings: [],
    sourceIdeas: [],
    derivedIdeas: [],
    sourcePosts: [],
    sourceDiscussions: [],
  };
};


export const transformPostToDiscussion = (raw: RawContent, usersMap: Map<string, User>): DiscussionTopic => ({
    id: raw._id,
    title: raw.title || 'Discussion',
    type: (raw.type as 'general' | 'question' | 'suggestion' | 'technical') || 'general',
    authorId: raw.creators?.[0],
    content: raw.content || '',
    timestamp: new Date(raw.createdAt),
    createdAt: new Date(raw.createdAt),
    // CORRECTION ICI : Vérifier raw.supporters OU raw.upvotes
    upvotes: raw.supporters || raw.upvotes || [], 
    posts: (raw.comments || []).map(c => transformComment(c, usersMap))
});

export const transformFeedData = (rawData: RawFeedData): { ideas: Idea[], posts: Post[], users: Map<string, User> } => {
  if (!rawData || !Array.isArray(rawData.users) || !Array.isArray(rawData.content)) {
    console.error("Invalid feed data received from API", rawData);
    return { ideas: [], posts: [], users: new Map() };
  }
  const usersMap = new Map(rawData.users.map(rawUser => [rawUser._id, transformUser(rawUser)]));
  const ideas: Idea[] = [];
  const posts: Post[] = [];

  rawData.content.forEach(item => {
    if (item.description !== undefined || item.summary !== undefined) {
      ideas.push(transformIdea(item));
    } else {
      posts.push(transformPost(item, usersMap));
    }
  });
  return { ideas, posts, users: usersMap };
};

export function transformFeedbackToRatings(data: RawFeedback | RawFeedback[]): Rating[] {
  const feedbackItems = Array.isArray(data) ? data : [data];
  return feedbackItems.flatMap(item => {
    if (!item.ratings || Object.keys(item.ratings).length === 0) return [];
    const userId = item._from;
    return Object.entries(item.ratings).map(([criterionName, value]) => ({
      criterionId: criterionName,
      value: value,
      userId: userId,
    }));
  });
}

// =============================================================================
// NOUVELLES FONCTIONS DE TRANSFORMATION (pour les Groupes)
// =============================================================================

/**
 * Transforme un RawGroup en Group (frontend type).
 */
export const transformGroup = (raw: RawGroup): Group => ({
  id: raw._id,
  name: raw.name,
  description: raw.description,
  shortDescription: raw.shortDescription,
  type: raw.type,
  avatar: raw.avatar,
  banner: raw.banner,
  location: parseLocation(raw.location),
  tags: raw.tags || [],
  createdAt: new Date(raw.createdAt),
  createdBy: [raw.createdBy], // L'API stocke un seul initiateur
  animators: [], // Sera peuplé par la réponse normalisée
  isActive: raw.status === 'active',
  // Utiliser les valeurs du backend si disponibles, sinon 0
  memberCount: raw.memberCount ?? 0, 
  ideaCount: raw.ideaCount ?? 0,
  projectCount: raw.projectCount ?? 0,
});

/**
 * Transforme un RawPendingGroup en PendingGroupCreation (frontend type).
 */
export const transformPendingGroup = (raw: RawPendingGroup): PendingGroupCreation => ({
  id: raw._id,
  name: raw.name,
  description: raw.description,
  shortDescription: raw.shortDescription,
  type: raw.type,
  avatar: raw.avatar,
  location: parseLocation(raw.location),
  tags: raw.tags || [],
  createdAt: new Date(raw.createdAt),
  initiatorId: raw.createdBy,
  founders: raw.pendingFounders || [],
  confirmations: raw.pendingConfirmations || [],
  expiresAt: new Date(raw.pendingExpiresAt),
});

/**
 * Transforme un RawMembership en GroupMembership (frontend type).
 */
export const transformMembership = (raw: RawMembership): GroupMembership => ({
  userId: raw._from,
  groupId: raw._to,
  role: raw.role,
  joinedAt: new Date(raw.joinedAt),
  isActive: true, // Si on la reçoit, elle est active
});

/**
 * Transforme un RawVerticalLink en VerticalGroupLink (frontend type).
 */
export const transformVerticalLink = (raw: RawVerticalLink): VerticalGroupLink => ({
  id: raw._id,
  type: 'vertical',
  parentGroupId: raw.parentGroupId,
  childGroupId: raw.childGroupId,
  createdAt: new Date(raw.createdAt),
  createdBy: raw.createdBy,
});

/**
 * Transforme un RawHorizontalLink en HorizontalGroupLink (frontend type).
 */
export const transformHorizontalLink = (raw: RawHorizontalLink): HorizontalGroupLink => ({
  id: raw._id,
  type: 'horizontal',
  groupId1: raw.groupId1,
  groupId2: raw.groupId2,
  createdAt: new Date(raw.createdAt),
  createdBy: raw.createdBy,
});