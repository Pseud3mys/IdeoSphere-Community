import { Idea, Post, User } from '../types';

/**
 * Service pour calculer les statistiques de santé de la plateforme
 * Architecture: Composants → useStore → API Services → données mockées
 */

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
 * Calcule le coefficient de Gini pour mesurer l'inégalité de distribution
 * @param values Tableau de valeurs (ex: nombre de contributions par utilisateur)
 * @returns Coefficient entre 0 (égalité parfaite) et 1 (inégalité maximale)
 */
function calculateGini(values: number[]): number {
  if (values.length === 0) return 0;
  
  // Trier les valeurs
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  
  // Calculer le Gini
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += (2 * (i + 1) - n - 1) * sorted[i];
  }
  
  const total = sorted.reduce((acc, val) => acc + val, 0);
  if (total === 0) return 0;
  
  return sum / (n * total);
}

/**
 * Calcule l'index Herfindahl-Hirschman pour mesurer la concentration
 * @param values Tableau de valeurs
 * @returns Index entre 0 (dispersion parfaite) et 1 (concentration maximale)
 */
function calculateHerfindahl(values: number[]): number {
  const total = values.reduce((acc, val) => acc + val, 0);
  if (total === 0) return 0;
  
  // HHI = Somme des carrés des parts de marché
  const hhi = values.reduce((acc, val) => {
    const share = val / total;
    return acc + share * share;
  }, 0);
  
  return hhi;
}

/**
 * Calcule les percentiles d'une distribution
 */
function calculatePercentiles(values: number[]): { p50: number; p75: number; p90: number; p95: number } {
  if (values.length === 0) return { p50: 0, p75: 0, p90: 0, p95: 0 };
  
  const sorted = [...values].sort((a, b) => a - b);
  const getPercentile = (p: number) => {
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  };
  
  return {
    p50: getPercentile(50),
    p75: getPercentile(75),
    p90: getPercentile(90),
    p95: getPercentile(95),
  };
}

/**
 * Calcule la distribution de participation
 */
function calculateParticipationDistribution(
  users: User[],
  ideas: Idea[],
  posts: Post[]
): ParticipationDistribution {
  // Compter les contributions par utilisateur
  const contributionsByUser = new Map<string, number>();
  
  // Initialiser tous les utilisateurs à 0
  users.forEach(user => {
    contributionsByUser.set(user.id, 0);
  });
  
  // Compter les idées
  ideas.forEach(idea => {
    idea.creatorIds.forEach(creatorId => {
      contributionsByUser.set(creatorId, (contributionsByUser.get(creatorId) || 0) + 1);
    });
  });
  
  // Compter les posts
  posts.forEach(post => {
    contributionsByUser.set(post.authorId, (contributionsByUser.get(post.authorId) || 0) + 1);
  });
  
  const values = Array.from(contributionsByUser.values());
  
  return {
    gini: calculateGini(values),
    herfindahl: calculateHerfindahl(values),
    percentiles: calculatePercentiles(values),
  };
}

/**
 * Génère les stats de contenu dans le temps
 */
function calculateContentOverTime(ideas: Idea[], posts: Post[]): ContentOverTimeStats {
  const allContent = [...ideas, ...posts].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  
  // Stats journalières (30 derniers jours)
  const dailyMap = new Map<string, number>();
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split('T')[0];
    dailyMap.set(key, 0);
  }
  
  allContent.forEach(content => {
    const date = new Date(content.createdAt).toISOString().split('T')[0];
    if (dailyMap.has(date)) {
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    }
  });
  
  const daily = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));
  
  // Stats hebdomadaires (12 dernières semaines)
  const weeklyMap = new Map<string, number>();
  const getWeekKey = (date: Date) => {
    const year = date.getFullYear();
    const week = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  };
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i * 7);
    const key = getWeekKey(date);
    weeklyMap.set(key, 0);
  }
  
  allContent.forEach(content => {
    const key = getWeekKey(new Date(content.createdAt));
    if (weeklyMap.has(key)) {
      weeklyMap.set(key, (weeklyMap.get(key) || 0) + 1);
    }
  });
  
  const weekly = Array.from(weeklyMap.entries()).map(([week, count]) => ({ week, count }));
  
  // Stats mensuelles (12 derniers mois)
  const monthlyMap = new Map<string, number>();
  const getMonthKey = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  };
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now);
    date.setMonth(date.getMonth() - i);
    const key = getMonthKey(date);
    monthlyMap.set(key, 0);
  }
  
  allContent.forEach(content => {
    const key = getMonthKey(new Date(content.createdAt));
    if (monthlyMap.has(key)) {
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    }
  });
  
  const monthly = Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count }));
  
  return { daily, weekly, monthly };
}

/**
 * Calcule les top contributeurs
 */
function calculateTopContributors(
  users: User[],
  ideas: Idea[],
  posts: Post[]
): UserContributionStats[] {
  const statsMap = new Map<string, UserContributionStats>();
  
  // Initialiser
  users.forEach(user => {
    statsMap.set(user.id, {
      userId: user.id,
      totalContributions: 0,
      ideas: 0,
      posts: 0,
      supportsGiven: 0,
    });
  });
  
  // Compter les idées
  ideas.forEach(idea => {
    idea.creatorIds.forEach(creatorId => {
      const stats = statsMap.get(creatorId);
      if (stats) {
        stats.ideas++;
        stats.totalContributions++;
      }
    });
    
    // Compter les supports
    idea.supporters.forEach(supporterId => {
      const stats = statsMap.get(supporterId);
      if (stats) {
        stats.supportsGiven++;
      }
    });
  });
  
  // Compter les posts
  posts.forEach(post => {
    const stats = statsMap.get(post.authorId);
    if (stats) {
      stats.posts++;
      stats.totalContributions++;
    }
    
    // Compter les supports
    post.supporters.forEach(supporterId => {
      const stats = statsMap.get(supporterId);
      if (stats) {
        stats.supportsGiven++;
      }
    });
  });
  
  return Array.from(statsMap.values())
    .sort((a, b) => b.totalContributions - a.totalContributions)
    .slice(0, 20);
}

/**
 * Calcule les statistiques globales de santé de la plateforme
 */
export async function fetchGlobalHealthStats(
  users: User[],
  ideas: Idea[],
  posts: Post[]
): Promise<GlobalHealthStats> {
  // Simuler un délai API
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const totalSupports = ideas.reduce((acc, idea) => acc + idea.supporters.length, 0) +
                       posts.reduce((acc, post) => acc + post.supporters.length, 0);
  
  const activeUsers = new Set([
    ...ideas.flatMap(i => i.creatorIds),
    ...posts.map(p => p.authorId),
  ]).size;
  
  const participationDistribution = calculateParticipationDistribution(users, ideas, posts);
  const contentOverTime = calculateContentOverTime(ideas, posts);
  const topContributors = calculateTopContributors(users, ideas, posts);
  
  return {
    totalUsers: users.length,
    activeUsers,
    totalContent: ideas.length + posts.length,
    totalIdeas: ideas.length,
    totalPosts: posts.length,
    totalSupports,
    participationDistribution,
    contentOverTime,
    topContributors,
    avgContributionsPerUser: activeUsers > 0 ? (ideas.length + posts.length) / activeUsers : 0,
  };
}

/**
 * Calcule les statistiques de santé pour un groupe spécifique
 */
export async function fetchGroupHealthStats(
  groupId: string,
  groupName: string,
  users: User[],
  ideas: Idea[],
  posts: Post[]
): Promise<GroupHealthStats> {
  // Filtrer le contenu du groupe
  const groupIdeas = ideas.filter(idea => idea.groupIds?.includes(groupId));
  const groupPosts = posts.filter(post => post.groupIds?.includes(groupId));
  
  // Récupérer les stats globales pour ce groupe
  const globalStats = await fetchGlobalHealthStats(users, groupIdeas, groupPosts);
  
  return {
    ...globalStats,
    groupId,
    groupName,
  };
}

/**
 * Génère les données au format Kumu.io
 */
export async function fetchKumuData(
  users: User[],
  ideas: Idea[],
  posts: Post[],
  groups: any[]
): Promise<KumuData> {
  // Simuler un délai API
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const nodes: KumuNode[] = [];
  const connections: KumuConnection[] = [];
  
  // Ajouter les utilisateurs
  users.forEach(user => {
    nodes.push({
      id: user.id,
      label: user.name,
      type: 'user',
      createdAt: user.createdAt.toISOString(),
      location: user.location,
    });
  });
  
  // Ajouter les groupes
  groups.forEach(group => {
    nodes.push({
      id: group.id,
      label: group.name,
      type: 'group',
      createdAt: group.createdAt.toISOString(),
      location: group.location,
      tags: group.tags,
    });
  });
  
  // Ajouter les idées
  ideas.forEach(idea => {
    nodes.push({
      id: idea.id,
      label: idea.title,
      type: 'idea',
      createdAt: idea.createdAt.toISOString(),
      tags: idea.tags,
      location: idea.location,
      supportCount: idea.supporters.length,
    });
    
    // Connexions créateurs
    idea.creatorIds.forEach(creatorId => {
      connections.push({
        from: creatorId,
        to: idea.id,
        type: 'created',
      });
    });
    
    // Connexions supporters
    idea.supporters.forEach(supporterId => {
      connections.push({
        from: supporterId,
        to: idea.id,
        type: 'supports',
      });
    });
    
    // Connexions groupes
    idea.groupIds?.forEach(groupId => {
      connections.push({
        from: idea.id,
        to: groupId,
        type: 'member_of',
      });
    });
    
    // Connexions dérivées
    idea.sourceIdeas.forEach(sourceId => {
      connections.push({
        from: idea.id,
        to: sourceId,
        type: 'derived_from',
      });
    });
    
    idea.sourcePosts.forEach(sourceId => {
      connections.push({
        from: idea.id,
        to: sourceId,
        type: 'derived_from',
      });
    });
  });
  
  // Ajouter les posts
  posts.forEach(post => {
    nodes.push({
      id: post.id,
      label: post.title || post.content.substring(0, 50),
      type: 'post',
      createdAt: post.createdAt.toISOString(),
      tags: post.tags,
      location: post.location,
      supportCount: post.supporters.length,
    });
    
    // Connexion auteur
    connections.push({
      from: post.authorId,
      to: post.id,
      type: 'created',
    });
    
    // Connexions supporters
    post.supporters.forEach(supporterId => {
      connections.push({
        from: supporterId,
        to: post.id,
        type: 'supports',
      });
    });
    
    // Connexions groupes
    post.groupIds?.forEach(groupId => {
      connections.push({
        from: post.id,
        to: groupId,
        type: 'member_of',
      });
    });
    
    // Connexions dérivées
    post.sourcePosts.forEach(sourceId => {
      connections.push({
        from: post.id,
        to: sourceId,
        type: 'derived_from',
      });
    });
  });
  
  return { nodes, connections };
}

/**
 * Génère un export JSON brut des données
 */
export async function fetchRawDataExport(
  users: User[],
  ideas: Idea[],
  posts: Post[],
  groups: any[]
): Promise<any> {
  // Simuler un délai API
  await new Promise(resolve => setTimeout(resolve, 50));
  
  return {
    exportDate: new Date().toISOString(),
    users: users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      location: u.location,
      createdAt: u.createdAt.toISOString(),
    })),
    ideas: ideas.map(i => ({
      id: i.id,
      title: i.title,
      summary: i.summary,
      creatorIds: i.creatorIds,
      status: i.status,
      createdAt: i.createdAt.toISOString(),
      tags: i.tags,
      location: i.location,
      groupIds: i.groupIds,
      supportCount: i.supporters.length,
      sourceIdeas: i.sourceIdeas,
      sourcePosts: i.sourcePosts,
    })),
    posts: posts.map(p => ({
      id: p.id,
      content: p.content,
      authorId: p.authorId,
      createdAt: p.createdAt.toISOString(),
      tags: p.tags,
      location: p.location,
      groupIds: p.groupIds,
      supportCount: p.supporters.length,
      replyCount: p.replies.length,
      sourcePosts: p.sourcePosts,
    })),
    groups: groups.map(g => ({
      id: g.id,
      name: g.name,
      type: g.type,
      memberCount: g.memberCount,
      ideaCount: g.ideaCount,
      projectCount: g.projectCount,
      createdAt: g.createdAt.toISOString(),
      tags: g.tags,
      location: g.location,
    })),
  };
}