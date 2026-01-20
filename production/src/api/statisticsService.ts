import apiClient from './apiClient'; 
import { User, Idea, Post } from '../types';

export interface ParticipationDistribution {
  gini: number;
}

export interface UserContributionStats {
  userId: string;
  name: string;
  totalContributions: number; // ActivityMass
  score: number;             // CalibratedActivityScore
  ideas: number;             // Sera probablement 0
  posts: number;             // Sera probablement 0
  supportsGiven: number;     // Sera probablement 0
}

export interface ContentOverTimeStats {
  daily: { date: string; count: number }[];
}

export interface UsersOverTimeStats {
  daily: { 
    date: string; 
    registered: number; 
    activeAnonymous: number; 
  }[];
}

export interface GlobalHealthStats {
  totalUsers: number;
  activeUsers: number;
  totalContent: number;
  totalIdeas: number;
  totalPosts: number;
  totalSupports: number;
  participationDistribution: ParticipationDistribution;
  contentOverTime: ContentOverTimeStats;
  usersOverTime: UsersOverTimeStats;
  topContributors: UserContributionStats[];
  avgContributionsPerUser: number;
}

// Note : On retire GroupHealthStats car "pas de stat par groupe"

/**
 * Calcule les statistiques globales de santé de la plateforme
 */
export async function fetchGlobalHealthStats(
  users?: User[], ideas?: Idea[], posts?: Post[]
): Promise<GlobalHealthStats> {
  try {
    const response = await apiClient.get<GlobalHealthStats>('/stats/global');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des stats globales:", error);
    throw error;
  }
}

/**
 * Génère un export JSON brut des données
 */
export async function fetchRawDataExport(
  users?: User[], ideas?: Idea[], posts?: Post[], groups?: any[]
): Promise<any> {
  try {
    const response = await apiClient.get<any>('/stats/raw-export');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'export brut:", error);
    throw error;
  }
}