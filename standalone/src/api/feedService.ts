import { Idea, Post, User, DiscussionTopic, Community, CommunityMembership } from '../types';
import { loadMockDataSet } from './dataService';
import { users } from '../data/users';

// Types pour les données minimalistes du feed
export interface FeedIdeaCard {
  id: string;
  title: string;
  summary: string;
  location?: string;
  creatorIds: string[]; // ✅ Migré de creators: object[] vers creatorIds: string[]
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
  authorId: string; // ✅ Migré de author: object vers authorId: string
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

// Helper pour résoudre un userId en User
const getUserById = (userId: string): User | undefined => {
  return users.find(u => u.id === userId);
};

async function generateHomePageSampleData() {
  const sampleIdeas = [
    {
      id: 'sample-idea-1',
      title: 'Réaménagement de la place du marché',
      summary: 'Créer un espace plus convivial avec des bancs et de la végétation',
      description: '',
      location: 'Place du Marché',
      creatorIds: ['sample-user-1'], // ✅ Migré vers creatorIds
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
      creatorIds: ['sample-user-2'], // ✅ Migré vers creatorIds
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
  users: User[];
}> {
  console.log(`[api] fetchFeed${userId ? ` - User ${userId}` : ''}`);
  await simulateApiDelay(200);

  const data = await loadMockDataSet();
  
  // Filtrer le contenu pour le feed de découverte :
  // - Idées publiées (status === 'published')
  // - Exclure le contenu créé par l'utilisateur connecté (sera dans "Mes contributions")
  // - Inclure tout le contenu public des autres utilisateurs
  
  const ideaCards: FeedIdeaCard[] = data.ideas
    .filter(idea => {
      // Seulement les idées publiées
      if (idea.status !== 'published') return false;
      
      // Si un userId est fourni, exclure les idées créées par cet utilisateur
      if (userId && idea.creatorIds?.includes(userId)) {
        return false;
      }
      
      return true;
    })
    .map(idea => {
      // ✅ Garder les creatorIds tels quels (pas de résolution en objets)
      return {
        id: idea.id,
        title: idea.title,
        summary: idea.summary,
        location: idea.location,
        creatorIds: idea.creatorIds || [],
        status: idea.status,
        createdAt: idea.createdAt,
        supportCount: idea.supporters?.length || 0,
        tags: idea.tags || [],
        type: 'idea' as const
      };
    });

  const postCards: FeedPostCard[] = data.posts
    .filter(post => {
      // Si un userId est fourni, exclure les posts créés par cet utilisateur
      if (userId && post.authorId === userId) {
        return false;
      }
      
      return true;
    })
    .map(post => {
      // ✅ Garder l'authorId tel quel (pas de résolution en objet)
      return {
        id: post.id,
        content: post.content,
        location: post.location,
        authorId: post.authorId, // ✅ Migré : on garde l'ID au lieu de résoudre l'objet
        createdAt: post.createdAt,
        supportCount: post.supporters?.length || 0,
        replyCount: post.replies?.length || 0,
        tags: post.tags || [],
        type: 'post' as const
      };
    });

  console.log(`[api] fetchFeed - OK (${ideaCards.length} idées, ${postCards.length} posts, ${data.users.length} utilisateurs) - User content excluded: ${userId ? 'yes' : 'no'}`);
  
  return {
    ideas: ideaCards,
    posts: postCards,
    communities: data.communities || [],
    users: data.users || []
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
      idea.creatorIds?.includes(userId)
    );

    // Idées où l'utilisateur est supporter (supporters est maintenant string[])
    const supportIdeas = data.ideas.filter(idea => 
      idea.supporters?.includes(userId)
    );

    // Posts de l'utilisateur (authorId est maintenant string)
    const participationPosts = data.posts.filter(post => 
      post.authorId === userId
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
