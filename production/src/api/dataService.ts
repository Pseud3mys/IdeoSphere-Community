// src/services/dataService.ts
// ATTENTION : Ce fichier est une version de transition ("shim").
// Il expose les mêmes fonctions que l'ancien dataService pour éviter les erreurs d'import,
// mais il ne charge aucune donnée et ne fait rien.
// Il doit être supprimé une fois que tous les appels ont été migrés vers apiService.

import { User, Idea, Post, DiscussionTopic } from '../types';

// Interface pour la compatibilité
export interface MockDataSet {
  ideas: Idea[];
  posts: Post[];
  users: User[];
  currentUser: User;
  guestUser: User;
  discussions: DiscussionTopic[];
}

const emptyUser: User = {
  id: 'shim-user',
  name: 'Utilisateur de transition',
  email: '',
  createdAt: new Date(),
  isRegistered: false
};

/**
 * Ne fait rien. Retourne un dataset vide.
 */
export async function loadMockDataSet(): Promise<MockDataSet> {
  console.warn("dataService.loadMockDataSet a été appelé mais est obsolète.");
  return Promise.resolve({
    ideas: [],
    posts: [],
    users: [],
    currentUser: emptyUser,
    guestUser: emptyUser,
    discussions: [],
  });
}

/**
 * Ne fait rien.
 */
export function invalidateMockDataCache(): void {
  // Fonction vide
}

/**
 * Ne fait rien. Retourne null.
 */
export async function getUserById(userId: string): Promise<User | null> {
  console.warn(`dataService.getUserById(${userId}) a été appelé mais est obsolète.`);
  return Promise.resolve(null);
}

/**
 * Ne fait rien. Retourne null.
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  console.warn(`dataService.getUserByEmail(${email}) a été appelé mais est obsolète.`);
  return Promise.resolve(null);
}

/**
 * Ne fait rien. Retourne null.
 */
export async function getIdeaById(ideaId: string): Promise<Idea | null> {
  console.warn(`dataService.getIdeaById(${ideaId}) a été appelé mais est obsolète.`);
  return Promise.resolve(null);
}

/**
 * Ne fait rien. Retourne null.
 */
export async function getPostById(postId: string): Promise<Post | null> {
  console.warn(`dataService.getPostById(${postId}) a été appelé mais est obsolète.`);
  return Promise.resolve(null);
}

/**
 * Ne fait rien. Retourne un tableau vide.
 */
export async function getIdeasByUserId(userId: string): Promise<Idea[]> {
  console.warn(`dataService.getIdeasByUserId(${userId}) a été appelé mais est obsolète.`);
  return Promise.resolve([]);
}

/**
 * Ne fait rien. Retourne un tableau vide.
 */
export async function getPostsByUserId(userId: string): Promise<Post[]> {
  console.warn(`dataService.getPostsByUserId(${userId}) a été appelé mais est obsolète.`);
  return Promise.resolve([]);
}

/**
 * Ne fait rien. Retourne un tableau vide.
 */
export async function getAllDiscussions(): Promise<DiscussionTopic[]> {
  console.warn("dataService.getAllDiscussions a été appelé mais est obsolète.");
  return Promise.resolve([]);
}

/**
 * Ne fait rien. Retourne un tableau vide.
 */
export async function getAllIdeas(): Promise<Idea[]> {
  console.warn("dataService.getAllIdeas a été appelé mais est obsolète.");
  return Promise.resolve([]);
}

/**
 * Ne fait rien. Retourne un tableau vide.
 */
export async function getAllPosts(): Promise<Post[]> {
  console.warn("dataService.getAllPosts a été appelé mais est obsolète.");
  return Promise.resolve([]);
}

/**
 * Ne fait rien. Retourne un tableau vide.
 */
export async function getAllUsers(): Promise<User[]> {
  console.warn("dataService.getAllUsers a été appelé mais est obsolète.");
  return Promise.resolve([]);
}