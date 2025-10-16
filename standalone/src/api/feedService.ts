import { Idea, Post, User, DiscussionTopic, Community, CommunityMembership } from '../types';
import { loadMockDataSet } from './dataService';

// Types pour les données minimalistes du feed
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
  supportCount: number;
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

const simulateApiDelay = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

async function generateHomePageSampleData() {
  const sampleIdeas = [
    {
      id: 'sample-idea-1',
      title: 'Réaménagement de la place du marché',
      summary: 'Créer un espace plus convivial avec des bancs et de la végétation',
      description: '',
      location: 'Place du Marché',
      creators: [{
        id: 'sample-user-1',
        name: 'Marie Dupont',
        avatar: ''
      }],
      status: 'published',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      supportCount: 12,
      tags: ['Aménagement urbain'],
      type: 'idea' as const
    },
    {
      id: 'sample-idea-2',
      title: 'Pistes cyclables sécurisées',
      summary: 'Développer un réseau de pistes cyclables protégées',
      description: '',
      location: 'Centre-ville',
      creators: [{
        id: 'sample-user-2',
        name: 'Jean Martin',
        avatar: ''
      }],
      status: 'published',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      supportCount: 8,
      tags: ['Mobilité'],
      type: 'idea' as const
    }
  ];

  return sampleIdeas;
}

/**
 * Récupère les stats pour la page d'accueil (non connecté)
 */
export async function fetchHomePageStats(): Promise<HomePageData> {
  console.log(`[api] fetchHomePageStats`);
  await simulateApiDelay(150);

  const sampleIdeas = await generateHomePageSampleData();
  
  const homePageData: HomePageData = {
    totalContributions: 127,
    totalIdeas: 45,
    totalSupports: 312,
    recentSharedPropositions: sampleIdeas.slice(0, 3),
    featuredIdeas: sampleIdeas.slice(0, 2)
  };

  console.log(`[api] fetchHomePageStats - OK (${homePageData.totalIdeas} idées)`);
  return homePageData;
}

/**
 * Récupère le feed principal (Discovery)
 * @param userId - ID optionnel de l'utilisateur pour personnaliser le feed
 */
export async function fetchFeed(userId?: string): Promise<{
  ideas: FeedIdeaCard[];
  posts: FeedPostCard[];
  communities: Community[];
}> {
  console.log(`[api] fetchFeed${userId ? ` - User ${userId}` : ''}`);
  await simulateApiDelay(200);

  const data = await loadMockDataSet();
  
  // Si un userId est fourni, on pourrait personnaliser le feed
  // Pour l'instant, on retourne tout le contenu publié
  // Dans une vraie API, on pourrait filtrer selon les préférences de l'utilisateur
  
  const ideaCards: FeedIdeaCard[] = data.ideas
    .filter(idea => idea.status === 'published')
    .map(idea => ({
      id: idea.id,
      title: idea.title,
      summary: idea.summary,
      location: idea.location,
      creators: idea.creators.map(c => ({
        id: c.id,
        name: c.name,
        avatar: c.avatar
      })),
      status: idea.status,
      createdAt: idea.createdAt,
      supportCount: idea.supporters?.length || 0, // ✅ Calculer dynamiquement
      tags: idea.tags || [],
      type: 'idea' as const
    }));

  const postCards: FeedPostCard[] = data.posts.map(post => ({
    id: post.id,
    content: post.content,
    location: post.location,
    author: {
      id: post.author.id,
      name: post.author.name,
      avatar: post.author.avatar
    },
    createdAt: post.createdAt,
    supportCount: post.supporters?.length || 0, // ✅ Calculer dynamiquement
    replyCount: post.replies?.length || 0,
    tags: post.tags || [],
    type: 'post' as const
  }));

  console.log(`[api] fetchFeed - OK (${ideaCards.length} idées, ${postCards.length} posts)`);
  
  return {
    ideas: ideaCards,
    posts: postCards,
    communities: data.communities || []
  };
}

/**
 * Récupère les contributions de l'utilisateur (format complet avec participation/support)
 */
export async function fetchUserContributionsFromApi(userId: string): Promise<{
  participationIdeas: Idea[];
  supportIdeas: Idea[];
  participationPosts: Post[];
  supportPosts: Post[];
} | null> {
  console.log(`[api] fetchUserContributionsFromApi - User ${userId}`);
  await simulateApiDelay(180);

  try {
    const data = await loadMockDataSet();
    
    // Idées où l'utilisateur est créateur
    const participationIdeas = data.ideas.filter(idea => 
      idea.creators?.some(c => c.id === userId)
    );

    // Idées où l'utilisateur est supporter
    const supportIdeas = data.ideas.filter(idea => 
      idea.supporters?.some(s => s.id === userId)
    );

    // Posts de l'utilisateur
    const participationPosts = data.posts.filter(post => 
      post.author.id === userId
    );

    // Posts likés par l'utilisateur
    const supportPosts = data.posts.filter(post => 
      post.supporters?.includes(userId)
    );

    console.log(`[api] fetchUserContributionsFromApi - OK (${participationIdeas.length} idées créées, ${supportIdeas.length} idées supportées, ${participationPosts.length} posts créés, ${supportPosts.length} posts likés)`);
    
    return {
      participationIdeas,
      supportIdeas,
      participationPosts,
      supportPosts
    };
  } catch (error) {
    console.error(`[api] fetchUserContributionsFromApi - Erreur:`, error);
    return null;
  }
}
