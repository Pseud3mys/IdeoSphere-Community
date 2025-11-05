import { Idea, Post, User, DiscussionTopic } from '../types'; // <-- 1. AJOUTER DiscussionTopic
import apiClient from './apiClient';
import {
  transformUser,
  transformIdea,
  transformPost,
  transformPostToDiscussion, // <-- 2. IMPORTER ce transformateur
  RawUser,
  RawLineageData,
  RawContent,
} from './transformService';

/**
 * Le type de retour pour le lineage.
 * Il contient maintenant les objets complets, y compris les DiscussionTopic.
 */
export interface LineageServiceResult {
  parents: (Idea | Post | DiscussionTopic)[];
  children: (Idea | Post | DiscussionTopic)[];
}

/**
 * Récupère l'arbre généalogique complet d'une idée ou d'un post.
 * Corresponds à GET /ideas/{key}/lineage ou /posts/{key}/lineage
 */
export async function fetchLineage(itemId: string): Promise<{ lineage: LineageServiceResult, users: User[] } | null> {
  console.log(`[API] fetchLineage - ${itemId}`);
  try {
    const response = await apiClient.get<RawLineageData>(`/${itemId}/lineage`);
    
    // Transformer les utilisateurs
    const users = response.data.users.map(transformUser);
    const usersMap = new Map(users.map(u => [u.id, u]));

    // --- 3. LA LOGIQUE DE TRANSFORMATION CORRIGÉE ---
    /**
     * Transforme un RawContent en objet Idea, Post, ou DiscussionTopic complet.
     */
    const transformContent = (raw: RawContent): Idea | Post | DiscussionTopic => {
      // Cas 1: C'est une Discussion (prioritaire)
      if (raw.isDiscussion === true) {
        return transformPostToDiscussion(raw, usersMap);
      }
      // Cas 2: C'est une Idée
      if (raw.description !== undefined || raw.summary !== undefined) { 
        return transformIdea(raw); 
      }
      // Cas 3: C'est un Post standard
      return transformPost(raw, usersMap);
    };

    // Appliquer la transformation
    const parents = response.data.sources.map(transformContent);
    const children = response.data.versions.map(transformContent);
    
    console.log(`[API] fetchLineage - OK (${parents.length} parents, ${children.length} enfants, ${users.length} utilisateurs)`);
  
    // 4. Retourner la structure avec les objets complets
    return {
      lineage: {
        parents,
        children,
      },
      users
    };

  } catch (error) {
    console.error(`[API] fetchLineage - Erreur:`, error);
    return null;
  }
}