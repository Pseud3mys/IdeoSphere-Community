import { SimpleEntityStore } from './SimpleEntityStore';
import { User, Idea, Post, DiscussionTopic, Group, GroupMembership, PendingGroupCreation, GroupLink } from '../types';
import { unknownUser } from '../data/users';

/**
 * Selectors simples pour extraire des données du store
 */

// System selectors
export const isStoreInitialized = (store: SimpleEntityStore): boolean => {
  return store.isInitialized;
};

// User selectors
export const getCurrentUser = (store: SimpleEntityStore): User | null => {
  if (!store.currentUserId) return null;
  return store.users[store.currentUserId] || null;
};

/**
 * ✅ Récupère un utilisateur par ID avec fallback automatique
 * @returns L'utilisateur trouvé, ou unknownUser si non trouvé (jamais null)
 */
export const getUserById = (store: SimpleEntityStore) => (userId: string): User => {
  return store.users[userId] || unknownUser;
};

/**
 * ✅ Vérifie si un utilisateur existe réellement dans le store
 * @returns true si l'utilisateur existe, false sinon
 */
export const userExists = (store: SimpleEntityStore) => (userId: string): boolean => {
  return userId in store.users;
};

export const getAllUsers = (store: SimpleEntityStore): User[] => {
  return Object.values(store.users);
};

// Idea selectors
export const getAllIdeas = (store: SimpleEntityStore): Idea[] => {
  return Object.values(store.ideas);
};

export const getIdeaById = (store: SimpleEntityStore) => (ideaId: string): Idea | null => {
  return store.ideas[ideaId] || null;
};

// NOTE MIGRATION PHASE 5: getSelectedIdea supprimé (selectedIdeaId n'existe plus)
// Utilisez getIdeaById() avec l'ID depuis useParams() à la place

export const getFeaturedIdeas = (store: SimpleEntityStore): Idea[] => {
  return Object.values(store.ideas).filter(idea => idea.status === 'featured');
};

export const getPublishedIdeas = (store: SimpleEntityStore): Idea[] => {
  return Object.values(store.ideas).filter(idea => idea.status === 'published');
};

export const getUserIdeas = (store: SimpleEntityStore) => (userId: string): Idea[] => {
  return Object.values(store.ideas).filter(idea => 
    idea.creatorIds?.includes(userId)
  );
};

export const getDraftIdeas = (store: SimpleEntityStore): Idea[] => {
  const currentUser = getCurrentUser(store);
  if (!currentUser) return [];
  
  return Object.values(store.ideas).filter(idea => 
    idea.status === 'draft' && 
    idea.creatorIds?.includes(currentUser.id)
  );
};

// Post selectors
export const getAllPosts = (store: SimpleEntityStore): Post[] => {
  return Object.values(store.posts);
};

export const getPostById = (store: SimpleEntityStore) => (postId: string): Post | null => {
  return store.posts[postId] || null;
};

// NOTE MIGRATION PHASE 5: getSelectedPost supprimé (selectedPostId n'existe plus)
// Utilisez getPostById() avec l'ID depuis useParams() à la place

// NOTE MIGRATION PHASE 5: getSelectedUser supprimé (selectedUserId n'existe plus)
// Utilisez getUserById() avec l'ID depuis useParams() à la place

export const getUserPosts = (store: SimpleEntityStore) => (userId: string): Post[] => {
  return Object.values(store.posts).filter(post => post.authorId === userId);
};

export const getPostsByIds = (store: SimpleEntityStore) => (postIds: string[]): Post[] => {
  return postIds.map(id => store.posts[id]).filter(Boolean);
};

// Discussion selectors
export const getAllDiscussionTopics = (store: SimpleEntityStore): DiscussionTopic[] => {
  return Object.values(store.discussionTopics);
};

export const getDiscussionTopicById = (store: SimpleEntityStore) => (topicId: string): DiscussionTopic | null => {
  return store.discussionTopics[topicId] || null;
};

export const getDiscussionTopicsByIds = (store: SimpleEntityStore) => (topicIds: string[]): DiscussionTopic[] => {
  return topicIds.map(id => store.discussionTopics[id]).filter(Boolean);
};

// Feed selectors (combine ideas and posts) - Structure standardisée
export const getFeedItems = (store: SimpleEntityStore): { posts: Post[]; ideas: Idea[] } => {
  // Si des IDs de feed sont définis, utiliser uniquement ceux-là
  if (store.feedIdeaIds.length > 0 || store.feedPostIds.length > 0) {
    const ideas = store.feedIdeaIds
      .map(id => store.ideas[id])
      .filter(Boolean) as Idea[];
    
    const posts = store.feedPostIds
      .map(id => store.posts[id])
      .filter(Boolean) as Post[];
    
    return {
      posts: posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
      ideas: ideas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    };
  }
  
  // Sinon, fallback vers le comportement par défaut (tous les posts et idées publiées)
  const ideas = getPublishedIdeas(store);
  const posts = getAllPosts(store);
  
  return {
    posts: posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    ideas: ideas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  };
};

// Version compatible pour les composants existants qui attendent un array mixte
export const getFeedItemsFlat = (store: SimpleEntityStore): (Idea & { type: 'idea' } | Post & { type: 'post' })[] => {
  const { posts, ideas } = getFeedItems(store);
  
  // Ajouter le discriminant de type et combiner
  const combined = [
    ...posts.map(post => ({ ...post, type: 'post' as const })),
    ...ideas.map(idea => ({ ...idea, type: 'idea' as const }))
  ];
  
  return combined.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};

// Home page selectors
export const getHomePageData = (store: SimpleEntityStore) => {
  const featuredIdeas = getFeaturedIdeas(store);
  const allIdeas = getPublishedIdeas(store);
  const allPosts = getAllPosts(store);
  
  // Propositions récemment partagées = mix d'idées et posts récents
  const { posts, ideas } = getFeedItems(store);
  const recentSharedPropositions = [
    ...posts.slice(0, 3).map(post => ({ ...post, type: 'post' as const })),
    ...ideas.slice(0, 3).map(idea => ({ ...idea, type: 'idea' as const }))
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  // Calcul du total des soutiens (dynamique depuis le tableau supporters)
  const totalSupports = allIdeas.reduce((sum, idea) => sum + (idea.supporters?.length || 0), 0);

  return {
    featuredIdeas,
    recentSharedPropositions,
    totalContributions: totalSupports,
    totalIdeas: allIdeas.length,
    totalSupports,
    trendingIdeas: featuredIdeas
  };
};

// Search selectors
export const searchIdeas = (store: SimpleEntityStore) => (query: string): Idea[] => {
  if (!query.trim()) return getPublishedIdeas(store);
  
  const lowercaseQuery = query.toLowerCase();
  return getPublishedIdeas(store).filter(idea =>
    idea.title.toLowerCase().includes(lowercaseQuery) ||
    idea.summary.toLowerCase().includes(lowercaseQuery) ||
    idea.description.toLowerCase().includes(lowercaseQuery) ||
    (idea.tags && idea.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
  );
};

export const searchPosts = (store: SimpleEntityStore) => (query: string): Post[] => {
  if (!query.trim()) return getAllPosts(store);
  
  const lowercaseQuery = query.toLowerCase();
  return getAllPosts(store).filter(post =>
    post.content.toLowerCase().includes(lowercaseQuery) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
  );
};

// Statistics selectors
export const getUserStats = (store: SimpleEntityStore) => (userId: string) => {
  const userIdeas = getUserIdeas(store)(userId);
  const userPosts = getUserPosts(store)(userId);
  
  const supportedIdeas = Object.values(store.ideas).filter(idea =>
    idea.supporters?.includes(userId) // ✅ supporters est maintenant string[]
  );
  
  const totalPostSupports = userPosts.reduce((sum, post) => sum + (post.supporters?.length || 0), 0);
  const totalIdeaSupports = userIdeas.reduce((sum, idea) => sum + (idea.supporters?.length || 0), 0);

  return {
    ideasCreated: userIdeas.length,
    postsCreated: userPosts.length,
    ideasSupported: supportedIdeas.length,
    totalLikesReceived: totalPostSupports, // Soutiens reçus sur les posts
    totalSupportsReceived: totalIdeaSupports // Soutiens reçus sur les idées
  };
};

// ========================================
// Group selectors
// ========================================

export const getAllGroups = (store: SimpleEntityStore): Group[] => {
  return Object.values(store.groups);
};

export const getGroupById = (store: SimpleEntityStore) => (groupId: string): Group | null => {
  return store.groups[groupId] || null;
};

export const getActiveGroups = (store: SimpleEntityStore): Group[] => {
  return Object.values(store.groups).filter(group => group.isActive);
};

export const getGroupsByType = (store: SimpleEntityStore) => (type: Group['type']): Group[] => {
  return Object.values(store.groups).filter(group => group.type === type && group.isActive);
};

export const getUserGroups = (store: SimpleEntityStore) => (userId: string): Group[] => {
  const userMemberships = Object.values(store.groupMemberships)
    .filter(membership => membership.userId === userId && membership.isActive);
  
  return userMemberships
    .map(membership => store.groups[membership.groupId])
    .filter(Boolean);
};

// ✅ NOUVELLE: Retourne les groupes ET les memberships de l'utilisateur
export const getUserGroupsWithMemberships = (store: SimpleEntityStore) => (userId: string): Array<{
  group: Group;
  membership: GroupMembership;
}> => {
  const userMemberships = Object.values(store.groupMemberships)
    .filter(membership => membership.userId === userId && membership.isActive);
  
  return userMemberships
    .map(membership => {
      const group = store.groups[membership.groupId];
      if (!group) return null;
      return { group, membership };
    })
    .filter(Boolean) as Array<{ group: Group; membership: GroupMembership }>;
};

export const getGroupMembership = (store: SimpleEntityStore) => (userId: string, groupId: string): GroupMembership | null => {
  const membershipId = `${userId}-${groupId}`;
  return store.groupMemberships[membershipId] || null;
};

export const isUserMemberOfGroup = (store: SimpleEntityStore) => (userId: string, groupId: string): boolean => {
  const membership = getGroupMembership(store)(userId, groupId);
  return membership ? membership.isActive : false;
};

export const isUserAnimatorOfGroup = (store: SimpleEntityStore) => (userId: string, groupId: string): boolean => {
  const membership = getGroupMembership(store)(userId, groupId);
  return membership ? membership.isActive && membership.role === 'animator' : false;
};

export const getGroupMembers = (store: SimpleEntityStore) => (groupId: string): User[] => {
  const groupMemberships = Object.values(store.groupMemberships)
    .filter(membership => membership.groupId === groupId && membership.isActive);
  
  return groupMemberships
    .map(membership => store.users[membership.userId])
    .filter(Boolean);
};

export const getGroupAnimators = (store: SimpleEntityStore) => (groupId: string): User[] => {
  const groupMemberships = Object.values(store.groupMemberships)
    .filter(membership => membership.groupId === groupId && membership.isActive && membership.role === 'animator');
  
  return groupMemberships
    .map(membership => store.users[membership.userId])
    .filter(Boolean);
};

export const searchGroups = (store: SimpleEntityStore) => (query: string): Group[] => {
  if (!query.trim()) return getActiveGroups(store);
  
  const lowercaseQuery = query.toLowerCase();
  return getActiveGroups(store).filter(group =>
    group.name.toLowerCase().includes(lowercaseQuery) ||
    group.description.toLowerCase().includes(lowercaseQuery) ||
    group.shortDescription.toLowerCase().includes(lowercaseQuery) ||
    group.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Sélecteurs pour le feed d'un groupe
// NOTE: Support pour groupIds (tableau) - Migration Phase 5
export const getGroupIdeas = (store: SimpleEntityStore) => (groupId: string): Idea[] => {
  return Object.values(store.ideas).filter(idea => 
    idea.groupIds?.includes(groupId) || idea.groupId === groupId
  );
};

export const getGroupPosts = (store: SimpleEntityStore) => (groupId: string): Post[] => {
  return Object.values(store.posts).filter(post => 
    post.groupIds?.includes(groupId) || post.groupId === groupId
  );
};

export const getGroupFeed = (store: SimpleEntityStore) => (groupId: string): { posts: Post[]; ideas: Idea[] } => {
  const ideas = getGroupIdeas(store)(groupId);
  const posts = getGroupPosts(store)(groupId);
  
  return {
    posts: posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    ideas: ideas.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  };
};

// ========================================
// Pending Group Creations selectors (Phase 2)
// ========================================

export const getAllPendingGroupCreations = (store: SimpleEntityStore): PendingGroupCreation[] => {
  return Object.values(store.pendingGroupCreations);
};

export const getPendingGroupCreationById = (store: SimpleEntityStore) => (pendingId: string): PendingGroupCreation | null => {
  return store.pendingGroupCreations[pendingId] || null;
};

export const getUserPendingGroupCreations = (store: SimpleEntityStore) => (userId: string): PendingGroupCreation[] => {
  const allPending = Object.values(store.pendingGroupCreations);
  const filtered = allPending.filter(pg => pg.founders.includes(userId));
  
  console.log(`🔍 [Selector.getUserPendingGroupCreations] User: ${userId}, Total: ${allPending.length}, Filtered: ${filtered.length}`);
  
  return filtered;
};

export const getPendingGroupStatus = (store: SimpleEntityStore) => (pendingId: string, userId: string): {
  hasConfirmed: boolean;
  confirmationCount: number;
  totalFounders: number;
  isComplete: boolean;
} | null => {
  const pendingGroup = store.pendingGroupCreations[pendingId];
  
  if (!pendingGroup) return null;
  
  return {
    hasConfirmed: pendingGroup.confirmations.includes(userId),
    confirmationCount: pendingGroup.confirmations.length,
    totalFounders: pendingGroup.founders.length,
    isComplete: pendingGroup.confirmations.length === pendingGroup.founders.length,
  };
};

// ========================================
// Group Links selectors (Phase 4)
// ========================================

export const getAllGroupLinks = (store: SimpleEntityStore) => {
  return Object.values(store.groupLinks);
};

export const getGroupLinkById = (store: SimpleEntityStore) => (linkId: string) => {
  return store.groupLinks[linkId] || null;
};

/**
 * Récupère tous les liens d'un groupe (parents, enfants, partenaires)
 */
export const getGroupLinks = (store: SimpleEntityStore) => (groupId: string) => {
  const allLinks = Object.values(store.groupLinks);
  
  const parentLinks = allLinks.filter(link => 
    link.type === 'vertical' && link.childGroupId === groupId
  );
  
  const childLinks = allLinks.filter(link => 
    link.type === 'vertical' && link.parentGroupId === groupId
  );
  
  const partnerLinks = allLinks.filter(link => 
    link.type === 'horizontal' && (link.groupId1 === groupId || link.groupId2 === groupId)
  );
  
  return { parentLinks, childLinks, partnerLinks };
};

/**
 * Récupère les groupes parents d'un groupe
 */
export const getGroupParents = (store: SimpleEntityStore) => (groupId: string): Group[] => {
  const { parentLinks } = getGroupLinks(store)(groupId);
  
  return parentLinks
    .map(link => store.groups[link.parentGroupId])
    .filter(Boolean);
};

/**
 * Récupère les groupes enfants d'un groupe
 */
export const getGroupChildren = (store: SimpleEntityStore) => (groupId: string): Group[] => {
  const { childLinks } = getGroupLinks(store)(groupId);
  
  return childLinks
    .map(link => store.groups[link.childGroupId])
    .filter(Boolean);
};

/**
 * Récupère les groupes partenaires d'un groupe
 */
export const getGroupPartners = (store: SimpleEntityStore) => (groupId: string): Group[] => {
  const { partnerLinks } = getGroupLinks(store)(groupId);
  
  return partnerLinks
    .map(link => {
      if (link.type === 'horizontal') {
        const partnerId = link.groupId1 === groupId ? link.groupId2 : link.groupId1;
        return store.groups[partnerId];
      }
      return null;
    })
    .filter(Boolean) as Group[];
};

/**
 * Vérifie si un lien existe déjà entre deux groupes
 */
export const hasGroupLink = (store: SimpleEntityStore) => (groupId1: string, groupId2: string): boolean => {
  const allLinks = Object.values(store.groupLinks);
  
  return allLinks.some(link => {
    if (link.type === 'vertical') {
      return (link.parentGroupId === groupId1 && link.childGroupId === groupId2) ||
             (link.parentGroupId === groupId2 && link.childGroupId === groupId1);
    } else {
      return (link.groupId1 === groupId1 && link.groupId2 === groupId2) ||
             (link.groupId1 === groupId2 && link.groupId2 === groupId1);
    }
  });
};