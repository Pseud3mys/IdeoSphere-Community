import { useSimpleEntityStore, SimpleEntityStore } from '../store/SimpleEntityStore';
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
 * Sélecteurs liés au store. Ils lisent getStore() AU MOMENT DE L'APPEL :
 * même appelés depuis une closure ancienne (code async, après une écriture),
 * ils renvoient l'état le plus récent.
 */
function createBoundSelectors(getStore: () => SimpleEntityStore) {
  return {
    // System selectors
    isStoreInitialized: () => selectors.isStoreInitialized(getStore()),
    getCurrentUser: () => selectors.getCurrentUser(getStore()),
    getUserById: (userId: string) => selectors.getUserById(getStore())(userId),
    userExists: (userId: string) => selectors.userExists(getStore())(userId),
    getAllUsers: () => selectors.getAllUsers(getStore()),
    getAllIdeas: () => selectors.getAllIdeas(getStore()),
    getIdeaById: (ideaId: string) => selectors.getIdeaById(getStore())(ideaId),
    getFeaturedIdeas: () => selectors.getFeaturedIdeas(getStore()),
    getPublishedIdeas: () => selectors.getPublishedIdeas(getStore()),
    getUserIdeas: (userId: string) => selectors.getUserIdeas(getStore())(userId),
    getDraftIdeas: () => selectors.getDraftIdeas(getStore()),
    getAllPosts: () => selectors.getAllPosts(getStore()),
    getPostById: (postId: string) => selectors.getPostById(getStore())(postId),
    getUserPosts: (userId: string) => selectors.getUserPosts(getStore())(userId),
    getPostsByIds: (postIds: string[]) => selectors.getPostsByIds(getStore())(postIds),
    getAllDiscussionTopics: () => selectors.getAllDiscussionTopics(getStore()),
    getDiscussionTopicById: (topicId: string) => selectors.getDiscussionTopicById(getStore())(topicId),
    getDiscussionTopicsByIds: (topicIds: string[]) => selectors.getDiscussionTopicsByIds(getStore())(topicIds),
    getFeedItems: () => selectors.getFeedItems(getStore()),
    getFeedItemsFlat: () => selectors.getFeedItemsFlat(getStore()),
    getHomePageData: () => selectors.getHomePageData(getStore()),
    searchIdeas: (query: string) => selectors.searchIdeas(getStore())(query),
    searchPosts: (query: string) => selectors.searchPosts(getStore())(query),
    getUserStats: (userId: string) => selectors.getUserStats(getStore())(userId),
    getAllGroups: () => selectors.getAllGroups(getStore()),
    getGroupById: (groupId: string) => selectors.getGroupById(getStore())(groupId),
    getActiveGroups: () => selectors.getActiveGroups(getStore()),
    getGroupsByType: (type: string) => selectors.getGroupsByType(getStore())(type as any),
    getUserGroups: (userId: string) => selectors.getUserGroups(getStore())(userId),
    getUserGroupsWithMemberships: (userId: string) => selectors.getUserGroupsWithMemberships(getStore())(userId),
    getGroupMembership: (userId: string, groupId: string) => selectors.getGroupMembership(getStore())(userId, groupId),
    isUserMemberOfGroup: (userId: string, groupId: string) => selectors.isUserMemberOfGroup(getStore())(userId, groupId),
    isUserAnimatorOfGroup: (userId: string, groupId: string) => selectors.isUserAnimatorOfGroup(getStore())(userId, groupId),
    getGroupMembers: (groupId: string) => selectors.getGroupMembers(getStore())(groupId),
    getGroupAnimators: (groupId: string) => selectors.getGroupAnimators(getStore())(groupId),
    searchGroups: (query: string) => selectors.searchGroups(getStore())(query),
    getGroupIdeas: (groupId: string) => selectors.getGroupIdeas(getStore())(groupId),
    getGroupPosts: (groupId: string) => selectors.getGroupPosts(getStore())(groupId),
    getGroupFeed: (groupId: string) => selectors.getGroupFeed(getStore())(groupId),
    getIdeasByGroup: (groupId: string) => selectors.getGroupIdeas(getStore())(groupId),
    getPostsByGroup: (groupId: string) => selectors.getGroupPosts(getStore())(groupId),
    getAllPendingGroupCreations: () => selectors.getAllPendingGroupCreations(getStore()),
    getPendingGroupCreationById: (pendingId: string) => selectors.getPendingGroupCreationById(getStore())(pendingId),
    getUserPendingGroupCreations: (userId: string) => selectors.getUserPendingGroupCreations(getStore())(userId),
    getPendingGroupStatus: (pendingId: string, userId: string) => selectors.getPendingGroupStatus(getStore())(pendingId, userId),
    getAllGroupLinks: () => selectors.getAllGroupLinks(getStore()),
    getGroupLinkById: (linkId: string) => selectors.getGroupLinkById(getStore())(linkId),
    getGroupLinks: (groupId: string) => selectors.getGroupLinks(getStore())(groupId),
    getGroupParents: (groupId: string) => selectors.getGroupParents(getStore())(groupId),
    getGroupChildren: (groupId: string) => selectors.getGroupChildren(getStore())(groupId),
    getGroupPartners: (groupId: string) => selectors.getGroupPartners(getStore())(groupId),
    hasGroupLink: (groupId1: string, groupId2: string) => selectors.hasGroupLink(getStore())(groupId1, groupId2),
    getMyContributions: () => {
      const currentUser = selectors.getCurrentUser(getStore());
      if (!currentUser) return null;
      const allIdeas = selectors.getAllIdeas(getStore());
      const allPosts = selectors.getAllPosts(getStore());
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
      const allDiscussions = selectors.getAllDiscussionTopics(getStore());
      const idea = selectors.getIdeaById(getStore())(ideaId);
      if (!idea) return [];
      return allDiscussions.filter(discussion => 
        idea.discussionIds?.includes(discussion.id)
      );
    }
  };
}


/**
 * Hook principal pour utiliser l'Entity Store simplifié
 * Combine le store, les actions et les selectors en une interface simple
 * Architecture: Composants -> useStore -> API Services -> Data
 */
export function useEntityStoreSimple() {
  const { store, actions, storeUpdater, getStore } = useSimpleEntityStore();
  const navigate = useNavigate();
  const initializationRef = useRef(false);
  // useMemo est déjà importé en haut du fichier

  // 1. Sélecteurs
  // - liveSelectors : identité stable, pour les modules d'actions (ne les recrée pas)
  // - boundSelectors : nouvelle identité à chaque changement du store, pour que les
  //   useMemo/useEffect des composants qui en dépendent se recalculent
  // Les deux lisent l'état le plus récent via getStore().
  const liveSelectors = useMemo(() => createBoundSelectors(getStore), [getStore]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const boundSelectors = useMemo(() => createBoundSelectors(getStore), [getStore, store]);

  // ⚠️ INITIALISATION UNIQUE DES DONNÉES
  // (L'utilisateur courant n'est pas géré ici : voir AuthSyncBridge et guestSession.)
  useEffect(() => {
    const isStoreEmpty = Object.keys(getStore().users).length === 0;
    if (isStoreEmpty && !storeInitialized && !initializationRef.current) {
      initializationRef.current = true;
      storeInitialized = true;
      console.log('🔄 [useEntityStoreSimple] Chargement des données initiales...');
      const apiActionsInit = createApiActions(getStore, actions, liveSelectors, storeUpdater);
      apiActionsInit.loadInitialData().then((success) => {
        if (success) {
          console.log('✅ [useEntityStoreSimple] Données initiales chargées avec succès');
        } else {
          console.error('❌ [useEntityStoreSimple] Échec du chargement des données initiales');
        }
      });
    }
  }, [getStore, actions, storeUpdater, liveSelectors]);

  // 2. Modules d'actions : stables (ne dépendent plus du contenu du store),
  // ils lisent l'état courant via getStore() et liveSelectors
  const navigationActions = useMemo(() => 
    createNavigationActions(getStore, actions, liveSelectors, storeUpdater), 
    [getStore, actions, liveSelectors, storeUpdater]
  );
  const contentActions = useMemo(() => 
    createContentActions(getStore, actions, liveSelectors, navigationActions, storeUpdater, navigate),
    [getStore, actions, liveSelectors, navigationActions, storeUpdater, navigate]
  );
  const userActions = useMemo(() => 
    createUserActions(getStore, actions, liveSelectors, navigationActions, storeUpdater),
    [getStore, actions, liveSelectors, navigationActions, storeUpdater]
  );
  const apiActions = useMemo(() => 
    createApiActions(getStore, actions, liveSelectors, storeUpdater),
    [getStore, actions, liveSelectors, storeUpdater]
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