// src/services/lineageService.ts

import { Idea, Post, User } from '../types';
import apiClient from './apiClient';
import { transformIdea, transformPost, transformUser, RawLineageData, RawContent } from './transformService';

export interface LineageResult {
  parents: (Idea | Post)[];
  children: (Idea | Post)[];
}

/**
 * Récupère l'arbre généalogique complet d'une idée ou d'un post.
 * Corresponds à GET /ideas/{key}/lineage ou /posts/{key}/lineage
 */
export async function fetchLineage(itemId: string): Promise<LineageResult | null> {
  console.log(`[API] fetchLineage - ${itemId}`);
  try {
    const response = await apiClient.get<RawLineageData>(`/${itemId}/lineage`);
    
    const usersMap = new Map(response.data.users.map(u => [u._id, transformUser(u)]));
    const transformContent = (raw: RawContent) => raw.description ? transformIdea(raw, usersMap) : transformPost(raw, usersMap);

    const parents = response.data.sources.map(transformContent);
    const children = response.data.versions.map(transformContent);
    
    console.log(`[API] fetchLineage - OK (${parents.length} parents, ${children.length} enfants)`);
    return { parents, children };

  } catch (error) {
    console.error(`[API] fetchLineage - Erreur:`, error);
    return null;
  }
}

/**
 * Récupère les données de versioning d'une idée. C'est un alias de fetchLineage.
 */
export async function fetchIdeaVersionsData(ideaId: string): Promise<LineageResult | null> {
  return fetchLineage(ideaId);
}