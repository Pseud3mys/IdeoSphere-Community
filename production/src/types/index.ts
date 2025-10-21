export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  location?: string; // Deprecated - kept for backward compatibility
  preciseAddress?: string; // Deprecated - kept for backward compatibility
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
  author: User;
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
  author: User;
  content: string;
  timestamp: Date;
  upvotes: string[]; // User IDs who upvoted
  isAnswer?: boolean; // For question topics
}

export interface Discussion {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
  replies: Discussion[];
}

export interface PostReply {
  id: string;
  author: User;
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
  content: string;
  author: User;
  createdAt: Date;
  supportCount?: number; // ✅ Optionnel - calculé dynamiquement depuis supporters.length
  tags?: string[];
  location?: string;
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
 * - id, title, summary, description, creators, status, createdAt, tags, location
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
  creators: User[];
  supportCount?: number; // ✅ Optionnel - calculé dynamiquement depuis supporters.length
  status: IdeaStatus;
  createdAt: Date;
  tags?: string[];
  location?: string;
  // Champs chargés progressivement (peuvent être vides au début)
  supporters: User[];
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

// Communautés/Groupes de travail
export interface Community {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  type: 'association' | 'thematic' | 'local' | 'project' | 'education' | 'event';
  avatar: string;
  banner?: string;
  location?: string;
  tags: string[];
  memberCount: number;
  ideaCount: number;
  createdAt: Date;
  admins: string[]; // User IDs
  isPublic: boolean;
  joinPolicy: 'open' | 'request' | 'invite-only';
}

export interface CommunityMembership {
  userId: string;
  communityId: string;
  role: 'member' | 'moderator' | 'admin';
  joinedAt: Date;
  isActive: boolean;
}

export type TabType = 'welcome' | 'discovery' | 'my-ideas' | 'create-idea' | 'create-post' | 'drafts' | 'communities' | 'profile' | 'idea-detail' | 'post-detail' | 'user-profile' | 'community-detail' | 'signup' | 'about' | 'how-it-works' | 'faq' | 'privacy' | 'terms';