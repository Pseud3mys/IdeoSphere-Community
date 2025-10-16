import { Idea, Post, User } from '../types';

/**
 * Service de cache intelligent pour éviter les appels API redondants
 * Gère la fraîcheur des données et les délais de cache appropriés
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: Date;
  expiresIn: number; // en millisecondes
}

export interface CacheConfig {
  // Délais de cache par type de données (en millisecondes)
  USER_PROFILE: number;
  IDEA_DETAILS: number;
  POST_DETAILS: number;
  FEED_DATA: number;
  USER_CONTRIBUTIONS: number;
  IDEA_LINEAGE: number;
  POST_LINEAGE: number;
  IDEA_DISCUSSIONS: number;
  POST_FEEDBACK: number;
  SEARCH_RESULTS: number;
  HOME_PAGE_DATA: number;
}

// Configuration des délais de cache - adaptés selon la fréquence de changement des données
export const CACHE_DURATIONS: CacheConfig = {
  USER_PROFILE: 5 * 60 * 1000,       // 5 minutes - peut changer lors de l'édition du profil
  IDEA_DETAILS: 10 * 60 * 1000,      // 10 minutes - peut changer avec les ratings/soutiens
  POST_DETAILS: 2 * 60 * 1000,       // 2 minutes - peut changer avec les likes/réponses
  FEED_DATA: 30 * 1000,              // 30 secondes - données très dynamiques
  USER_CONTRIBUTIONS: 2 * 60 * 1000,  // 2 minutes - change quand l'utilisateur crée du contenu
  IDEA_LINEAGE: 15 * 60 * 1000,      // 15 minutes - les relations changent moins souvent
  POST_LINEAGE: 15 * 60 * 1000,      // 15 minutes - les relations changent moins souvent
  IDEA_DISCUSSIONS: 1 * 60 * 1000,   // 1 minute - discussions actives
  POST_FEEDBACK: 30 * 1000,          // 30 secondes - likes peuvent changer rapidement
  SEARCH_RESULTS: 2 * 60 * 1000,     // 2 minutes - résultats de recherche
  HOME_PAGE_DATA: 2 * 60 * 1000      // 2 minutes - statistiques générales
};

/**
 * Service de cache intelligent avec vérification de fraîcheur
 */
export class SmartCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  
  /**
   * Obtenir une clé de cache unique
   */
  private getCacheKey(type: string, params: any): string {
    const paramString = typeof params === 'object' ? JSON.stringify(params) : String(params);
    return `${type}:${paramString}`;
  }
  
  /**
   * Vérifier si une entrée de cache est encore valide
   */
  private isEntryValid<T>(entry: CacheEntry<T>): boolean {
    const now = new Date().getTime();
    const entryTime = entry.timestamp.getTime();
    return (now - entryTime) < entry.expiresIn;
  }
  
  /**
   * Obtenir des données du cache si valides
   */
  get<T>(type: keyof CacheConfig, params: any): T | null {
    const key = this.getCacheKey(type, params);
    const entry = this.cache.get(key);
    
    if (entry && this.isEntryValid(entry)) {
      console.log(`💾 [CACHE HIT] ${type}:`, params);
      return entry.data as T;
    }
    
    if (entry) {
      console.log(`⏰ [CACHE EXPIRED] ${type}:`, params);
      this.cache.delete(key);
    } else {
      console.log(`❌ [CACHE MISS] ${type}:`, params);
    }
    
    return null;
  }
  
  /**
   * Stocker des données dans le cache
   */
  set<T>(type: keyof CacheConfig, params: any, data: T): void {
    const key = this.getCacheKey(type, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: new Date(),
      expiresIn: CACHE_DURATIONS[type]
    };
    
    this.cache.set(key, entry);
    console.log(`✅ [CACHE SET] ${type}:`, params, `(expire dans ${CACHE_DURATIONS[type]/1000}s)`);
  }
  
  /**
   * Invalider le cache pour un type et des paramètres spécifiques
   */
  invalidate(type: keyof CacheConfig, params?: any): void {
    if (params) {
      const key = this.getCacheKey(type, params);
      this.cache.delete(key);
      console.log(`🗑️ [CACHE INVALIDATED] ${type}:`, params);
    } else {
      // Invalider tout le cache pour ce type
      const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(type + ':'));
      keysToDelete.forEach(key => this.cache.delete(key));
      console.log(`🗑️ [CACHE INVALIDATED ALL] ${type}`);
    }
  }
  
  /**
   * Invalider le cache lié aux contributions d'un utilisateur
   */
  invalidateUserRelatedCache(userId: string): void {
    console.log(`🔄 [CACHE] Invalidation du cache utilisateur:`, userId);
    this.invalidate('USER_CONTRIBUTIONS', userId);
    this.invalidate('FEED_DATA'); // Le feed peut être impacté par les nouvelles contributions
    this.invalidate('HOME_PAGE_DATA'); // Les stats globales peuvent changer
  }
  
  /**
   * Invalider le cache lié à une idée spécifique
   */
  invalidateIdeaRelatedCache(ideaId: string): void {
    console.log(`🔄 [CACHE] Invalidation du cache idée:`, ideaId);
    this.invalidate('IDEA_DETAILS', ideaId);
    this.invalidate('IDEA_DISCUSSIONS', ideaId);
    this.invalidate('IDEA_LINEAGE', ideaId);
    this.invalidate('FEED_DATA'); // Le feed peut contenir cette idée
  }
  
  /**
   * Invalider le cache lié à un post spécifique
   */
  invalidatePostRelatedCache(postId: string): void {
    console.log(`🔄 [CACHE] Invalidation du cache post:`, postId);
    this.invalidate('POST_DETAILS', postId);
    this.invalidate('POST_FEEDBACK', postId);
    this.invalidate('POST_LINEAGE', postId);
    this.invalidate('FEED_DATA'); // Le feed peut contenir ce post
  }
  
  /**
   * Vider complètement le cache (utile pour les tests ou la déconnexion)
   */
  clear(): void {
    this.cache.clear();
    console.log(`🗑️ [CACHE] Cache complètement vidé`);
  }
  
  /**
   * Obtenir des statistiques sur le cache
   */
  getStats(): { 
    totalEntries: number; 
    validEntries: number; 
    expiredEntries: number;
    entriesByType: Record<string, number>;
  } {
    const totalEntries = this.cache.size;
    let validEntries = 0;
    let expiredEntries = 0;
    const entriesByType: Record<string, number> = {};
    
    this.cache.forEach((entry, key) => {
      const type = key.split(':')[0];
      entriesByType[type] = (entriesByType[type] || 0) + 1;
      
      if (this.isEntryValid(entry)) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });
    
    return {
      totalEntries,
      validEntries,
      expiredEntries,
      entriesByType
    };
  }
  
  /**
   * Nettoyer automatiquement les entrées expirées
   */
  cleanup(): void {
    const expiredKeys: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (!this.isEntryValid(entry)) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`🧹 [CACHE] Nettoyage: ${expiredKeys.length} entrées expirées supprimées`);
    }
  }
}

// Instance singleton du service de cache
export const cacheService = new SmartCacheService();

// Nettoyage automatique du cache toutes les 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    cacheService.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Fonction utilitaire pour vérifier si des données existent dans le store
 * avant de faire un appel API
 */
export function checkStoreForData<T>(
  store: any, 
  getter: () => T | null | undefined
): T | null {
  try {
    const data = getter();
    if (data !== null && data !== undefined) {
      console.log(`🏪 [STORE HIT] Données trouvées dans le store`);
      return data;
    }
    console.log(`❌ [STORE MISS] Données non trouvées dans le store`);
    return null;
  } catch (error) {
    console.log(`⚠️ [STORE ERROR] Erreur lors de la lecture du store:`, error);
    return null;
  }
}

/**
 * Fonction utilitaire pour combiner cache et store intelligemment
 */
export async function getDataWithSmartCache<T>(
  cacheType: keyof CacheConfig,
  cacheParams: any,
  storeGetter: () => T | null,
  apiCall: () => Promise<T>,
  onDataLoaded?: (data: T) => void
): Promise<T | null> {
  // 1. Vérifier d'abord le cache
  const cachedData = cacheService.get<T>(cacheType, cacheParams);
  if (cachedData) {
    return cachedData;
  }
  
  // 2. Vérifier le store
  const storeData = checkStoreForData(null, storeGetter);
  if (storeData) {
    // Mettre les données du store dans le cache pour la prochaine fois
    cacheService.set(cacheType, cacheParams, storeData);
    return storeData;
  }
  
  // 3. Appel API en dernier recours
  try {
    console.log(`🌐 [API CALL] ${cacheType}:`, cacheParams);
    const apiData = await apiCall();
    
    if (apiData) {
      // Mettre en cache
      cacheService.set(cacheType, cacheParams, apiData);
      
      // Optionnellement, mettre à jour le store
      if (onDataLoaded) {
        onDataLoaded(apiData);
      }
      
      return apiData;
    }
    
    return null;
  } catch (error) {
    console.error(`❌ [API ERROR] ${cacheType}:`, error);
    return null;
  }
}