import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Idea, Post, DiscussionTopic, TabType, PrefilledContent, Community, CommunityMembership } from '../types';

// Store simple avec les données principales
interface SimpleEntityStore {
  // Données principales (normalisées par ID)
  users: Record<string, User>;
  ideas: Record<string, Idea>;
  posts: Record<string, Post>;
  discussionTopics: Record<string, DiscussionTopic>;
  communities: Record<string, Community>;
  communityMemberships: Record<string, CommunityMembership>;
  
  // États UI
  activeTab: TabType;
  hasEnteredPlatform: boolean;
  showOnboarding: boolean;
  selectedIdeaId: string | null;
  selectedPostId: string | null;
  selectedUserId: string | null;
  selectedCommunityId: string | null;
  currentUserId: string | null;
  
  // États temporaires
  discussionPosts: {[topicId: string]: any[]};
  prefilledSourceIdea: string | null;
  prefilledLinkedContent: PrefilledContent[];
  prefilledSelectedDiscussions: string[];
  prefilledLocation: string | null; // Localisation pré-remplie
  prefilledSourcePostId: string | null; // Post source spécifiquement pour la création
  prefilledSignupData: {
    name?: string;
    email?: string;
  } | null;
  
  // IDs des items du feed (pour filtrer ce qui doit être affiché dans Discovery)
  feedIdeaIds: string[];
  feedPostIds: string[];
  
  // Cache management
  feedLastFetched: number | null;
  contributionsLastFetched: number | null;
}

// Actions pour modifier le store
interface SimpleEntityActions {
  // Actions de données
  setUsers: (users: Record<string, User>) => void;
  addUser: (user: User) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  removeUser: (userId: string) => void;
  
  setIdeas: (ideas: Record<string, Idea>) => void;
  addIdea: (idea: Idea) => void;
  updateIdea: (ideaId: string, updates: Partial<Idea>) => void;
  
  setPosts: (posts: Record<string, Post>) => void;
  addPost: (post: Post) => void;
  updatePost: (postId: string, updates: Partial<Post>) => void;
  
  setDiscussionTopics: (topics: Record<string, DiscussionTopic>) => void;
  addDiscussionTopic: (topic: DiscussionTopic) => void;
  updateDiscussionTopic: (topicId: string, updates: Partial<DiscussionTopic>) => void;
  
  setCommunities: (communities: Record<string, Community>) => void;
  addCommunity: (community: Community) => void;
  updateCommunity: (communityId: string, updates: Partial<Community>) => void;
  
  setCommunityMemberships: (memberships: Record<string, CommunityMembership>) => void;
  addCommunityMembership: (membership: CommunityMembership) => void;
  updateCommunityMembership: (membershipId: string, updates: Partial<CommunityMembership>) => void;
  
  // Actions UI
  setActiveTab: (tab: TabType) => void;
  setHasEnteredPlatform: (entered: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
  setSelectedIdeaId: (id: string | null) => void;
  setSelectedPostId: (id: string | null) => void;
  setSelectedUserId: (id: string | null) => void;
  setSelectedCommunityId: (id: string | null) => void;
  setCurrentUserId: (id: string | null) => void;
  
  // Actions temporaires
  setDiscussionPosts: (posts: {[topicId: string]: any[]}) => void;
  setPrefilledSourceIdea: (id: string | null) => void;
  setPrefilledLinkedContent: (content: PrefilledContent[]) => void;
  setPrefilledSelectedDiscussions: (discussions: string[]) => void;
  setPrefilledLocation: (location: string | null) => void;
  setPrefilledSourcePostId: (id: string | null) => void;
  setPrefilledSignupData: (data: { name?: string; email?: string } | null) => void;
  
  // Actions pour les IDs du feed
  setFeedIdeaIds: (ids: string[]) => void;
  setFeedPostIds: (ids: string[]) => void;
  
  // Actions pour le cache
  setFeedLastFetched: (timestamp: number | null) => void;
  setContributionsLastFetched: (timestamp: number | null) => void;
  invalidateFeedCache: () => void;
  invalidateContributionsCache: () => void;
  
  // Actions combinées
  initializeStore: (initialData: {
    users: User[];
    ideas: Idea[];
    posts: Post[];
    discussionTopics: DiscussionTopic[];
    communities: Community[];
    communityMemberships: CommunityMembership[];
    currentUserId: string;
  }) => void;
}

// Context type
type SimpleEntityStoreContext = {
  store: SimpleEntityStore;
  actions: SimpleEntityActions;
  storeUpdater: StoreUpdater;
} | null;

// Créer le context
const SimpleEntityStoreContext = createContext<SimpleEntityStoreContext>(null);

// Store initial
const createInitialStore = (): SimpleEntityStore => ({
  users: {},
  ideas: {},
  posts: {},
  discussionTopics: {},
  communities: {},
  communityMemberships: {},
  activeTab: 'welcome',
  hasEnteredPlatform: false,
  showOnboarding: false,
  selectedIdeaId: null,
  selectedPostId: null,
  selectedUserId: null,
  selectedCommunityId: null,
  currentUserId: null,
  discussionPosts: {},
  prefilledSourceIdea: null,
  prefilledLinkedContent: [],
  prefilledSelectedDiscussions: [],
  prefilledLocation: null,
  prefilledSourcePostId: null,
  prefilledSignupData: null,
  feedIdeaIds: [],
  feedPostIds: [],
  feedLastFetched: null,
  contributionsLastFetched: null
});

// Fonctions helper pour extraire les utilisateurs des idées et posts
const extractUsersFromIdea = (idea: Idea): User[] => {
  const users: User[] = [];
  
  // Ajouter les créateurs
  if (idea.creators && Array.isArray(idea.creators)) {
    idea.creators.forEach(creator => {
      if (creator && typeof creator === 'object' && 'id' in creator) {
        users.push(creator);
      }
    });
  }
  
  // Les supporters sont maintenant des IDs, pas besoin de les extraire
  
  return users;
};

const extractUsersFromPost = (post: Post): User[] => {
  const users: User[] = [];
  
  // Ajouter l'auteur
  if (post.author && typeof post.author === 'object' && 'id' in post.author) {
    users.push(post.author);
  }
  
  // Ajouter les utilisateurs dans les réponses
  if (post.replies && Array.isArray(post.replies)) {
    post.replies.forEach(reply => {
      if (reply.author && typeof reply.author === 'object' && 'id' in reply.author) {
        users.push(reply.author);
      }
    });
  }
  
  return users;
};

const extractUsersFromDiscussionTopic = (topic: DiscussionTopic): User[] => {
  const users: User[] = [];
  
  // Ajouter l'auteur
  if (topic.author && typeof topic.author === 'object' && 'id' in topic.author) {
    users.push(topic.author);
  }
  
  // Ajouter les utilisateurs dans les posts
  if (topic.posts && Array.isArray(topic.posts)) {
    topic.posts.forEach(post => {
      if (post.author && typeof post.author === 'object' && 'id' in post.author) {
        users.push(post.author);
      }
    });
  }
  
  return users;
};

// Fonctions helper pour normaliser les données
const normalizeUsers = (users: User[]): Record<string, User> => {
  return users.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {} as Record<string, User>);
};

const normalizeIdeas = (ideas: Idea[]): Record<string, Idea> => {
  return ideas.reduce((acc, idea) => {
    acc[idea.id] = idea;
    return acc;
  }, {} as Record<string, Idea>);
};

const normalizePosts = (posts: Post[]): Record<string, Post> => {
  return posts.reduce((acc, post) => {
    acc[post.id] = post;
    return acc;
  }, {} as Record<string, Post>);
};

const normalizeDiscussionTopics = (topics: DiscussionTopic[]): Record<string, DiscussionTopic> => {
  return topics.reduce((acc, topic) => {
    acc[topic.id] = topic;
    return acc;
  }, {} as Record<string, DiscussionTopic>);
};

const normalizeCommunities = (communities: Community[]): Record<string, Community> => {
  if (!communities || !Array.isArray(communities)) return {};
  return communities.reduce((acc, community) => {
    acc[community.id] = community;
    return acc;
  }, {} as Record<string, Community>);
};

const normalizeCommunityMemberships = (memberships: CommunityMembership[]): Record<string, CommunityMembership> => {
  if (!memberships || !Array.isArray(memberships)) return {};
  return memberships.reduce((acc, membership) => {
    const membershipId = `${membership.userId}-${membership.communityId}`;
    acc[membershipId] = membership;
    return acc;
  }, {} as Record<string, CommunityMembership>);
};

// Type pour le storeUpdater qui accepte une fonction ou un objet partiel
export type StoreUpdater = (newStoreData: Partial<SimpleEntityStore> | ((prevState: SimpleEntityStore) => Partial<SimpleEntityStore>)) => void;

// Provider component
interface SimpleEntityStoreProviderProps {
  children: ReactNode;
}

export function SimpleEntityStoreProvider({ children }: SimpleEntityStoreProviderProps) {
  const [store, setStore] = useState<SimpleEntityStore>(createInitialStore);

  // StoreUpdater qui peut accepter une fonction pour éviter les stale closures
  const storeUpdater: StoreUpdater = (newStoreData) => {
    setStore(prevStore => {
      const updates = typeof newStoreData === 'function' ? newStoreData(prevStore) : newStoreData;
      return { ...prevStore, ...updates };
    });
  };

  const actions: SimpleEntityActions = {
    // Users
    setUsers: (users) => setStore(prev => ({ ...prev, users })),
    addUser: (user) => setStore(prev => ({ 
      ...prev, 
      users: { ...prev.users, [user.id]: user }
    })),
    updateUser: (userId, updates) => setStore(prev => ({
      ...prev,
      users: {
        ...prev.users,
        [userId]: { ...prev.users[userId], ...updates }
      }
    })),
    removeUser: (userId) => setStore(prev => {
      const { [userId]: removed, ...remainingUsers } = prev.users;
      return {
        ...prev,
        users: remainingUsers
      };
    }),

    // Ideas
    setIdeas: (ideas) => setStore(prev => {
      // Extraire tous les utilisateurs de toutes les idées
      const allUsers = { ...prev.users };
      Object.values(ideas).forEach(idea => {
        const usersFromIdea = extractUsersFromIdea(idea);
        usersFromIdea.forEach(user => {
          if (!allUsers[user.id]) {
            allUsers[user.id] = user;
          }
        });
      });
      return { ...prev, users: allUsers, ideas };
    }),
    addIdea: (idea) => setStore(prev => {
      // Extraire et ajouter les utilisateurs de l'idée au store
      const usersFromIdea = extractUsersFromIdea(idea);
      const newUsers = { ...prev.users };
      usersFromIdea.forEach(user => {
        if (!newUsers[user.id]) {
          newUsers[user.id] = user;
        }
      });
      
      const existing = prev.ideas[idea.id];
      if (existing) {
        // Fusionner intelligemment : préserver les tableaux non-vides
        const merged: Idea = {
          ...existing,
          ...idea,
          // Préserver les relations si elles existent déjà ou les prendre de la nouvelle idée
          sourceIdeas: (idea.sourceIdeas && idea.sourceIdeas.length > 0) ? idea.sourceIdeas : existing.sourceIdeas || [],
          derivedIdeas: (idea.derivedIdeas && idea.derivedIdeas.length > 0) ? idea.derivedIdeas : existing.derivedIdeas || [],
          sourcePosts: (idea.sourcePosts && idea.sourcePosts.length > 0) ? idea.sourcePosts : existing.sourcePosts || [],
          // Préserver les tableaux d'utilisateurs si non vides
          supporters: (idea.supporters && idea.supporters.length > 0) ? idea.supporters : existing.supporters || [],
          ratings: (idea.ratings && idea.ratings.length > 0) ? idea.ratings : existing.ratings || [],
          discussionIds: (idea.discussionIds && idea.discussionIds.length > 0) ? idea.discussionIds : existing.discussionIds || [],
          // Préserver la description si elle est remplie
          description: idea.description || existing.description || ''
        };
        return { ...prev, users: newUsers, ideas: { ...prev.ideas, [idea.id]: merged } };
      }
      return { ...prev, users: newUsers, ideas: { ...prev.ideas, [idea.id]: idea } };
    }),
    updateIdea: (ideaId, updates) => {
      setStore(prev => {
        const updated = { ...prev.ideas[ideaId], ...updates };
        return {
          ...prev,
          ideas: {
            ...prev.ideas,
            [ideaId]: updated
          }
        };
      });
    },

    // Posts
    setPosts: (posts) => setStore(prev => {
      // Extraire tous les utilisateurs de tous les posts
      const allUsers = { ...prev.users };
      Object.values(posts).forEach(post => {
        const usersFromPost = extractUsersFromPost(post);
        usersFromPost.forEach(user => {
          if (!allUsers[user.id]) {
            allUsers[user.id] = user;
          }
        });
      });
      return { ...prev, users: allUsers, posts };
    }),
    addPost: (post) => setStore(prev => {
      // Extraire et ajouter les utilisateurs du post au store
      const usersFromPost = extractUsersFromPost(post);
      const newUsers = { ...prev.users };
      usersFromPost.forEach(user => {
        if (!newUsers[user.id]) {
          newUsers[user.id] = user;
        }
      });
      
      const existing = prev.posts[post.id];
      if (existing) {
        // Fusionner intelligemment : préserver les tableaux non-vides
        const merged: Post = {
          ...existing,
          ...post,
          // Préserver les relations si elles existent déjà ou les prendre du nouveau post
          derivedIdeas: (post.derivedIdeas && post.derivedIdeas.length > 0) ? post.derivedIdeas : existing.derivedIdeas || [],
          derivedPosts: (post.derivedPosts && post.derivedPosts.length > 0) ? post.derivedPosts : existing.derivedPosts || [],
          sourcePosts: (post.sourcePosts && post.sourcePosts.length > 0) ? post.sourcePosts : existing.sourcePosts || [],
          // Préserver les supporters/replies si non vides
          supporters: (post.supporters && post.supporters.length > 0) ? post.supporters : existing.supporters || [],
          replies: (post.replies && post.replies.length > 0) ? post.replies : existing.replies || []
        };
        return { ...prev, users: newUsers, posts: { ...prev.posts, [post.id]: merged } };
      }
      return { ...prev, users: newUsers, posts: { ...prev.posts, [post.id]: post } };
    }),
    updatePost: (postId, updates) => setStore(prev => ({
      ...prev,
      posts: {
        ...prev.posts,
        [postId]: { ...prev.posts[postId], ...updates }
      }
    })),

    // Discussion Topics
    setDiscussionTopics: (topics) => setStore(prev => {
      // Extraire tous les utilisateurs de tous les topics
      const allUsers = { ...prev.users };
      Object.values(topics).forEach(topic => {
        const usersFromTopic = extractUsersFromDiscussionTopic(topic);
        usersFromTopic.forEach(user => {
          if (!allUsers[user.id]) {
            allUsers[user.id] = user;
          }
        });
      });
      return { ...prev, users: allUsers, discussionTopics: topics };
    }),
    addDiscussionTopic: (topic) => {
      setStore(prev => {
        // Extraire et ajouter les utilisateurs du topic au store
        const usersFromTopic = extractUsersFromDiscussionTopic(topic);
        const newUsers = { ...prev.users };
        usersFromTopic.forEach(user => {
          if (!newUsers[user.id]) {
            newUsers[user.id] = user;
          }
        });
        
        return { 
          ...prev,
          users: newUsers,
          discussionTopics: { ...prev.discussionTopics, [topic.id]: topic }
        };
      });
    },
    updateDiscussionTopic: (topicId, updates) => setStore(prev => ({
      ...prev,
      discussionTopics: {
        ...prev.discussionTopics,
        [topicId]: { ...prev.discussionTopics[topicId], ...updates }
      }
    })),

    // Communities
    setCommunities: (communities) => setStore(prev => ({ ...prev, communities })),
    addCommunity: (community) => setStore(prev => ({ 
      ...prev, 
      communities: { ...prev.communities, [community.id]: community }
    })),
    updateCommunity: (communityId, updates) => setStore(prev => ({
      ...prev,
      communities: {
        ...prev.communities,
        [communityId]: { ...prev.communities[communityId], ...updates }
      }
    })),

    // Community Memberships
    setCommunityMemberships: (memberships) => setStore(prev => ({ ...prev, communityMemberships: memberships })),
    addCommunityMembership: (membership) => {
      const membershipId = `${membership.userId}-${membership.communityId}`;
      setStore(prev => ({ 
        ...prev, 
        communityMemberships: { ...prev.communityMemberships, [membershipId]: membership }
      }));
    },
    updateCommunityMembership: (membershipId, updates) => setStore(prev => ({
      ...prev,
      communityMemberships: {
        ...prev.communityMemberships,
        [membershipId]: { ...prev.communityMemberships[membershipId], ...updates }
      }
    })),

    // UI Actions
    setActiveTab: (tab) => setStore(prev => ({ ...prev, activeTab: tab })),
    setHasEnteredPlatform: (entered) => setStore(prev => ({ ...prev, hasEnteredPlatform: entered })),
    setShowOnboarding: (show) => setStore(prev => ({ ...prev, showOnboarding: show })),
    setSelectedIdeaId: (id) => setStore(prev => ({ ...prev, selectedIdeaId: id })),
    setSelectedPostId: (id) => setStore(prev => ({ ...prev, selectedPostId: id })),
    setSelectedUserId: (id) => setStore(prev => ({ ...prev, selectedUserId: id })),
    setSelectedCommunityId: (id) => setStore(prev => ({ ...prev, selectedCommunityId: id })),
    setCurrentUserId: (id) => setStore(prev => ({ ...prev, currentUserId: id })),

    // Temporary Actions
    setDiscussionPosts: (posts) => setStore(prev => ({ ...prev, discussionPosts: posts })),
    setPrefilledSourceIdea: (id) => setStore(prev => ({ ...prev, prefilledSourceIdea: id })),
    setPrefilledLinkedContent: (content) => setStore(prev => ({ ...prev, prefilledLinkedContent: content })),
    setPrefilledSelectedDiscussions: (discussions) => setStore(prev => ({ ...prev, prefilledSelectedDiscussions: discussions })),
    setPrefilledLocation: (location) => setStore(prev => ({ ...prev, prefilledLocation: location })),
    setPrefilledSourcePostId: (id) => setStore(prev => ({ ...prev, prefilledSourcePostId: id })),
    
    // Feed IDs Actions
    setFeedIdeaIds: (ids) => setStore(prev => ({ ...prev, feedIdeaIds: ids })),
    setFeedPostIds: (ids) => setStore(prev => ({ ...prev, feedPostIds: ids })),
    setPrefilledSignupData: (data) => setStore(prev => ({ ...prev, prefilledSignupData: data })),
    
    // Cache Actions
    setFeedLastFetched: (timestamp) => setStore(prev => ({ ...prev, feedLastFetched: timestamp })),
    setContributionsLastFetched: (timestamp) => setStore(prev => ({ ...prev, contributionsLastFetched: timestamp })),
    invalidateFeedCache: () => setStore(prev => ({ ...prev, feedLastFetched: null })),
    invalidateContributionsCache: () => setStore(prev => ({ ...prev, contributionsLastFetched: null })),

    // Initialize store
    initializeStore: (initialData) => {
      try {
        setStore(prev => ({
          ...prev,
          users: normalizeUsers(initialData.users || []),
          ideas: normalizeIdeas(initialData.ideas || []),
          posts: normalizePosts(initialData.posts || []),
          discussionTopics: normalizeDiscussionTopics(initialData.discussionTopics || []),
          communities: normalizeCommunities(initialData.communities || []),
          communityMemberships: normalizeCommunityMemberships(initialData.communityMemberships || []),
          currentUserId: initialData.currentUserId || ''
        }));
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du store:', error);
      }
    }
  };

  return (
    <SimpleEntityStoreContext.Provider value={{ store, actions, storeUpdater }}>
      {children}
    </SimpleEntityStoreContext.Provider>
  );
}

// Hook pour utiliser le store
export function useSimpleEntityStore() {
  const context = useContext(SimpleEntityStoreContext);
  if (!context) {
    throw new Error('useSimpleEntityStore must be used within a SimpleEntityStoreProvider');
  }
  return context;
}
