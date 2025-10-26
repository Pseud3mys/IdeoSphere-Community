import { Idea, Post, User } from '../types';
import apiClient from './apiClient';
import {
  transformUser,
  transformIdea,
  transformPost,
  RawUser,
  RawLineageData,
  RawContent,
} from './transformService';

// This interface should reflect what the frontend expects to use.
// Note: We are not exporting this, as the final return type is more complex.
interface LineageResult {
  parents: (Idea | Post)[];
  children: (Idea | Post)[];
}

/**
 * Récupère l'arbre généalogique complet d'une idée ou d'un post.
 * Corresponds à GET /ideas/{key}/lineage ou /posts/{key}/lineage
 *
 * @returns Un objet contenant le lineage et les utilisateurs associés.
 */
export async function fetchLineage(itemId: string): Promise<{ lineage: LineageResult, users: User[] } | null> {
  console.log(`[API] fetchLineage - ${itemId}`);
  try {
    const response = await apiClient.get<RawLineageData>(`/${itemId}/lineage`);
    
    // Transformer la liste brute des utilisateurs en une liste propre
    const users = response.data.users.map(transformUser);
    const usersMap = new Map(users.map(u => [u.id, u]));

    const transformContent = (raw: RawContent) => raw.description 
      ? transformIdea(raw, usersMap) 
      : transformPost(raw, usersMap);

    const parents = response.data.sources.map(transformContent);
    const children = response.data.versions.map(transformContent);
    
    console.log(`[API] fetchLineage - OK (${parents.length} parents, ${children.length} enfants, ${users.length} utilisateurs)`);
  
    // --- FIX APPLIED HERE ---
    // Wrap the result in the structure expected by the frontend.
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