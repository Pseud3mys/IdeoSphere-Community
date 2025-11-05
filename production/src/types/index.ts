export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  location?: string; // Localisation de l'utilisateur (ville, région)
  address?: string; // Adresse complète de l'utilisateur (optionnelle)
  birthYear?: number; // Année de naissance (obligatoire pour les utilisateurs enregistrés)
  createdAt: Date;
  isRegistered: boolean; // true = utilisateur connecté, false = invité/anonyme
}

export interface RatingCriterion {
  id: string;
  name: string;
  description: string;
  scale: Array<{
    value: number;
    label: string;
    description: string;
  }>;
}

export interface Rating {
  criterionId: string;
  value: number;
  userId: string;
}

// New discussion system
export interface DiscussionTopic {
  id: string;
  title: string;
  type: 'general' | 'question' | 'suggestion' | 'technical';
  authorId: string; // ✅ ID de l'utilisateur au lieu de l'objet complet
  content: string;
  timestamp: Date;
  upvotes: string[]; // User IDs who upvoted
  isPinned?: boolean;
  posts: DiscussionPost[];
  relatedPostIds?: string[]; // IDs des posts liés (si applicable)
  createdAt?: Date; // Alias pour timestamp (pour compatibilité)
}

export interface DiscussionPost {
  id: string;
  authorId: string; // ✅ ID de l'utilisateur au lieu de l'objet complet
  content: string;
  timestamp: Date;
  upvotes: string[]; // User IDs who upvoted
  isAnswer?: boolean; // For question topics
}

export interface Discussion {
  id: string;
  authorId: string; // ✅ ID de l'utilisateur au lieu de l'objet complet
  content: string;
  timestamp: Date;
  replies: Discussion[];
}

export interface PostReply {
  id: string;
  authorId: string; // ✅ ID de l'utilisateur au lieu de l'objet complet
  content: string;
  createdAt: Date;
  likes: string[];
  likeCount?: number; // ✅ Optionnel - calculé dynamiquement depuis likes.length
}

export type IdeaStatus = 'draft' | 'published' | 'featured' | 'archived';

/**
 * Post - Structure complète avec chargement progressif
 * 
 * Champs TOUJOURS présents (depuis le feed) :
 * - id, content, author, createdAt, tags, location
 * 
 * Champs CALCULÉS dynamiquement :
 * - supportCount: calculé depuis supporters.length (ne pas stocker!)
 * 
 * Champs chargés PROGRESSIVEMENT selon les onglets :
 * - supporters: chargé dans onglet contenu/détails
 * - replies: chargé dans onglet discussions
 * - derivedIdeas, derivedPosts, sourcePosts: chargés dans onglet versions
 */
export interface Post {
  id: string;
  title?: string; // Titre optionnel du post
  content: string;
  authorId: string;
  createdAt: Date;
  supportCount?: number; // ✅ Optionnel - calculé dynamiquement depuis supporters.length
  tags?: string[];
  location?: string;
  groupIds?: string[]; // Groupes auxquels appartient ce post
  // Champs chargés progressivement (peuvent être vides au début)
  supporters: string[]; // IDs des utilisateurs qui soutiennent ce post
  replies: PostReply[];
  derivedIdeas: string[];
  derivedPosts: string[];
  sourcePosts: string[];
}

/**
 * Idée - Structure complète avec chargement progressif
 * 
 * Champs TOUJOURS présents (depuis le feed) :
 * - id, title, summary, description, creatorIds, status, createdAt, tags, location
 * 
 * Champs CALCULÉS dynamiquement :
 * - supportCount: calculé depuis supporters.length (ne pas stocker!)
 * 
 * Champs chargés PROGRESSIVEMENT selon les onglets :
 * - supporters: chargé dans onglet description
 * - discussionIds: chargé dans onglet discussions
 * - ratingCriteria, ratings: chargés dans onglet évaluation
 * - sourceIdeas, derivedIdeas, sourcePosts: chargés dans onglet versions
 */
export interface Idea {
  id: string;
  title: string;
  summary: string;
  description: string;
  creatorIds: string[];
  supportCount?: number; // ✅ Optionnel - calculé dynamiquement depuis supporters.length
  status: IdeaStatus;
  createdAt: Date;
  tags?: string[];
  location?: string;
  groupIds?: string[]; // Groupes auxquels appartient cette idée
  // Champs chargés progressivement (peuvent être vides au début)
  supporters: string[]; // ✅ IDs des utilisateurs (aligné avec Post.supporters)
  discussionIds: string[];
  ratingCriteria: RatingCriterion[];
  ratings?: Rating[]; // ✅ Optionnel - chargé uniquement dans l'onglet évaluation
  sourceIdeas: string[];
  derivedIdeas: string[];
  sourcePosts: string[];
  sourceDiscussions: string[]; // IDs des discussions qui ont inspiré cette idée
}

// Removed unused interfaces: UserImpactStats, RecentActivity, VersionSource



// Type union pour le feed avec discriminant de type
export type FeedItem = (Post & { type: 'post' }) | (Idea & { type: 'idea' });

// Structure standardisée pour les réponses de l'API du feed
export interface FeedResponse {
  posts: Post[];
  ideas: Idea[];
  totalPosts: number;
  totalIdeas: number;
}

// Type pour le contenu préfillé lors de la création
export interface PrefilledContent {
  type: 'post' | 'idea' | 'discussion';
  id: string;
  title: string;
  content: string;
  author: string;
  location?: string; // Localisation du contenu source
}

// Groupes (anciennement Communautés)
export type GroupType = 'community' | 'team' | 'project' | 'local';

export interface Group {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  type: GroupType;
  avatar?: string;
  banner?: string;
  location?: string;
  tags: string[];
  memberCount: number;
  ideaCount: number;
  projectCount: number;
  createdAt: Date;
  createdBy: string[]; // Les 3+ fondateurs (Phase 2)
  animators: string[]; // User IDs des animateurs
  isActive: boolean; // false si en attente (Phase 2)
}

export interface GroupMembership {
  userId: string;
  groupId: string;
  role: 'animator' | 'member';
  joinedAt: Date;
  isActive: boolean;
}

// Liens entre groupes (Phase 4)
export interface VerticalGroupLink {
  id: string;
  parentGroupId: string;
  childGroupId: string;
  type: 'vertical';
  createdAt: Date;
  createdBy: string;
}

export interface HorizontalGroupLink {
  id: string;
  groupId1: string;
  groupId2: string;
  type: 'horizontal';
  createdAt: Date;
  createdBy: string;
}

export type GroupLink = VerticalGroupLink | HorizontalGroupLink;

// Suggestions de contenu entre groupes (Phase 5)
export interface ContentSuggestion {
  id: string;
  contentId: string;
  contentType: 'idea' | 'post';
  sourceGroupId: string;
  targetGroupId: string;
  suggestedBy: string;
  suggestedAt: Date;
}

// Groupes en attente de création (Phase 2)
export interface PendingGroupCreation {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  type: GroupType;
  avatar?: string;
  location?: string;
  tags: string[];
  founders: string[]; // User IDs (min 3)
  confirmations: string[]; // User IDs qui ont confirmé
  createdAt: Date;
  expiresAt: Date; // 7 jours après création
  initiatorId: string; // Celui qui a lancé la création
}

// NOTE MIGRATION REACT ROUTER (Phase 6) :
// TabType supprimé - navigation maintenant gérée par React Router avec URLs