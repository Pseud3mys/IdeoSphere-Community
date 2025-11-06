import { Idea, Post, User } from '../types';
// Importer l'apiClient
import apiClient from './apiClient'; 

//
// Les interfaces (GlobalHealthStats, KumuData, etc.) restent les mêmes
//

// Types pour les statistiques
export interface ParticipationDistribution {
  gini: number; // Coefficient de Gini (0 = égalité parfaite, 1 = inégalité maximale)
  herfindahl: number; // Index Herfindahl-Hirschman (concentration)
  percentiles: {
    p50: number; // Médiane
    p75: number;
    p90: number;
    p95: number;
  };
}

export interface UserContributionStats {
  userId: string;
  totalContributions: number;
  ideas: number;
  posts: number;
  supportsGiven: number;
}

export interface ContentOverTimeStats {
  daily: { date: string; count: number }[];
  weekly: { week: string; count: number }[];
  monthly: { month: string; count: number }[];
}

export interface GlobalHealthStats {
  totalUsers: number;
  activeUsers: number; // Utilisateurs avec au moins 1 contribution
  totalContent: number;
  totalIdeas: number;
  totalPosts: number;
  totalSupports: number;
  participationDistribution: ParticipationDistribution;
  contentOverTime: ContentOverTimeStats;
  topContributors: UserContributionStats[];
  avgContributionsPerUser: number;
}

export interface GroupHealthStats extends GlobalHealthStats {
  groupId: string;
  groupName: string;
}

export interface KumuNode {
  id: string;
  label: string;
  type: 'idea' | 'post' | 'user' | 'group';
  createdAt: string;
  tags?: string[];
  location?: string;
  supportCount?: number;
}

export interface KumuConnection {
  from: string;
  to: string;
  type: 'created' | 'supports' | 'derived_from' | 'member_of' | 'linked_to';
}

export interface KumuData {
  nodes: KumuNode[];
  connections: KumuConnection[];
}


/**
 * Calcule les statistiques globales de santé de la plateforme
 * EN APPELANT LE BACKEND
 */
export async function fetchGlobalHealthStats(): Promise<GlobalHealthStats> {
  try {
    const response = await apiClient.get<GlobalHealthStats>('/stats/global');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des stats globales:", error);
    throw error;
  }
}

/**
 * Calcule les statistiques de santé pour un groupe spécifique
 * EN APPELANT LE BACKEND
 */
export async function fetchGroupHealthStats(
  groupId: string
): Promise<GroupHealthStats> {
   try {
    // L'ID du groupe doit être la clé (ex: "12345") et non "groups/12345"
    const groupKey = groupId.includes('/') ? groupId.split('/')[1] : groupId;
    const response = await apiClient.get<GroupHealthStats>(`/stats/group/${groupKey}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats pour le groupe ${groupId}:`, error);
    throw error;
  }
}

/**
 * Génère les données au format Kumu.io
 * EN APPELANT LE BACKEND
 */
export async function fetchKumuData(): Promise<KumuData> {
  try {
    // MODIFIÉ: Appel du nouvel endpoint statique
    const response = await apiClient.get<KumuData>('/kumu-export');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données Kumu:", error);
    throw error;
  }
}

/**
 * Génère un export JSON brut des données
 * EN APPELANT LE BACKEND
 */
export async function fetchRawDataExport(): Promise<any> {
  try {
    const response = await apiClient.get<any>('/stats/raw-export');
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'export brut:", error);
    throw error;
  }
}