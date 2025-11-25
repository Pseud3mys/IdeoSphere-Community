import { useSimpleEntityStore } from '../store/SimpleEntityStore';
import * as selectors from '../store/simpleSelectors';
import { User } from '../types';
import { useEffect, useRef } from 'react';
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

  // ⚠️ INITIALISATION UNIQUE DES DONNÉES
  // Charge TOUTES les données mockées UNE SEULE FOIS au démarrage
  useEffect(() => {
    const isStoreEmpty = Object.keys(store.users).length === 0;
    if (isStoreEmpty && !storeInitialized && !initializationRef.current) {
      initializationRef.current = true;
      storeInitialized = true;
      
      console.log('🔄 [useEntityStoreSimple] Chargement des données initiales...');
      
      // Créer les actions API pour accéder à loadInitialData
      const apiActions = createApiActions(store, actions, boundSelectors, storeUpdater);
      
      // Charger TOUTES les données mockées
      apiActions.loadInitialData().then(async (success) => {
        if (success) {
          console.log('✅ [useEntityStoreSimple] Données initiales chargées avec succès');
          
          // Si un currentUserId est restauré depuis localStorage, vérifier qu'il existe dans le store
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
  }, []); // Pas de dépendances pour éviter les boucles - ne s'exécute qu'une fois

  // Selectors bound to current store
  const boundSelectors = {
    // System selectors
    isStoreInitialized: () => selectors.isStoreInitialized(store),
    
    // User selectors
    getCurrentUser: () => selectors.getCurrentUser(store),
    getUserById: (userId: string) => selectors.getUserById(store)(userId),
    userExists: (userId: string) => selectors.userExists(store)(userId),
    getAllUsers: () => selectors.getAllUsers(store),
    
    // Idea selectors
    getAllIdeas: () => selectors.getAllIdeas(store),
    getIdeaById: (ideaId: string) => selectors.getIdeaById(store)(ideaId),
    // NOTE PHASE 5: getSelectedIdea supprimé - utilisez getIdeaById(ideaId) avec useParams()
    getFeaturedIdeas: () => selectors.getFeaturedIdeas(store),
    getPublishedIdeas: () => selectors.getPublishedIdeas(store),
    getUserIdeas: (userId: string) => selectors.getUserIdeas(store)(userId),
    getDraftIdeas: () => selectors.getDraftIdeas(store),
    
    // Post selectors
    getAllPosts: () => selectors.getAllPosts(store),
    getPostById: (postId: string) => selectors.getPostById(store)(postId),
    // NOTE PHASE 5: getSelectedPost supprimé - utilisez getPostById(postId) avec useParams()
    // NOTE PHASE 5: getSelectedUser supprimé - utilisez getUserById(userId) avec useParams()
    getUserPosts: (userId: string) => selectors.getUserPosts(store)(userId),
    getPostsByIds: (postIds: string[]) => selectors.getPostsByIds(store)(postIds),
    
    // Discussion selectors
    getAllDiscussionTopics: () => selectors.getAllDiscussionTopics(store),
    getDiscussionTopicById: (topicId: string) => selectors.getDiscussionTopicById(store)(topicId),
    getDiscussionTopicsByIds: (topicIds: string[]) => selectors.getDiscussionTopicsByIds(store)(topicIds),
    
    // Feed selectors
    getFeedItems: () => selectors.getFeedItems(store),
    getFeedItemsFlat: () => selectors.getFeedItemsFlat(store),
    
    // Home page selectors
    getHomePageData: () => selectors.getHomePageData(store),
    
    // Search selectors
    searchIdeas: (query: string) => selectors.searchIdeas(store)(query),
    searchPosts: (query: string) => selectors.searchPosts(store)(query),
    
    // Stats selectors
    getUserStats: (userId: string) => selectors.getUserStats(store)(userId),
    
    // Group selectors
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
    // Alias pour cohérence
    getIdeasByGroup: (groupId: string) => selectors.getGroupIdeas(store)(groupId),
    getPostsByGroup: (groupId: string) => selectors.getGroupPosts(store)(groupId),
    
    // Pending Group Creations selectors (Phase 2)
    getAllPendingGroupCreations: () => selectors.getAllPendingGroupCreations(store),
    getPendingGroupCreationById: (pendingId: string) => selectors.getPendingGroupCreationById(store)(pendingId),
    getUserPendingGroupCreations: (userId: string) => selectors.getUserPendingGroupCreations(store)(userId),
    getPendingGroupStatus: (pendingId: string, userId: string) => selectors.getPendingGroupStatus(store)(pendingId, userId),
    
    // Group Links selectors (Phase 4)
    getAllGroupLinks: () => selectors.getAllGroupLinks(store),
    getGroupLinkById: (linkId: string) => selectors.getGroupLinkById(store)(linkId),
    getGroupLinks: (groupId: string) => selectors.getGroupLinks(store)(groupId),
    getGroupParents: (groupId: string) => selectors.getGroupParents(store)(groupId),
    getGroupChildren: (groupId: string) => selectors.getGroupChildren(store)(groupId),
    getGroupPartners: (groupId: string) => selectors.getGroupPartners(store)(groupId),
    hasGroupLink: (groupId1: string, groupId2: string) => selectors.hasGroupLink(store)(groupId1, groupId2),
    
    // My contributions selector
    getMyContributions: () => {
      const currentUser = boundSelectors.getCurrentUser();
      if (!currentUser) return null;
      
      const allIdeas = boundSelectors.getAllIdeas();
      const allPosts = boundSelectors.getAllPosts();
      
      // Fonction utilitaire pour dédupliquer par ID
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
      
      // PARTICIPATIONS (créé ou commenté/noté)
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

      // SOUTIENS UNIQUEMENT (likes/soutiens sans participation active)
      const likedPosts = allPosts.filter(post => 
        post.supporters?.includes(currentUser.id) && 
        post.authorId !== currentUser.id &&
        !post.replies?.some(reply => reply.authorId === currentUser.id) // Pas commenté
      );
      const supportedIdeas = allIdeas.filter(idea => 
        idea.supporters?.includes(currentUser.id) &&
        !idea.creatorIds?.includes(currentUser.id) &&
        !idea.ratings?.some(rating => rating.userId === currentUser.id) // Pas noté
      );

      // Dédupliquer les arrays combinés
      const participationPosts = deduplicateById([...myPosts, ...commentedPosts]);
      const participationIdeas = deduplicateById([...myIdeas, ...ratedIdeas]);
      
      const supportPosts = deduplicateById(likedPosts);
      const supportIdeas = deduplicateById(supportedIdeas);

      return {
        // Structure attendue par MyIdeasPage.tsx
        participationPosts,
        participationIdeas,
        supportPosts,
        supportIdeas,
        
        // Données additionnelles pour les stats (legacy)
        myPosts,
        myIdeas,
        commentedPosts,
        ratedIdeas,
        likedPosts,
        supportedIdeas
      };
    },
    
    // Discussion selectors for specific ideas (current idea only)
    getDiscussionsForIdea: (ideaId: string) => {
      // Récupérer les discussions depuis le store uniquement
      const allDiscussions = boundSelectors.getAllDiscussionTopics();
      const idea = boundSelectors.getIdeaById(ideaId);
      
      if (!idea) return [];
      
      // Filtrer les discussions associées à cette idée
      return allDiscussions.filter(discussion => 
        idea.discussionIds?.includes(discussion.id)
      );
    }
  };

  // Créer les modules d'actions
  const navigationActions = createNavigationActions(store, actions, boundSelectors, storeUpdater);
  const contentActions = createContentActions(store, actions, boundSelectors, navigationActions, storeUpdater, navigate);
  const userActions = createUserActions(store, actions, boundSelectors, navigationActions, storeUpdater);
  const apiActions = createApiActions(store, actions, boundSelectors, storeUpdater);

  // Actions simplifiées combinées
  const simpleActions = {
    // Actions de base du store (pour manipulation directe)
    addPost: actions.addPost,
    setPosts: actions.setPosts,
    addIdea: actions.addIdea,
    setIdeas: actions.setIdeas,
    addUser: actions.addUser,
    updateIdea: actions.updateIdea,
    updatePost: actions.updatePost,
    updateUser: actions.updateUser,
    addDiscussionTopic: actions.addDiscussionTopic,
    
    // Actions d'authentification et utilisateur
    setCurrentUserId: actions.setCurrentUserId,
    
    // Actions UI/UX
    showOnboarding: () => actions.setShowOnboarding(true),
    hideOnboarding: () => actions.setShowOnboarding(false),
    
    // Actions Group (Phase 1)
    addGroup: actions.addGroup,
    updateGroup: actions.updateGroup,
    setGroups: actions.setGroups,
    addGroupMembership: actions.addGroupMembership,
    updateGroupMembership: actions.updateGroupMembership,
    setGroupMemberships: actions.setGroupMemberships,
    
    // Actions Pending Group Creations (Phase 2)
    addPendingGroupCreation: actions.addPendingGroupCreation,
    updatePendingGroupCreation: actions.updatePendingGroupCreation,
    removePendingGroupCreation: actions.removePendingGroupCreation,
    setPendingGroupCreations: actions.setPendingGroupCreations,
    
    // Actions Group Links (Phase 4)
    addGroupLink: actions.addGroupLink,
    updateGroupLink: actions.updateGroupLink,
    removeGroupLink: actions.removeGroupLink,
    setGroupLinks: actions.setGroupLinks,
    
    // Actions de navigation
    ...navigationActions,
    
    // Actions de contenu
    ...contentActions,
    
    // Actions utilisateur
    ...userActions,
    
    // Actions API
    ...apiActions,
    
    // Actions spéciales qui nécessitent une coordination entre modules
    
    /**
     * Navigation vers une idée - Charge uniquement l'idée de base
     * Les données des onglets sont chargées à la demande via loadIdeaTabData
     */
    goToIdea: async (ideaId: string, initialTab: 'description' | 'discussions' | 'evaluation' | 'versions' = 'description') => {
      console.log(`🔄 [goToIdea] Navigation vers idée ${ideaId}, onglet: ${initialTab}`);
      await navigationActions.goToIdea(ideaId, initialTab);
      console.log(`✅ [goToIdea] Idée ${ideaId} chargée`);
    },
    
    /**
     * Charge les données d'un onglet spécifique d'une idée
     * Délègue toute la logique à apiActions.loadIdeaTabData
     */
    loadIdeaTabData: async (ideaId: string, tab: 'description' | 'discussions' | 'evaluation' | 'versions') => {
      console.log(`🔄 [useEntityStoreSimple.loadIdeaTabData] Délégation vers apiActions pour onglet "${tab}"`);
      return await apiActions.loadIdeaTabData(ideaId, tab);
    },
    
    /**
     * Charge les données d'un onglet spécifique d'un post
     */
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
    
    // NOTE: viewVersion() supprimée - utiliser useNavigationActions().goToIdea() directement
    
    /**
     * Action pour entrer dans la plateforme
     */
    enterPlatform: () => {
      navigationActions.enterPlatform();
    },
    
    /**
     * Créer une idée avec hashtags extraits
     * Alias vers publishIdea qui contient maintenant toute la logique
     */
    createIdeaWithHashtags: apiActions.publishIdea,
    
    /**
     * Publier une idée (avec extraction automatique des hashtags)
     */
    publishIdea: apiActions.publishIdea,
    
    /**
     * Créer un post avec hashtags extraits
     * ✅ ALIAS vers publishPost qui intègre déjà l'extraction automatique
     */
    createPostWithHashtags: apiActions.publishPost,
    
    /**
     * Publier un post (avec extraction automatique des hashtags)
     */
    publishPost: apiActions.publishPost
  };

  // Computed values
  const currentUser = boundSelectors.getCurrentUser();

  return {
    // Store state
    store,
    
    // Current user
    currentUser,
    
    // Selectors
    ...boundSelectors,
    
    // Actions
    actions: simpleActions,
    
    // API Actions (exposé directement pour un accès plus clair)
    apiActions,
    
    // Raw actions (for advanced use)
    rawActions: actions,
    
    // Utility
    initializeStore: actions.initializeStore
  };
}