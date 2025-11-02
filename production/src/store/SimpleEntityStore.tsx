import React, { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { User, Idea, Post, DiscussionTopic, PrefilledContent, Group, GroupMembership, PendingGroupCreation, GroupLink } from '../types';
import { unknownUser } from '../data/users';

// Store simple avec les données principales
interface SimpleEntityStore {
  // Données principales (normalisées par ID)
  users: Record<string, User>;
  ideas: Record<string, Idea>;
  posts: Record<string, Post>;
  discussionTopics: Record<string, DiscussionTopic>;
  groups: Record<string, Group>;
  groupMemberships: Record<string, GroupMembership>;
  pendingGroupCreations: Record<string, PendingGroupCreation>;
  groupLinks: Record<string, GroupLink>;
  
  // États UI
  // NOTE MIGRATION REACT ROUTER (Phases 5 & 6) :
  // - activeTab, selectedIdeaId, selectedPostId, selectedUserId, selectedGroupId supprimés (maintenant dans l'URL)
  // - Seuls les états UI purs sont conservés
  hasEnteredPlatform: boolean;
  showOnboarding: boolean;
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
  
  setGroups: (groups: Record<string, Group>) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  
  setGroupMemberships: (memberships: Record<string, GroupMembership>) => void;
  addGroupMembership: (membership: GroupMembership) => void;
  updateGroupMembership: (userId: string, groupId: string, updates: Partial<GroupMembership>) => void;
  
  setPendingGroupCreations: (pendingGroups: Record<string, PendingGroupCreation>) => void;
  addPendingGroupCreation: (pendingGroup: PendingGroupCreation) => void;
  updatePendingGroupCreation: (pendingId: string, updates: Partial<PendingGroupCreation>) => void;
  removePendingGroupCreation: (pendingId: string) => void;
  
  setGroupLinks: (groupLinks: Record<string, GroupLink>) => void;
  addGroupLink: (groupLink: GroupLink) => void;
  updateGroupLink: (linkId: string, updates: Partial<GroupLink>) => void;
  removeGroupLink: (linkId: string) => void;
  
  // Actions UI
  // NOTE MIGRATION REACT ROUTER (Phases 5 & 6) :
  // Actions supprimées : setActiveTab, setSelectedIdeaId, setSelectedPostId, setSelectedUserId, setSelectedGroupId
  setHasEnteredPlatform: (entered: boolean) => void;
  setShowOnboarding: (show: boolean) => void;
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
    groups?: Group[];
    groupMemberships?: GroupMembership[];
    pendingGroups?: PendingGroupCreation[];
    currentUserId: string | null;
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
  groups: {},
  groupMemberships: {},
  pendingGroupCreations: {},
  groupLinks: {},
  hasEnteredPlatform: false,
  showOnboarding: false,
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
  // ✅ MIGRATION TERMINÉE: Plus besoin d'extraire les utilisateurs
  // - creatorIds est maintenant string[] (IDs)
  // - supporters est déjà string[] (IDs)
  // Les utilisateurs sont déjà dans le store
  return [];
};

const extractUsersFromPost = (post: Post): User[] => {
  // ✅ Cette fonction n'est plus nécessaire car :
  // - Post.authorId est maintenant un string (ID)
  // - Reply.authorId est maintenant un string (ID)
  // Les utilisateurs sont déjà dans le store via extractUsersFromData
  return [];
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

const normalizeGroups = (groups: Group[]): Record<string, Group> => {
  if (!groups || !Array.isArray(groups)) return {};
  return groups.reduce((acc, group) => {
    acc[group.id] = group;
    return acc;
  }, {} as Record<string, Group>);
};

const normalizeGroupMemberships = (memberships: GroupMembership[]): Record<string, GroupMembership> => {
  if (!memberships || !Array.isArray(memberships)) return {};
  return memberships.reduce((acc, membership) => {
    const membershipId = `${membership.userId}-${membership.groupId}`;
    acc[membershipId] = membership;
    return acc;
  }, {} as Record<string, GroupMembership>);
};

const normalizeGroupLinks = (links: GroupLink[]): Record<string, GroupLink> => {
  if (!links || !Array.isArray(links)) return {};
  return links.reduce((acc, link) => {
    acc[link.id] = link;
    return acc;
  }, {} as Record<string, GroupLink>);
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
  const storeUpdater: StoreUpdater = useMemo(() => (newStoreData) => {
    setStore(prevStore => {
      const updates = typeof newStoreData === 'function' ? newStoreData(prevStore) : newStoreData;
      return { ...prevStore, ...updates };
    });
  }, []);

  const actions: SimpleEntityActions = useMemo(() => ({
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
        // Fusionner intelligemment : préserver les données complètes déjà chargées
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
          // ✅ AMÉLIORATION : Préserver la description existante si elle est non vide ET que la nouvelle est vide/undefined
          // Cela évite qu'une FeedIdeaCard (sans description) écrase une Idea complète (avec description)
          description: (idea.description !== undefined && idea.description !== '') 
            ? idea.description 
            : (existing.description || '')
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
        // Fusionner intelligemment : préserver les données complètes déjà chargées
        const merged: Post = {
          ...existing,
          ...post,
          // Préserver les relations si elles existent déjà ou les prendre du nouveau post
          derivedIdeas: (post.derivedIdeas && post.derivedIdeas.length > 0) ? post.derivedIdeas : existing.derivedIdeas || [],
          derivedPosts: (post.derivedPosts && post.derivedPosts.length > 0) ? post.derivedPosts : existing.derivedPosts || [],
          sourcePosts: (post.sourcePosts && post.sourcePosts.length > 0) ? post.sourcePosts : existing.sourcePosts || [],
          // Préserver les supporters/replies si non vides
          supporters: (post.supporters && post.supporters.length > 0) ? post.supporters : existing.supporters || [],
          replies: (post.replies && post.replies.length > 0) ? post.replies : existing.replies || [],
          // ✅ AMÉLIORATION : Préserver le contenu existant si le nouveau est vide/undefined
          content: (post.content !== undefined && post.content !== '') 
            ? post.content 
            : (existing.content || '')
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
    setDiscussionTopics: (topics) => setStore(prev => ({
      ...prev,
      discussionTopics: topics
    })),
    addDiscussionTopic: (topic) => setStore(prev => ({
      ...prev,
      discussionTopics: { ...prev.discussionTopics, [topic.id]: topic }
    })),
    updateDiscussionTopic: (topicId, updates) => setStore(prev => ({
      ...prev,
      discussionTopics: {
        ...prev.discussionTopics,
        [topicId]: { ...prev.discussionTopics[topicId], ...updates }
      }
    })),

    // Groups
    setGroups: (groups) => setStore(prev => ({ ...prev, groups })),
    addGroup: (group) => setStore(prev => ({ 
      ...prev, 
      groups: { ...prev.groups, [group.id]: group }
    })),
    updateGroup: (groupId, updates) => setStore(prev => ({
      ...prev,
      groups: {
        ...prev.groups,
        [groupId]: { ...prev.groups[groupId], ...updates }
      }
    })),

    // Group Memberships (Phase 1)
    setGroupMemberships: (memberships) => setStore(prev => ({ ...prev, groupMemberships: memberships })),
    addGroupMembership: (membership) => {
      const membershipId = `${membership.userId}-${membership.groupId}`;
      setStore(prev => ({ 
        ...prev, 
        groupMemberships: { ...prev.groupMemberships, [membershipId]: membership }
      }));
    },
    updateGroupMembership: (userId, groupId, updates) => {
      const membershipId = `${userId}-${groupId}`;
      setStore(prev => ({
        ...prev,
        groupMemberships: {
          ...prev.groupMemberships,
          [membershipId]: { ...prev.groupMemberships[membershipId], ...updates }
        }
      }));
    },

    // Pending Group Creations (Phase 2)
    setPendingGroupCreations: (pendingGroups) => setStore(prev => ({ ...prev, pendingGroupCreations: pendingGroups })),
    addPendingGroupCreation: (pendingGroup) => {
      console.log(`🔧 [Store.addPendingGroupCreation] Ajout du groupe ${pendingGroup.id} au store`);
      setStore(prev => {
        const newStore = { 
          ...prev, 
          pendingGroupCreations: { ...prev.pendingGroupCreations, [pendingGroup.id]: pendingGroup }
        };
        console.log(`📊 [Store.addPendingGroupCreation] Store mis à jour, total pending groups:`, Object.keys(newStore.pendingGroupCreations).length);
        return newStore;
      });
    },
    updatePendingGroupCreation: (pendingId, updates) => setStore(prev => ({
      ...prev,
      pendingGroupCreations: {
        ...prev.pendingGroupCreations,
        [pendingId]: { ...prev.pendingGroupCreations[pendingId], ...updates }
      }
    })),
    removePendingGroupCreation: (pendingId) => setStore(prev => {
      const { [pendingId]: removed, ...remainingPending } = prev.pendingGroupCreations;
      return {
        ...prev,
        pendingGroupCreations: remainingPending
      };
    }),

    // Group Links (Phase 4)
    setGroupLinks: (groupLinks) => setStore(prev => ({ ...prev, groupLinks })),
    addGroupLink: (groupLink) => setStore(prev => ({
      ...prev,
      groupLinks: { ...prev.groupLinks, [groupLink.id]: groupLink }
    })),
    updateGroupLink: (linkId, updates) => setStore(prev => ({
      ...prev,
      groupLinks: {
        ...prev.groupLinks,
        [linkId]: { ...prev.groupLinks[linkId], ...updates }
      }
    })),
    removeGroupLink: (linkId) => setStore(prev => {
      const { [linkId]: removed, ...remainingLinks } = prev.groupLinks;
      return {
        ...prev,
        groupLinks: remainingLinks
      };
    }),

    // UI Actions
    // NOTE MIGRATION REACT ROUTER (Phase 5) : Actions obsolètes supprimées
    setHasEnteredPlatform: (entered) => setStore(prev => ({ ...prev, hasEnteredPlatform: entered })),
    setShowOnboarding: (show) => setStore(prev => ({ ...prev, showOnboarding: show })),
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
        setStore(prev => {
          const normalizedUsers = normalizeUsers(initialData.users || []);
          // ✅ S'assurer que unknownUser est toujours dans le store
          normalizedUsers[unknownUser.id] = unknownUser;
          
          console.log('✅ [Store] Utilisateur inconnu ajouté au store:', unknownUser.name);
          
          const normalizePendingGroups = (pending: PendingGroupCreation[]): Record<string, PendingGroupCreation> => {
            if (!pending || !Array.isArray(pending)) return {};
            return pending.reduce((acc, pg) => {
              acc[pg.id] = pg;
              return acc;
            }, {} as Record<string, PendingGroupCreation>);
          };

          return {
            ...prev,
            users: normalizedUsers,
            ideas: normalizeIdeas(initialData.ideas || []),
            posts: normalizePosts(initialData.posts || []),
            discussionTopics: normalizeDiscussionTopics(initialData.discussionTopics || []),
            groups: normalizeGroups(initialData.groups || []),
            groupMemberships: normalizeGroupMemberships(initialData.groupMemberships || []),
            pendingGroupCreations: normalizePendingGroups(initialData.pendingGroups || []),
            groupLinks: normalizeGroupLinks((initialData as any).groupLinks || []),
            currentUserId: initialData.currentUserId || null // ✅ null par défaut, pas de string vide
          };
        });
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation du store:', error);
      }
    }
  }), []);

  const contextValue = useMemo(() => ({ store, actions, storeUpdater }), [store, actions, storeUpdater]);

  return (
    <SimpleEntityStoreContext.Provider value={contextValue}>
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
