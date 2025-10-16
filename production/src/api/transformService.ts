// src/services/transformService.ts

import { 
  User, 
  Idea, 
  Post, 
  PostReply,
  Rating,
  IdeaStatus,
  DiscussionTopic
} from '../types';

// =============================================================================
// RAW INTERFACES - Mirror the JSON structure from the Python API
// =============================================================================

/**
 * Raw user data directly from the ArangoDB/Python API.
 * [cite: 9-18]
 */
export interface RawUser {
  _id: string;
  _key: string;
  name: string;
  email: string;
  createdAt: string; // ISO String
  bio?: string;
  location?: string;
  avatar?: string;
  neighborhood?: string;
  preciseAddress?: string;
  birthYear?: number;
  isRegistered?: boolean;
}

/**
 * Raw comment data as a sub-document within a Post.
 * [cite: 43-50]
 */
export interface RawComment {
  id: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO String
  upvotes: string[]; // List of user _ids
  isAnswer?: boolean;
}

/**

 * A generic raw content item (Idea or Post) from the API.
 * Fields match the ArangoDB schema definition.
 * [cite: 19-28, 33-52]
 */
export interface RawContent {
  _id: string;
  _key: string;
  // Common fields
  createdAt: string; // ISO String
  creators: string[]; // List of user _ids
  tags?: string[];
  location?: string;
  // Idea-specific
  title?: string;
  description?: string;
  summary?: string;
  supporters?: string[]; // List of user _ids
  // Post-specific
  content?: string;
  upvotes?: string[]; // List of user _ids
  comments?: RawComment[];
  type?: string; // e.g., 'question', 'general'
}

export type RawIdea = RawContent;
export type RawPost = RawContent;

/**
 * The standard structure for feed responses.
 * [cite: 53-58]
 */
export interface RawFeedData {
  content: RawContent[];
  users: RawUser[];
}

/**
 * The structure for lineage (history) API responses.
 * [cite: 83, 87]
 */
export interface RawLineageData {
  sources: RawContent[];
  versions: RawContent[];
  users: RawUser[]; // Assuming users are provided here as well
}

/**
 * Raw feedback data from the API, representing an edge.
 */
export interface RawFeedback {
    _from: string; // User ID
    _to: string; // Content ID
    type: 'supports' | 'reports' | 'objects' | 'ignores';
    createdAt: string;
    ratings?: { criterionName: string; value: number }[];
}


// =============================================================================
// TRANSFORMATION FUNCTIONS
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
    creators: ideaCard.creators.map((creator: any) => transformCreatorToUser(creator)),
    status: ideaCard.status,
    createdAt: new Date(ideaCard.createdAt),
    supportCount: ideaCard.supportCount || 0,
    tags: ideaCard.tags || [],
    // Champs chargés progressivement - initialisés vides
    supporters: [], // Chargé dans onglet description
    discussionIds: [], // Chargé dans onglet discussions
    ratingCriteria: [], // Chargé dans onglet évaluation
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
    content: postCard.content,
    location: postCard.location,
    author: transformCreatorToUser(postCard.author),
    createdAt: new Date(postCard.createdAt),
    likeCount: postCard.likeCount || 0,
    tags: postCard.tags || [],
    // Champs chargés progressivement - initialisés vides
    likes: [], // Chargé dans onglet détails
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
    avatar: creator.avatar || '',
    email: creator.email || '',
    bio: creator.bio || '',
    location: creator.location || '',
    neighborhood: creator.neighborhood || '',
    preciseAddress: creator.preciseAddress,
    birthYear: creator.birthYear,
    createdAt: creator.createdAt ? new Date(creator.createdAt) : new Date(),
    isRegistered: creator.isRegistered !== undefined ? creator.isRegistered : true
  };
}


const unknownUser: User = {
  id: 'unknown',
  name: 'Utilisateur Inconnu',
  email: '',
  avatar: '/assets/images/avatars/default.png',
  bio: '',
  location: '',
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
  avatar: raw.avatar || `https://i.pravatar.cc/150?u=${raw._id}`, // Placeholder
  bio: raw.bio || '',
  location: raw.location || '',
  neighborhood: raw.neighborhood || '',
  preciseAddress: raw.preciseAddress || '',
  birthYear: raw.birthYear,
  isRegistered: raw.isRegistered ?? false,
});

/**
 * Transforms a RawComment into the frontend PostReply type.
 * Requires a map of users to populate the author field.
 */
export const transformComment = (raw: RawComment, usersMap: Map<string, User>): PostReply => ({
  id: raw.id,
  author: usersMap.get(raw.authorId) || { ...unknownUser, id: raw.authorId },
  content: raw.content,
  createdAt: new Date(raw.createdAt),
  likes: raw.upvotes || [],
  likeCount: (raw.upvotes || []).length,
});

/**
 * Transforms a RawPost into the frontend Post type.
 */
export const transformPost = (raw: RawPost, usersMap: Map<string, User>): Post => {
  const authorId = raw.creators?.[0];
  const author = authorId ? (usersMap.get(authorId) || { ...unknownUser, id: authorId }) : unknownUser;
  
  return {
    id: raw._id,
    type: 'post', // Ajoutez cette ligne
    content: raw.content || raw.title || '',
    author,
    createdAt: new Date(raw.createdAt),
    likes: raw.upvotes || [],
    likeCount: (raw.upvotes || []).length,
    replies: (raw.comments || []).map(comment => transformComment(comment, usersMap)),
    tags: raw.tags || [],
    location: raw.location || '',
    // Initialize progressive load fields as empty
    derivedIdeas: [],
    derivedPosts: [],
    sourcePosts: [],
  };
};

/**
 * Transforms a RawIdea into the frontend Idea type.
 */
export const transformIdea = (raw: RawIdea, usersMap: Map<string, User>): Idea => {
  const creators = (raw.creators || []).map(id => usersMap.get(id) || { ...unknownUser, id });
  const supporters = (raw.supporters || []).map(id => usersMap.get(id) || { ...unknownUser, id });

  return {
    id: raw._id,
    type: 'idea', // Ajoutez cette ligne
    title: raw.title || 'Sans titre',
    summary: raw.summary || (raw.description || '').slice(0, 150),
    description: raw.description || '',
    createdAt: new Date(raw.createdAt),
    creators,
    supporters,
    supportCount: (raw.supporters || []).length,
    status: 'published' as IdeaStatus, // Default status
    tags: raw.tags || [],
    location: raw.location || '',
    // Initialize progressive load fields as empty
    discussionIds: [],
    ratingCriteria: [],
    ratings: [],
    sourceIdeas: [],
    derivedIdeas: [],
    sourcePosts: [],
    sourceDiscussions: [],
  };
};

/**
 * Transforms a RawPost into a DiscussionTopic.
 * This is used for the "discussions" attached to an idea.
 */
export const transformPostToDiscussion = (raw: RawPost, usersMap: Map<string, User>): DiscussionTopic => {
    const authorId = raw.creators?.[0];
    const author = authorId ? (usersMap.get(authorId) || { ...unknownUser, id: authorId }) : unknownUser;
    
    return {
        id: raw._id,
        title: raw.title || 'Discussion',
        type: (raw.type as 'general' | 'question' | 'suggestion' | 'technical') || 'general',
        author,
        content: raw.content || '',
        timestamp: new Date(raw.createdAt),
        createdAt: new Date(raw.createdAt),
        upvotes: raw.upvotes || [],
        posts: (raw.comments || []).map(c => ({
            id: c.id,
            author: usersMap.get(c.authorId) || { ...unknownUser, id: c.authorId },
            content: c.content,
            timestamp: new Date(c.createdAt),
            upvotes: c.upvotes || [],
            isAnswer: c.isAnswer
        }))
    };
};


/**
 * Processes a raw feed response from the API into structured frontend data.
 */
export const transformFeedData = (rawData: RawFeedData): { ideas: Idea[], posts: Post[], users: Map<string, User> } => {
  if (!rawData || !Array.isArray(rawData.users) || !Array.isArray(rawData.content)) {
    console.error("Invalid feed data received from API", rawData);
    return { ideas: [], posts: [], users: new Map() };
  }

  const usersMap = new Map(rawData.users.map(rawUser => [rawUser._id, transformUser(rawUser)]));
  
  const ideas: Idea[] = [];
  const posts: Post[] = [];

  rawData.content.forEach(item => {
    // Heuristic to differentiate Ideas from Posts based on unique fields
    if (item.description !== undefined || item.summary !== undefined) {
      ideas.push(transformIdea(item, usersMap));
    } else {
      posts.push(transformPost(item, usersMap));
    }
  });

  return { ideas, posts, users: usersMap };
};

/**
 * Transforms raw feedback data into the frontend Rating type.
 */
export const transformFeedbackToRatings = (feedbacks: RawFeedback[]): Rating[] => {
    const ratings: Rating[] = [];
    for (const feedback of feedbacks) {
        if (feedback.ratings && feedback.ratings.length > 0) {
            for (const rawRating of feedback.ratings) {
                ratings.push({
                    criterionId: rawRating.criterionName, // Assuming name is used as ID
                    value: rawRating.value,
                    userId: feedback._from,
                });
            }
        }
    }
    return ratings;
}