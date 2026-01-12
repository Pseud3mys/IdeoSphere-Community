import { useSimpleEntityStore } from '../store/SimpleEntityStore';
import * as selectors from '../store/simpleSelectors';
import { User } from '../types';
import { useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { extractHashtagsFromMultipleTexts } from '../utils/hashtagUtils';

// Imports des modules d'actions
import { createNavigationActions } from './navigationActions';
import { createContentActions } from './contentActions';
import { createUserActions } from './userActions';
import { createApiActions } from './apiActions';

// Flag global pour éviter les multiples initialisations
let storeInitialized = false;

/**
 * Hook principal pour utiliser l'Entity Store simplifié
 * Combine le store, les actions et les selectors en une interface simple
 * Architecture: Composants -> useStore -> API Services -> Data
 */
export function useEntityStoreSimple() {
  const { store, actions, storeUpdater } = useSimpleEntityStore();
  const navigate = useNavigate();
  const initializationRef = useRef(false);
  // useMemo est déjà importé en haut du fichier

  // 1. Stabiliser les sélecteurs
  const boundSelectors = useMemo(() => ({
    // System selectors
    isStoreInitialized: () => selectors.isStoreInitialized(store),
    getCurrentUser: () => selectors.getCurrentUser(store),
    getUserById: (userId: string) => selectors.getUserById(store)(userId),
    userExists: (userId: string) => selectors.userExists(store)(userId),
    getAllUsers: () => selectors.getAllUsers(store),
    getAllIdeas: () => selectors.getAllIdeas(store),
    getIdeaById: (ideaId: string) => selectors.getIdeaById(store)(ideaId),
    getFeaturedIdeas: () => selectors.getFeaturedIdeas(store),
    getPublishedIdeas: () => selectors.getPublishedIdeas(store),
    getUserIdeas: (userId: string) => selectors.getUserIdeas(store)(userId),
    getDraftIdeas: () => selectors.getDraftIdeas(store),
    getAllPosts: () => selectors.getAllPosts(store),
    getPostById: (postId: string) => selectors.getPostById(store)(postId),
    getUserPosts: (userId: string) => selectors.getUserPosts(store)(userId),
    getPostsByIds: (postIds: string[]) => selectors.getPostsByIds(store)(postIds),
    getAllDiscussionTopics: () => selectors.getAllDiscussionTopics(store),
    getDiscussionTopicById: (topicId: string) => selectors.getDiscussionTopicById(store)(topicId),
    getDiscussionTopicsByIds: (topicIds: string[]) => selectors.getDiscussionTopicsByIds(store)(topicIds),
    getFeedItems: () => selectors.getFeedItems(store),
    getFeedItemsFlat: () => selectors.getFeedItemsFlat(store),
    getHomePageData: () => selectors.getHomePageData(store),
    searchIdeas: (query: string) => selectors.searchIdeas(store)(query),
    searchPosts: (query: string) => selectors.searchPosts(store)(query),
    getUserStats: (userId: string) => selectors.getUserStats(store)(userId),
    getAllGroups: () => selectors.getAllGroups(store),
    getGroupById: (groupId: string) => selectors.getGroupById(store)(groupId),
    getActiveGroups: () => selectors.getActiveGroups(store),
    getGroupsByType: (type: string) => selectors.getGroupsByType(store)(type as any),
    getUserGroups: (userId: string) => selectors.getUserGroups(store)(userId),
    getUserGroupsWithMemberships: (userId: string) => selectors.getUserGroupsWithMemberships(store)(userId),
    getGroupMembership: (userId: string, groupId: string) => selectors.getGroupMembership(store)(userId, groupId),
    isUserMemberOfGroup: (userId: string, groupId: string) => selectors.isUserMemberOfGroup(store)(userId, groupId),
    isUserAnimatorOfGroup: (userId: string, groupId: string) => selectors.isUserAnimatorOfGroup(store)(userId, groupId),
    getGroupMembers: (groupId: string) => selectors.getGroupMembers(store)(groupId),
    getGroupAnimators: (groupId: string) => selectors.getGroupAnimators(store)(groupId),
    searchGroups: (query: string) => selectors.searchGroups(store)(query),
    getGroupIdeas: (groupId: string) => selectors.getGroupIdeas(store)(groupId),
    getGroupPosts: (groupId: string) => selectors.getGroupPosts(store)(groupId),
    getGroupFeed: (groupId: string) => selectors.getGroupFeed(store)(groupId),
    getIdeasByGroup: (groupId: string) => selectors.getGroupIdeas(store)(groupId),
    getPostsByGroup: (groupId: string) => selectors.getGroupPosts(store)(groupId),
    getAllPendingGroupCreations: () => selectors.getAllPendingGroupCreations(store),
    getPendingGroupCreationById: (pendingId: string) => selectors.getPendingGroupCreationById(store)(pendingId),
    getUserPendingGroupCreations: (userId: string) => selectors.getUserPendingGroupCreations(store)(userId),
    getPendingGroupStatus: (pendingId: string, userId: string) => selectors.getPendingGroupStatus(store)(pendingId, userId),
    getAllGroupLinks: () => selectors.getAllGroupLinks(store),
    getGroupLinkById: (linkId: string) => selectors.getGroupLinkById(store)(linkId),
    getGroupLinks: (groupId: string) => selectors.getGroupLinks(store)(groupId),
    getGroupParents: (groupId: string) => selectors.getGroupParents(store)(groupId),
    getGroupChildren: (groupId: string) => selectors.getGroupChildren(store)(groupId),
    getGroupPartners: (groupId: string) => selectors.getGroupPartners(store)(groupId),
    hasGroupLink: (groupId1: string, groupId2: string) => selectors.hasGroupLink(store)(groupId1, groupId2),
    getMyContributions: () => {
      const currentUser = selectors.getCurrentUser(store);
      if (!currentUser) return null;
      const allIdeas = selectors.getAllIdeas(store);
      const allPosts = selectors.getAllPosts(store);
      function deduplicateById<T extends { id: string }>(items: T[]): T[] {
        const seen = new Set<string>();
        return items.filter(item => {
          if (seen.has(item.id)) {
            return false;
          }
          seen.add(item.id);
          return true;
        });
      }
      const myPosts = allPosts.filter(post => post.authorId === currentUser.id);
      const myIdeas = allIdeas.filter(idea => idea.creatorIds?.includes(currentUser.id));
      const commentedPosts = allPosts.filter(post => 
        post.authorId !== currentUser.id &&
        post.replies?.some(reply => reply.authorId === currentUser.id)
      );
      const ratedIdeas = allIdeas.filter(idea => 
        !idea.creatorIds?.includes(currentUser.id) && 
        idea.ratings?.some(rating => rating.userId === currentUser.id)
      );
      const likedPosts = allPosts.filter(post => 
        post.supporters?.includes(currentUser.id) && 
        post.authorId !== currentUser.id &&
        !post.replies?.some(reply => reply.authorId === currentUser.id)
      );
      const supportedIdeas = allIdeas.filter(idea => 
        idea.supporters?.includes(currentUser.id) &&
        !idea.creatorIds?.includes(currentUser.id) &&
        !idea.ratings?.some(rating => rating.userId === currentUser.id)
      );
      const participationPosts = deduplicateById([...myPosts, ...commentedPosts]);
      const participationIdeas = deduplicateById([...myIdeas, ...ratedIdeas]);
      const supportPosts = deduplicateById(likedPosts);
      const supportIdeas = deduplicateById(supportedIdeas);
      return {
        participationPosts,
        participationIdeas,
        supportPosts,
        supportIdeas,
        myPosts,
        myIdeas,
        commentedPosts,
        ratedIdeas,
        likedPosts,
        supportedIdeas
      };
    },
    getDiscussionsForIdea: (ideaId: string) => {
      const allDiscussions = selectors.getAllDiscussionTopics(store);
      const idea = selectors.getIdeaById(store)(ideaId);
      if (!idea) return [];
      return allDiscussions.filter(discussion => 
        idea.discussionIds?.includes(discussion.id)
      );
    }
  }), [store]);

  // ⚠️ INITIALISATION UNIQUE DES DONNÉES
  useEffect(() => {
    const isStoreEmpty = Object.keys(store.users).length === 0;
    if (isStoreEmpty && !storeInitialized && !initializationRef.current) {
      initializationRef.current = true;
      storeInitialized = true;
      console.log('🔄 [useEntityStoreSimple] Chargement des données initiales...');
      const apiActionsInit = createApiActions(store, actions, boundSelectors, storeUpdater);
      apiActionsInit.loadInitialData().then(async (success) => {
        if (success) {
          console.log('✅ [useEntityStoreSimple] Données initiales chargées avec succès');
          if (store.currentUserId && store.currentUserId !== 'unknown-user') {
            const userInStore = selectors.getUserById(store)(store.currentUserId);
            if (!userInStore) {
              console.warn(`⚠️ [useEntityStoreSimple] Utilisateur restauré ${store.currentUserId} non trouvé dans le store. Retour à unknownUser.`);
              actions.setCurrentUserId(null);
            } else {
              console.log(`✅ [useEntityStoreSimple] Utilisateur ${userInStore.name} restauré depuis localStorage`);
            }
          }
        } else {
          console.error('❌ [useEntityStoreSimple] Échec du chargement des données initiales');
        }
      });
    }
  }, [store, actions, storeUpdater, boundSelectors]);

  // 2. Stabiliser les modules d'actions
  const navigationActions = useMemo(() => 
    createNavigationActions(store, actions, boundSelectors, storeUpdater), 
    [store, actions, boundSelectors, storeUpdater]
  );
  const contentActions = useMemo(() => 
    createContentActions(store, actions, boundSelectors, navigationActions, storeUpdater, navigate),
    [store, actions, boundSelectors, navigationActions, storeUpdater, navigate]
  );
  const userActions = useMemo(() => 
    createUserActions(store, actions, boundSelectors, navigationActions, storeUpdater),
    [store, actions, boundSelectors, navigationActions, storeUpdater]
  );
  const apiActions = useMemo(() => 
    createApiActions(store, actions, boundSelectors, storeUpdater),
    [store, actions, boundSelectors, storeUpdater]
  );

  // 3. Stabiliser l'objet final
  const simpleActions = useMemo(() => ({
    addPost: actions.addPost,
    setPosts: actions.setPosts,
    addIdea: actions.addIdea,
    setIdeas: actions.setIdeas,
    addUser: actions.addUser,
    updateIdea: actions.updateIdea,
    updatePost: actions.updatePost,
    updateUser: actions.updateUser,
    addDiscussionTopic: actions.addDiscussionTopic,
    setCurrentUserId: actions.setCurrentUserId,
    invalidateFeedCache: actions.invalidateFeedCache,
    invalidateContributionsCache: actions.invalidateContributionsCache,
    addGroup: actions.addGroup,
    updateGroup: actions.updateGroup,
    setGroups: actions.setGroups,
    addGroupMembership: actions.addGroupMembership,
    updateGroupMembership: actions.updateGroupMembership,
    setGroupMemberships: actions.setGroupMemberships,
    addPendingGroupCreation: actions.addPendingGroupCreation,
    updatePendingGroupCreation: actions.updatePendingGroupCreation,
    removePendingGroupCreation: actions.removePendingGroupCreation,
    setPendingGroupCreations: actions.setPendingGroupCreations,
    addGroupLink: actions.addGroupLink,
    updateGroupLink: actions.updateGroupLink,
    removeGroupLink: actions.removeGroupLink,
    setGroupLinks: actions.setGroupLinks,
    ...navigationActions,
    ...contentActions,
    ...userActions,
    ...apiActions,
    loadIdeaTabData: async (ideaId: string, tab: 'description' | 'discussions' | 'evaluation' | 'versions') => {
      console.log(`🔄 [useEntityStoreSimple.loadIdeaTabData] Délégation vers apiActions pour onglet "${tab}"`);
      return await apiActions.loadIdeaTabData(ideaId, tab);
    },
    loadPostTabData: async (postId: string, tab: 'content' | 'discussions') => {
      console.log(`🔄 [loadPostTabData] Chargement onglet "${tab}" pour post ${postId}`);
      try {
        switch (tab) {
          case 'discussions':
            return await apiActions.loadDiscussions(postId, 'post');
          default:
            return null;
        }
      } catch (error) {
        console.error(`❌ [loadPostTabData] Erreur:`, error);
        return null;
      }
    },
    enterPlatform: () => {
      navigationActions.enterPlatform();
    },
    createIdeaWithHashtags: apiActions.publishIdea,
    publishIdea: apiActions.publishIdea,
    createPostWithHashtags: apiActions.publishPost,
    publishPost: apiActions.publishPost
  }), [actions, navigationActions, contentActions, userActions, apiActions]);

  return {
    store,
    currentUser: boundSelectors.getCurrentUser(),
    ...boundSelectors,
    actions: simpleActions,
    apiActions,
    rawActions: actions
  };
}