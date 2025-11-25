/**
 * Service API pour l'édition de contenu
 * Gère les modifications de posts et d'idées dans les 5 minutes suivant leur publication
 */

import { Post, Idea } from '../types';
import { mockPosts } from '../data/posts';
import { mockIdeas } from '../data/ideas';

/**
 * Édite un post existant
 * @param postId - ID du post à éditer
 * @param updates - Nouvelles données du post
 * @returns Le post mis à jour ou null si non trouvé
 */
export async function updatePost(
  postId: string,
  updates: Partial<Pick<Post, 'content' | 'tags' | 'location'>>
): Promise<Post | null> {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const post = mockPosts.find(p => p.id === postId);
  
  if (!post) {
    console.error(`❌ Post ${postId} non trouvé`);
    return null;
  }
  
  // Appliquer les mises à jour
  const updatedPost: Post = {
    ...post,
    ...(updates.content !== undefined && { content: updates.content }),
    ...(updates.tags !== undefined && { tags: updates.tags }),
    ...(updates.location !== undefined && { location: updates.location }),
    // Ajouter un timestamp de dernière modification
    updatedAt: new Date()
  };
  
  // Mettre à jour dans les données mockées
  const index = mockPosts.findIndex(p => p.id === postId);
  if (index !== -1) {
    mockPosts[index] = updatedPost;
  }
  
  console.log(`✅ Post ${postId} mis à jour avec succès`);
  return updatedPost;
}

/**
 * Édite une idée existante
 * @param ideaId - ID de l'idée à éditer
 * @param updates - Nouvelles données de l'idée
 * @returns L'idée mise à jour ou null si non trouvée
 */
export async function updateIdea(
  ideaId: string,
  updates: Partial<Pick<Idea, 'title' | 'summary' | 'description' | 'tags' | 'location'>>
): Promise<Idea | null> {
  // Simuler un délai réseau
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const idea = mockIdeas.find(i => i.id === ideaId);
  
  if (!idea) {
    console.error(`❌ Idée ${ideaId} non trouvée`);
    return null;
  }
  
  // Appliquer les mises à jour
  const updatedIdea: Idea = {
    ...idea,
    ...(updates.title !== undefined && { title: updates.title }),
    ...(updates.summary !== undefined && { summary: updates.summary }),
    ...(updates.description !== undefined && { description: updates.description }),
    ...(updates.tags !== undefined && { tags: updates.tags }),
    ...(updates.location !== undefined && { location: updates.location }),
    // Ajouter un timestamp de dernière modification
    updatedAt: new Date()
  };
  
  // Mettre à jour dans les données mockées
  const index = mockIdeas.findIndex(i => i.id === ideaId);
  if (index !== -1) {
    mockIdeas[index] = updatedIdea;
  }
  
  console.log(`✅ Idée ${ideaId} mise à jour avec succès`);
  return updatedIdea;
}