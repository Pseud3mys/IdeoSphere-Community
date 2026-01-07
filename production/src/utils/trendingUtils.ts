import { Idea, Post, DiscussionTopic } from '../types';

/**
 * Calcule le nombre d'utilisateurs uniques qui ont interagi avec un post
 * Interactions comptées : soutiens + commentaires (replies)
 */
export function getUniqueEngagementForPost(post: Post): number {
  const uniqueUsers = new Set<string>();
  
  // Ajouter les supporters
  if (post.supporters && post.supporters.length > 0) {
    post.supporters.forEach(userId => uniqueUsers.add(userId));
  }
  
  // Ajouter les auteurs des commentaires (replies)
  if (post.replies && post.replies.length > 0) {
    post.replies.forEach(reply => {
      if (reply.authorId) {
        uniqueUsers.add(reply.authorId);
      }
    });
  }
  
  return uniqueUsers.size;
}

/**
 * Calcule le nombre d'utilisateurs uniques qui ont interagi avec une idée
 * Interactions comptées : 
 * - Soutiens
 * - Nombre de discussions (compte 1 par discussion, pas les participants individuels)
 * - Lineage (idées/posts dérivés avant/après)
 */
export function getUniqueEngagementForIdea(
  idea: Idea, 
  allDiscussions?: DiscussionTopic[]
): number {
  const uniqueUsers = new Set<string>();
  
  // 1. Ajouter les supporters
  if (idea.supporters && idea.supporters.length > 0) {
    idea.supporters.forEach(userId => uniqueUsers.add(userId));
  }
  
  // 2. Ajouter les créateurs de discussions
  // Pour les discussions, on compte uniquement le créateur de la discussion
  // (pas tous les commentateurs, car c'est déjà une interaction indirecte)
  if (idea.discussionIds && idea.discussionIds.length > 0 && allDiscussions) {
    idea.discussionIds.forEach(discussionId => {
      const discussion = allDiscussions.find(d => d.id === discussionId);
      if (discussion && discussion.creatorId) {
        uniqueUsers.add(discussion.creatorId);
      }
    });
  }
  
  // 3. Le lineage compte comme un "boost" de popularité mais pas comme des utilisateurs
  // On le traite séparément dans le score de tendance
  
  return uniqueUsers.size;
}

/**
 * Calcule le score de lineage d'une idée (impact du réseau avant/après)
 */
export function getLineageScore(idea: Idea): number {
  let score = 0;
  
  // Sources (idées/posts qui ont inspiré celle-ci)
  if (idea.sourceIdeas) score += idea.sourceIdeas.length;
  if (idea.sourcePosts) score += idea.sourcePosts.length;
  
  // Dérivations (idées/posts créés à partir de celle-ci)
  if (idea.derivedIdeas) score += idea.derivedIdeas.length;
  
  return score;
}

/**
 * Calcule un score de tendance combinant popularité et récence
 * 
 * @param uniqueEngagement - Nombre d'utilisateurs uniques ayant interagi
 * @param createdAt - Date de création du contenu
 * @param lineageScore - Score de lineage (optionnel, pour les idées)
 * @returns Score de tendance (plus élevé = plus tendance)
 */
export function getTrendingScore(
  uniqueEngagement: number,
  createdAt: Date,
  lineageScore: number = 0
): number {
  // Calcul de la récence (en heures)
  const now = new Date();
  const ageInHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  
  // Facteur de décroissance temporelle (decay)
  // Les contenus perdent 50% de leur score tous les 7 jours (168 heures)
  const halfLife = 168; // heures
  const timeDecay = Math.pow(0.5, ageInHours / halfLife);
  
  // Score de base = engagement unique
  const engagementScore = uniqueEngagement;
  
  // Bonus pour le lineage (moins important que l'engagement direct)
  const lineageBonus = lineageScore * 0.3; // 30% du poids d'une interaction directe
  
  // Score final = (engagement + lineage bonus) * décroissance temporelle
  const finalScore = (engagementScore + lineageBonus) * timeDecay;
  
  return finalScore;
}

/**
 * Calcule le score de tendance pour un post
 */
export function getPostTrendingScore(post: Post): number {
  const uniqueEngagement = getUniqueEngagementForPost(post);
  return getTrendingScore(uniqueEngagement, post.createdAt);
}

/**
 * Calcule le score de tendance pour une idée
 */
export function getIdeaTrendingScore(
  idea: Idea,
  allDiscussions?: DiscussionTopic[]
): number {
  const uniqueEngagement = getUniqueEngagementForIdea(idea, allDiscussions);
  const lineageScore = getLineageScore(idea);
  return getTrendingScore(uniqueEngagement, idea.createdAt, lineageScore);
}

/**
 * Trie un tableau mixte de posts et idées par score de tendance
 */
export function sortByTrending<T extends { type: 'post' | 'idea' } & (Post | Idea)>(
  items: T[],
  allDiscussions?: DiscussionTopic[]
): T[] {
  return items.sort((a, b) => {
    const aScore = a.type === 'post' 
      ? getPostTrendingScore(a as Post)
      : getIdeaTrendingScore(a as Idea, allDiscussions);
    
    const bScore = b.type === 'post'
      ? getPostTrendingScore(b as Post)
      : getIdeaTrendingScore(b as Idea, allDiscussions);
    
    return bScore - aScore; // Ordre décroissant
  });
}

/**
 * Algorithme de tri alterné : mélange de tendance et aléatoire
 * Pattern : random, tendance #1, random, tendance #2, random, tendance #3, etc.
 * 
 * @param items - Tableau d'items à trier
 * @param allDiscussions - Toutes les discussions (pour calculer le score des idées)
 * @returns Tableau trié avec alternance tendance/aléatoire
 */
export function sortByAlternatingTrendingRandom<T extends { type: 'post' | 'idea' } & (Post | Idea)>(
  items: T[],
  allDiscussions?: DiscussionTopic[]
): T[] {
  if (items.length === 0) return items;
  
  // 1. Trier tous les items par tendance pour avoir le classement
  const sortedByTrending = [...items].sort((a, b) => {
    const aScore = a.type === 'post' 
      ? getPostTrendingScore(a as Post)
      : getIdeaTrendingScore(a as Idea, allDiscussions);
    
    const bScore = b.type === 'post'
      ? getPostTrendingScore(b as Post)
      : getIdeaTrendingScore(b as Idea, allDiscussions);
    
    return bScore - aScore;
  });
  
  // 2. Créer un pool aléatoire (mélanger tous les items)
  const randomPool = [...items].sort(() => Math.random() - 0.5);
  
  // 3. Alterner : random, tendance, random, tendance, etc.
  const result: T[] = [];
  let trendingIndex = 0;
  let randomIndex = 0;
  const usedIds = new Set<string>();
  
  for (let i = 0; i < items.length; i++) {
    // Alterner : positions impaires = random, positions paires = tendance
    if (i % 2 === 0) {
      // Position paire (0, 2, 4...) : prendre un item aléatoire
      while (randomIndex < randomPool.length) {
        const item = randomPool[randomIndex];
        const itemId = 'id' in item ? item.id : '';
        randomIndex++;
        
        if (!usedIds.has(itemId)) {
          usedIds.add(itemId);
          result.push(item);
          break;
        }
      }
    } else {
      // Position impaire (1, 3, 5...) : prendre le prochain item de tendance
      while (trendingIndex < sortedByTrending.length) {
        const item = sortedByTrending[trendingIndex];
        const itemId = 'id' in item ? item.id : '';
        trendingIndex++;
        
        if (!usedIds.has(itemId)) {
          usedIds.add(itemId);
          result.push(item);
          break;
        }
      }
    }
  }
  
  return result;
}
