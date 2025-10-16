// src/services/feedService.ts

import { Idea, Post, Community } from '../types';
// Import des dépendances nécessaires pour les appels directs et la transformation
import apiClient from './apiClient';
import {
  transformUser,
  transformIdea,
  transformPost,
  RawUser,
  RawContent
} from './transformService';

// --- INTERFACES POUR LES DONNÉES BRUTES DE L'API ---

// Interface pour les feeds standards (ex: /feed/simple-random)
interface RawFeedData {
  content: RawContent[];
  users: RawUser[];
}

// Interface pour la réponse de la route des contributions utilisateur
interface RawContributionsData {
  participated_content: RawContent[];
  supported_content: RawContent[];
  users: RawUser[];
}

// --- INTERFACES POUR LES CARTES DE FEED (FORMAT MINIMALISTE) ---

export interface FeedIdeaCard {
  id: string;
  title: string;
  summary: string;
  location?: string;
  creators: Array<{ id: string; name: string; avatar: string }>;
  status: string;
  createdAt: Date;
  supportCount: number;
  tags: string[];
  type: 'idea';
}

export interface FeedPostCard {
  id: string;
  content: string;
  location?: string;
  author: { id: string; name: string; avatar: string };
  createdAt: Date;
  likeCount: number;
  replyCount: number;
  tags: string[];
  type: 'post';
}

export interface HomePageData {
  totalContributions: number;
  totalIdeas: number;
  totalSupports: number;
  recentSharedPropositions: (FeedIdeaCard | FeedPostCard)[];
  featuredIdeas: FeedIdeaCard[];
}

// --- FONCTIONS DE SERVICE ---

/**
 * Récupère les stats et les idées mises en avant pour la page d'accueil.
 * Appelle directement les routes /feed/stats et /feed/simple-random.
 */
export async function fetchHomePageStats(): Promise<HomePageData> {
  console.log(`[API] fetchHomePageStats`);
  try {
    // Appel 1: Récupérer les statistiques globales
    const statsResponse = await apiClient.get('/feed/stats');
    const stats = statsResponse.data;
    if (!stats) {
      throw new Error("Impossible de récupérer les statistiques globales.");
    }

    // Appel 2: Récupérer le feed principal pour le contenu récent
    const feedResponse = await apiClient.get<RawFeedData>('/feed/weighted-random');
    const rawFeedData = feedResponse.data;
    const usersMap = new Map(rawFeedData.users.map(rawUser => [rawUser._id, transformUser(rawUser)]));

    const ideas: Idea[] = [];
    const posts: Post[] = [];
    rawFeedData.content.forEach(item => {
      if (item.description !== undefined || item.summary !== undefined) {
        ideas.push(transformIdea(item, usersMap));
      } else {
        posts.push(transformPost(item, usersMap));
      }
    });

    const ideaCards = ideas.map(transformIdeaToCard);
    const postCards = posts.map(transformPostToCard);

    console.log(`[API] fetchHomePageStats - OK`);
    return {
      totalContributions: stats.totalContributions,
      totalIdeas: stats.totalIdeas,
      totalSupports: stats.totalSupports,
      recentSharedPropositions: [...ideaCards, ...postCards].slice(0, 5),
      featuredIdeas: ideaCards.slice(0, 3) // Simule les idées "featured"
    };

  } catch (error) {
    console.error(`[API] fetchHomePageStats - Erreur:`, error);
    return { totalContributions: 0, totalIdeas: 0, totalSupports: 0, recentSharedPropositions: [], featuredIdeas: [] };
  }
}

/**
 * MODIFIÉ : Récupère le feed basé sur l'activité des voisins.
 * Appelle la route /feed/neighbors-activity.
 * @param userId - L'ID de l'utilisateur pour lequel récupérer le feed.
 */
export async function fetchFeed(userId: string): Promise<{
  ideas: FeedIdeaCard[];
  posts: FeedPostCard[];
  communities: Community[];
}> {
  console.log(`[API] fetchFeed (neighbors activity) pour l'utilisateur ${userId}`);
  if (!userId) {
    console.error('[API] fetchFeed - Erreur: userId est requis.');
    return { ideas: [], posts: [], communities: [] };
  }
  
  try {
    // 1. Appel direct à l'API /feed/neighbors-activity avec le paramètre userId
    const response = await apiClient.get<RawFeedData>('/feed/neighbors-activity', {
      params: { userId }
    });
    const rawData = response.data;

    // 2. Transformation des données brutes en objets complets
    const usersMap = new Map(rawData.users.map(rawUser => [rawUser._id, transformUser(rawUser)]));
    const ideas: Idea[] = [];
    const posts: Post[] = [];

    rawData.content.forEach(item => {
      if (item.description !== undefined || item.summary !== undefined) {
        ideas.push(transformIdea(item, usersMap));
      } else {
        posts.push(transformPost(item, usersMap));
      }
    });
    
    // 3. Transformation des objets complets en cartes allégées
    const ideaCards = ideas.map(transformIdeaToCard);
    const postCards = posts.map(transformPostToCard);

    console.log(`[API] fetchFeed (neighbors) - OK (${ideaCards.length} idées, ${postCards.length} posts)`);
    return {
      ideas: ideaCards,
      posts: postCards,
      communities: [] // L'API ne fournit pas cette donnée pour le moment
    };
  } catch (error) {
    console.error(`[API] fetchFeed (neighbors) - Erreur:`, error);
    return { ideas: [], posts: [], communities: [] };
  }
}

/**
 * Récupère toutes les contributions d'un utilisateur en appelant directement l'API.
 * Sépare le contenu en "participations" (créé/commenté) et "soutiens purs".
 * Appelle la route /users/{key}/content.
 */
export async function fetchUserContributionsFromApi(userId: string): Promise<{
  participationIdeas: Idea[];
  supportIdeas: Idea[];
  participationPosts: Post[];
  supportPosts: Post[];
} | null> {
  console.log(`[API] fetchUserContributionsFromApi - User ${userId}`);
  try {
    // 1. Appel direct à l'API
    const userKey = userId.split('/')[1];
    const response = await apiClient.get<RawContributionsData>(`/users/${userKey}/content`);
    const rawData = response.data;

    // 2. Création de la map d'utilisateurs pour la transformation
    const usersMap = new Map(rawData.users.map(rawUser => [rawUser._id, transformUser(rawUser)]));

    // 3. Transformation du contenu des "participations"
    const participationIdeas: Idea[] = [];
    const participationPosts: Post[] = [];
    rawData.participated_content.forEach(item => {
      if (item.description !== undefined || item.summary !== undefined) {
        participationIdeas.push(transformIdea(item, usersMap));
      } else {
        participationPosts.push(transformPost(item, usersMap));
      }
    });

    // 4. Transformation du contenu des "soutiens purs"
    const supportIdeas: Idea[] = [];
    const supportPosts: Post[] = [];
    rawData.supported_content.forEach(item => {
      if (item.description !== undefined || item.summary !== undefined) {
        supportIdeas.push(transformIdea(item, usersMap));
      } else {
        supportPosts.push(transformPost(item, usersMap));
      }
    });

    console.log(`[API] fetchUserContributionsFromApi - OK`);
    
    // 5. Retourner l'objet structuré attendu par MyIdeasPage
    return {
      participationIdeas,
      supportIdeas,
      participationPosts,
      supportPosts,
    };
  } catch (error) {
    console.error(`[API] fetchUserContributionsFromApi - Erreur:`, error);
    return null;
  }
}

// --- FONCTIONS UTILITAIRES DE TRANSFORMATION (INTERNES AU SERVICE) ---

const transformIdeaToCard = (idea: Idea): FeedIdeaCard => ({
    id: idea.id,
    title: idea.title,
    summary: idea.summary,
    location: idea.location,
    creators: idea.creators.map(c => ({ id: c.id, name: c.name, avatar: c.avatar })),
    status: idea.status,
    createdAt: idea.createdAt,
    supportCount: idea.supportCount,
    tags: idea.tags || [],
    type: 'idea',
});

const transformPostToCard = (post: Post): FeedPostCard => ({
    id: post.id,
    content: post.content,
    location: post.location,
    author: { id: post.author.id, name: post.author.name, avatar: post.author.avatar },
    createdAt: post.createdAt,
    likeCount: post.likeCount,
    replyCount: post.replies.length,
    tags: post.tags || [],
    type: 'post',
});