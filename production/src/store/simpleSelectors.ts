import { SimpleEntityStore } from './SimpleEntityStore';
import { User, Idea, Post, DiscussionTopic, Community, CommunityMembership } from '../types';

/**
 * Selectors simples pour extraire des données du store
 */

// User selectors
export const getCurrentUser = (store: SimpleEntityStore): User | null => {
  if (!store.currentUserId) return null;
  return store.users[store.currentUserId] || null;
};

export const getUserById = (store: SimpleEntityStore) => (userId: string): User | null => {
  return store.users[userId] || null;
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

export const getSelectedIdea = (store: SimpleEntityStore): Idea | null => {
  if (!store.selectedIdeaId) return null;
  return store.ideas[store.selectedIdeaId] || null;
};

export const getFeaturedIdeas = (store: SimpleEntityStore): Idea[] => {
  return Object.values(store.ideas).filter(idea => idea.status === 'featured');
};

export const getPublishedIdeas = (store: SimpleEntityStore): Idea[] => {
  return Object.values(store.ideas).filter(idea => idea.status === 'published');
};

export const getUserIdeas = (store: SimpleEntityStore) => (userId: string): Idea[] => {
  return Object.values(store.ideas).filter(idea => 
    idea.creators?.some(creator => creator.id === userId)
  );
};

export const getDraftIdeas = (store: SimpleEntityStore): Idea[] => {
  const currentUser = getCurrentUser(store);
  if (!currentUser) return [];
  
  return Object.values(store.ideas).filter(idea => 
    idea.status === 'draft' && 
    idea.creators?.some(creator => creator.id === currentUser.id)
  );
};

// Post selectors
export const getAllPosts = (store: SimpleEntityStore): Post[] => {
  return Object.values(store.posts);
};

export const getPostById = (store: SimpleEntityStore) => (postId: string): Post | null => {
  return store.posts[postId] || null;
};

export const getSelectedPost = (store: SimpleEntityStore): Post | null => {
  if (!store.selectedPostId) return null;
  return store.posts[store.selectedPostId] || null;
};

export const getSelectedUser = (store: SimpleEntityStore): User | null => {
  if (!store.selectedUserId) return null;
  return store.users[store.selectedUserId] || null;
};

export const getUserPosts = (store: SimpleEntityStore) => (userId: string): Post[] => {
  return Object.values(store.posts).filter(post => post.author.id === userId);
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
    idea.supporters?.some(supporter => supporter.id === userId)
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

// Community selectors
export const getAllCommunities = (store: SimpleEntityStore): Community[] => {
  return Object.values(store.communities);
};

export const getCommunityById = (store: SimpleEntityStore) => (communityId: string): Community | null => {
  return store.communities[communityId] || null;
};

export const getSelectedCommunity = (store: SimpleEntityStore): Community | null => {
  if (!store.selectedCommunityId) return null;
  return store.communities[store.selectedCommunityId] || null;
};

export const getUserCommunities = (store: SimpleEntityStore) => (userId: string): Community[] => {
  const userMemberships = Object.values(store.communityMemberships)
    .filter(membership => membership.userId === userId && membership.isActive);
  
  return userMemberships
    .map(membership => store.communities[membership.communityId])
    .filter(Boolean);
};

export const getCommunityMembership = (store: SimpleEntityStore) => (userId: string, communityId: string): CommunityMembership | null => {
  const membershipId = `${userId}-${communityId}`;
  return store.communityMemberships[membershipId] || null;
};

export const isUserMemberOfCommunity = (store: SimpleEntityStore) => (userId: string, communityId: string): boolean => {
  const membership = getCommunityMembership(store)(userId, communityId);
  return membership ? membership.isActive : false;
};

export const getCommunityMembers = (store: SimpleEntityStore) => (communityId: string): User[] => {
  const communityMemberships = Object.values(store.communityMemberships)
    .filter(membership => membership.communityId === communityId && membership.isActive);
  
  return communityMemberships
    .map(membership => store.users[membership.userId])
    .filter(Boolean);
};

export const searchCommunities = (store: SimpleEntityStore) => (query: string): Community[] => {
  if (!query.trim()) return getAllCommunities(store);
  
  const lowercaseQuery = query.toLowerCase();
  return getAllCommunities(store).filter(community =>
    community.name.toLowerCase().includes(lowercaseQuery) ||
    community.description.toLowerCase().includes(lowercaseQuery) ||
    community.shortDescription.toLowerCase().includes(lowercaseQuery) ||
    community.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};