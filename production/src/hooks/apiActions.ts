import { SimpleEntityStore, StoreUpdater } from '../store/SimpleEntityStore';
import { User, Idea, Post, DiscussionTopic, Location } from '../types';
import { toast } from 'sonner@2.0.3';

/**
 * Actions API pour l'Entity Store
 * Gère le chargement des données depuis les services API
 */
export function createApiActions(
  store: SimpleEntityStore,
  actions: any,
  boundSelectors: any,
  storeUpdater: StoreUpdater
) {
  return {
    /**
     * ⚠️ FONCTION UNIQUE DE CHARGEMENT INITIAL
     * Charge TOUTES les données mockées UNE SEULE FOIS au démarrage
     * C'est le SEUL endroit où on accède à dataService !
     */
    loadInitialData: async () => {
      try {
        console.log('🔄 [apiActions] Chargement des données initiales...');
        
        const { loadMockDataSet } = await import('../api/dataService');
        const mockData = await loadMockDataSet();
        
        console.log('✅ [apiActions] Données mockées chargées:', {
          users: mockData.users.length + 2, // +2 pour currentUser et guestUser
          ideas: mockData.ideas.length,
          posts: mockData.posts.length,
          discussions: mockData.discussions.length,
          groups: mockData.groups?.length || 0,
          groupMemberships: mockData.groupMemberships?.length || 0,
          pendingGroups: mockData.pendingGroups?.length || 0
        });
        
        // Créer un utilisateur anonyme temporaire pour la navigation
        const anonymousUser = {
          id: 'anonymous',
          name: 'Visiteur',
          email: '',
          avatar: '',
          bio: '',
          createdAt: new Date(),
          isRegistered: false
        };
        
        // Initialiser le store avec toutes les données avec utilisateur anonyme
        // Les boutons de connexion changeront le currentUserId
        actions.initializeStore({
          users: [anonymousUser, mockData.currentUser, mockData.guestUser, ...mockData.users],
          ideas: mockData.ideas,
          posts: mockData.posts,
          discussionTopics: mockData.discussions,
          // ⚠️ Les groupes seront chargés via l'API après l'authentification
          groups: [],
          groupMemberships: [],
          pendingGroups: [],
          currentUserId: 'anonymous' // ✅ Utilisateur anonyme par défaut pour la navigation
        });
        
        console.log('✅ [apiActions] Store initialisé avec toutes les données (currentUserId: anonymous)');
        
        return true;
      } catch (error) {
        console.error('❌ [apiActions] Erreur chargement initial:', error);
        return false;
      }
    },
    
    /**
     * Charge les statistiques de la page d'accueil et initialise un utilisateur visiteur
     */
    fetchHomePageStats: async () => {
      try {
        const { fetchHomePageStats } = await import('../api/feedService');
        const homePageData = await fetchHomePageStats();
        
        if (homePageData) {
          // Vérifier si on a déjà un utilisateur réel connecté
          const currentUser = boundSelectors.getCurrentUser();
          if (!currentUser || currentUser.id === 'not-connected') {
            // Créer automatiquement un visiteur
            const visitorId = `visitor-${Date.now()}`;
            const { createVisitorUser } = await import('../api/transformService');
            const visitorUser = createVisitorUser(visitorId);
            
            actions.addUser(visitorUser);
            actions.setCurrentUserId(visitorId);
          }
          
          return homePageData;
        }
      } catch (error) {
        console.error('❌ [hook/apiActions] fetchHomePageStats:', error);
        return null;
      }
    },
    
    /**
     * Charge le feed de découverte avec système de cache
     */
    fetchFeed: async (forceRefresh: boolean = false) => {
      try {
        // Récupérer l'utilisateur actuel pour personnaliser le feed
        const currentUser = boundSelectors.getCurrentUser();
        const userId = currentUser?.id;
        
        // Vérifier si on a déjà les données en cache (valide pendant 5 minutes)
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();
        const lastFetched = store.feedLastFetched;
        const isCacheValid = lastFetched && (now - lastFetched) < CACHE_DURATION;
        
        if (!forceRefresh && isCacheValid && store.feedIdeaIds.length > 0) {
          console.log(`♻️ [apiActions] fetchFeed - Utilisation du cache (${store.feedIdeaIds.length} idées, ${store.feedPostIds.length} posts)`);
          
          // Récupérer directement depuis le store
          const ideasFromStore = store.feedIdeaIds.map(id => boundSelectors.getIdeaById(id)).filter(Boolean);
          const postsFromStore = store.feedPostIds.map(id => boundSelectors.getPostById(id)).filter(Boolean);
          
          return {
            posts: postsFromStore,
            ideas: ideasFromStore,
            totalPosts: postsFromStore.length,
            totalIdeas: ideasFromStore.length,
            totalItems: postsFromStore.length + ideasFromStore.length
          };
        }
        
        console.log(`🔄 [apiActions] fetchFeed - Chargement depuis l'API (User: ${userId || 'anonymous'})`);
        
        const { fetchFeed } = await import('../api/feedService');
        const feedData = await fetchFeed(userId);
        
        // Ajouter les éléments du feed au store avec transformation API
        const { transformIdeaCardToIdea, transformPostCardToPost } = await import('../api/transformService');
        
        const feedIdeaIds: string[] = [];
        const feedPostIds: string[] = [];
        
        feedData.ideas.forEach((ideaCard: any) => {
          const minimalIdea = transformIdeaCardToIdea(ideaCard);
          actions.addIdea(minimalIdea);
          feedIdeaIds.push(minimalIdea.id);
        });
        
        feedData.posts.forEach((postCard: any) => {
          const minimalPost = transformPostCardToPost(postCard);
          actions.addPost(minimalPost);
          feedPostIds.push(minimalPost.id);
        });
        
        // Ajouter les utilisateurs au store
        if (feedData.users && feedData.users.length > 0) {
          feedData.users.forEach((user: any) => {
            actions.addUser(user);
          });
          console.log(`✅ [apiActions] fetchFeed: Ajouté ${feedData.users.length} utilisateurs au store`);
        }
        
        // Stocker les IDs des items du feed et mettre à jour le timestamp du cache
        actions.setFeedIdeaIds(feedIdeaIds);
        actions.setFeedPostIds(feedPostIds);
        actions.setFeedLastFetched(now);
        
        // 3. LIRE DEPUIS LE STORE (trouve mockées + dynamiques)
        const ideasFromStore = feedIdeaIds.map(id => boundSelectors.getIdeaById(id)).filter(Boolean);
        const postsFromStore = feedPostIds.map(id => boundSelectors.getPostById(id)).filter(Boolean);
        
        console.log(`✅ [apiActions] fetchFeed: Chargé ${ideasFromStore.length} idées et ${postsFromStore.length} posts depuis l'API`);
        
        return {
          posts: postsFromStore,
          ideas: ideasFromStore,
          totalPosts: postsFromStore.length,
          totalIdeas: ideasFromStore.length,
          totalItems: postsFromStore.length + ideasFromStore.length
        };
        
      } catch (error) {
        console.error('[apiActions] fetchFeed Error:', error);
        
        // Fallback vers le comportement actuel en cas d'erreur
        const allIdeas = boundSelectors.getPublishedIdeas();
        const allPosts = boundSelectors.getAllPosts();
        const limitedPosts = allPosts.slice(0, 5);
        
        return {
          posts: limitedPosts,
          ideas: allIdeas,
          totalPosts: limitedPosts.length,
          totalIdeas: allIdeas.length,
          totalItems: limitedPosts.length + allIdeas.length
        };
      }
    },
    
    /**
     * Charge les contributions de l'utilisateur actuel avec système de cache
     */
    fetchMyContributions: async (forceRefresh: boolean = false) => {
      const currentUser = boundSelectors.getCurrentUser();
      if (!currentUser) {
        console.error('❌ [apiActions] fetchMyContributions: Aucun utilisateur connecté');
        return null;
      }
      
      try {
        // Vérifier si on a déjà les données en cache (valide pendant 5 minutes)
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        const now = Date.now();
        const lastFetched = store.contributionsLastFetched;
        const isCacheValid = lastFetched && (now - lastFetched) < CACHE_DURATION;
        
        // Si le cache est valide et on a déjà des données, on les utilise
        if (!forceRefresh && isCacheValid) {
          console.log(`♻️ [apiActions] fetchMyContributions - Utilisation du cache`);
          
          // Récupérer les contributions depuis le store via le selector
          const contributions = boundSelectors.getMyContributions();
          
          if (contributions) {
            return {
              participationIdeas: contributions.participationIdeas,
              supportIdeas: contributions.supportIdeas,
              participationPosts: contributions.participationPosts,
              supportPosts: contributions.supportPosts
            };
          }
        }
        
        console.log(`🔄 [apiActions] fetchMyContributions - Chargement depuis l'API (User: ${currentUser.id})`);
        
        // 1. APPELER L'API pour obtenir les contributions
        const { fetchUserContributionsFromApi } = await import('../api/feedService');
        const apiContributionsData = await fetchUserContributionsFromApi(currentUser.id);
        
        if (!apiContributionsData) {
          console.error('❌ [apiActions] fetchMyContributions: Pas de données de contributions');
          return null;
        }
        
        // 2. AJOUTER AU STORE
        const allIdeaIds: string[] = [];
        const allPostIds: string[] = [];
        
        [...apiContributionsData.participationIdeas, ...apiContributionsData.supportIdeas].forEach((idea: any) => {
          actions.addIdea(idea);
          allIdeaIds.push(idea.id);
        });
        
        [...apiContributionsData.participationPosts, ...apiContributionsData.supportPosts].forEach((post: any) => {
          actions.addPost(post);
          allPostIds.push(post.id);
        });
        
        // Mettre à jour le timestamp du cache
        actions.setContributionsLastFetched(now);
        
        // 3. LIRE DEPUIS LE STORE (trouve mockées + dynamiques)
        const participationIdeas = allIdeaIds
          .map(id => boundSelectors.getIdeaById(id))
          .filter(Boolean)
          .filter(idea => idea.creatorIds?.includes(currentUser.id));
          
        const supportIdeas = allIdeaIds
          .map(id => boundSelectors.getIdeaById(id))
          .filter(Boolean)
          .filter(idea => 
            idea.supporters?.includes(currentUser.id) &&
            !idea.creatorIds?.includes(currentUser.id)
          );
          
        const participationPosts = allPostIds
          .map(id => boundSelectors.getPostById(id))
          .filter(Boolean)
          .filter(post => post.author?.id === currentUser.id);
          
        const supportPosts = allPostIds
          .map(id => boundSelectors.getPostById(id))
          .filter(Boolean)
          .filter(post => 
            post.supporters?.includes(currentUser.id) &&
            post.author?.id !== currentUser.id
          );
        
        const contributionsFromStore = {
          participationIdeas,
          supportIdeas,
          participationPosts,
          supportPosts
        };
        
        console.log(`✅ [apiActions] fetchMyContributions: Chargé ${participationIdeas.length} idées participation et ${supportIdeas.length} idées soutien depuis l'API`);
        
        return contributionsFromStore;
        
      } catch (error) {
        console.error('❌ [hook/apiActions] fetchMyContributions:', error);
        return null;
      }
    },
    
    /**
     * Charge le profil de l'utilisateur actuel
     */
    fetchMyProfile: async () => {
      const currentUser = boundSelectors.getCurrentUser();
      if (!currentUser) {
        console.error('❌ [apiActions] fetchMyProfile: Aucun utilisateur connecté');
        return null;
      }
      
      try {
        // 1. APPELER L'API si l'utilisateur est enregistré
        if (currentUser.isRegistered) {
          const { fetchUserProfileFromApi } = await import('../api/contentService');
          const apiFullProfile = await fetchUserProfileFromApi(currentUser.id);
          
          // 2. AJOUTER/METTRE À JOUR dans le store
          if (apiFullProfile) {
            actions.updateUser(currentUser.id, apiFullProfile);
          }
        }
        
        // 3. LIRE DEPUIS LE STORE (trouve mockées + dynamiques)
        const userFromStore = boundSelectors.getUserById(currentUser.id);
        
        if (!userFromStore) {
          console.error('❌ [apiActions] fetchMyProfile: Utilisateur non trouvé dans le store après mise à jour');
          return null;
        }
        
        console.log(`✅ [apiActions] fetchMyProfile: Chargé profil de ${userFromStore.name} depuis le store`);
        
        return userFromStore;
        
      } catch (error) {
        console.error('❌ [apiActions] fetchMyProfile:', error);
        
        // Retourner l'utilisateur depuis le store
        return boundSelectors.getUserById(currentUser.id) || currentUser;
      }
    },
    
    /**
     * Charge le lineage (parents/enfants) d'un contenu
     * ✅ Nouvelle version qui gère les objets complets (Idea | Post | DiscussionTopic)
     */
    loadLineage: async (itemId: string, itemType: 'idea' | 'post') => {
      try {
        const { fetchLineage } = await import('../api/lineageService');
        const result = await fetchLineage(itemId, itemType);
        
        if (result && result.lineage) {
          const { lineage: lineageResult, users = [] } = result;
          
          // Vérifier que lineageResult a les propriétés attendues
          if (!lineageResult.parents || !lineageResult.children) {
            console.error(`❌ [apiActions] loadLineage: Structure de lineage invalide`, lineageResult);
            return;
          }
          
          // ✅ ÉTAPE 1: Ajouter TOUS les utilisateurs au store EN PREMIER
          users.forEach((user: User) => {
            actions.addUser(user);
          });
          
          console.log(`✅ [apiActions] loadLineage - ${users.length} utilisateurs ajoutés au store`);
          
          // ✅ ÉTAPE 2: Ventiler les entités dans leurs tranches respectives
          const parentIdeaIds: string[] = [];
          const parentPostIds: string[] = [];
          const parentDiscussionIds: string[] = [];
          const childIdeaIds: string[] = [];
          const childPostIds: string[] = [];
          
          // Ajouter les parents au store
          lineageResult.parents.forEach((parent: Idea | Post | DiscussionTopic) => {
            // ✅ Détecter le type d'entité de manière robuste
            if ('summary' in parent && 'creatorIds' in parent) {
              // C'est une Idea (a summary ET creatorIds)
              actions.addIdea(parent as Idea);
              parentIdeaIds.push(parent.id);
            } else if ('content' in parent && 'authorId' in parent && 'supporters' in parent) {
              // C'est un Post (a content, authorId ET supporters)
              actions.addPost(parent as Post);
              parentPostIds.push(parent.id);
            } else if ('content' in parent && 'type' in parent) {
              // C'est une DiscussionTopic (a content ET type)
              actions.addDiscussionTopic(parent as DiscussionTopic);
              parentDiscussionIds.push(parent.id);
            }
          });
          
          // Ajouter les enfants au store
          lineageResult.children.forEach((child: Idea | Post | DiscussionTopic) => {
            // ✅ Détecter le type d'entité de manière robuste
            if ('summary' in child && 'creatorIds' in child) {
              // C'est une Idea (a summary ET creatorIds)
              actions.addIdea(child as Idea);
              childIdeaIds.push(child.id);
            } else if ('content' in child && 'authorId' in child && 'supporters' in child) {
              // C'est un Post (a content, authorId ET supporters)
              const childPost = child as Post;
              console.log(`✅ [apiActions] Ajout d'un post dérivé ${childPost.id} avec ${childPost.replies?.length || 0} replies`);
              actions.addPost(childPost);
              childPostIds.push(child.id);
            } else if ('content' in child && 'type' in child) {
              // C'est une DiscussionTopic (a content ET type)
              actions.addDiscussionTopic(child as DiscussionTopic);
            }
          });
          
          // ✅ ÉTAPE 3: Mettre à jour l'élément actuel avec les IDs des parents et enfants
          if (itemType === 'idea') {
            actions.updateIdea(itemId, {
              sourceIdeas: parentIdeaIds,
              sourcePosts: parentPostIds,
              sourceDiscussions: parentDiscussionIds, // ✅ Nouveau champ
              derivedIdeas: childIdeaIds
            });
            
            console.log(`✅ [apiActions] loadLineage - Idée ${itemId} mise à jour:`, {
              sourceIdeas: parentIdeaIds.length,
              sourcePosts: parentPostIds.length,
              sourceDiscussions: parentDiscussionIds.length,
              derivedIdeas: childIdeaIds.length
            });
          } else {
            // Pour un post
            actions.updatePost(itemId, {
              sourcePosts: parentPostIds,
              derivedIdeas: childIdeaIds,
              derivedPosts: childPostIds
            });
            
            console.log(`✅ [apiActions] loadLineage - Post ${itemId} mis à jour:`, {
              sourcePosts: parentPostIds.length,
              derivedIdeas: childIdeaIds.length,
              derivedPosts: childPostIds.length
            });
          }
          
          return lineageResult;
        }
      } catch (error) {
        console.error(`❌ [hook/apiActions] loadLineage ${itemType}:`, error);
      }
      
      return null;
    },
    
    /**
     * Charge les discussions d'une idée ou d'un post
     */
    loadDiscussions: async (itemId: string, itemType: 'idea' | 'post') => {
      try {
        const { fetchDiscussions } = await import('../api/detailsService');
        const { discussions, users } = await fetchDiscussions(itemId, itemType);
        
        // ✅ Ajouter les utilisateurs au store
        users.forEach((user: User) => {
          actions.addUser(user);
        });
        
        // Ajouter les discussions au store
        discussions.forEach((discussion: DiscussionTopic) => {
          actions.addDiscussionTopic(discussion);
        });
        
        // Lier les discussions à l'idée/post
        if (itemType === 'idea' && discussions.length > 0) {
          const currentIdea = boundSelectors.getIdeaById(itemId);
          if (currentIdea) {
            const discussionIds = discussions.map(d => d.id);
            const newDiscussionIds = [...(currentIdea.discussionIds || []), ...discussionIds.filter(id => !currentIdea.discussionIds?.includes(id))];
            actions.updateIdea(itemId, {
              discussionIds: newDiscussionIds
            });
          }
        }
        
        return discussions;
        
      } catch (error) {
        console.error(`❌ [hook/apiActions] loadDiscussions ${itemType}:`, error);
        return [];
      }
    },

    /**
     * Charge les évaluations/ratings d'une idée
     */
    loadIdeaRatings: async (ideaId: string) => {
      try {
        const { fetchIdeaRatings } = await import('../api/detailsService');
        const ratings = await fetchIdeaRatings(ideaId);
        
        // ✅ Récupérer l'idée actuelle et l'enrichir avec les ratings (même si tableau vide)
        const currentIdea = boundSelectors.getIdeaById(ideaId);
        if (currentIdea) {
          actions.updateIdea(ideaId, {
            ratings: ratings // ✅ Mettre à jour 'ratings' au lieu de 'ratingDetails'
          });
          console.log(`✅ [hook/apiActions] loadIdeaRatings - Idée ${ideaId} mise à jour avec ${ratings.length} évaluations`);
        }
        
        return ratings;
        
      } catch (error) {
        console.error(`❌ [hook/apiActions] loadIdeaRatings:`, error);
        return [];
      }
    },

    /**
     * Charge les données d'un onglet spécifique d'une idée
     */
    loadIdeaTabData: async (ideaId: string, tabType: 'description' | 'discussions' | 'evaluation' | 'versions' | 'lineage' | 'related') => {
      try {
        if (tabType === 'versions') {
          // 1. APPELER L'API pour obtenir les données de lineage (depuis données mockées)
          const { fetchLineage } = await import('../api/lineageService');
          const result = await fetchLineage(ideaId, 'idea');
          
          if (!result || !result.lineage) {
            console.error(`❌ [apiActions] loadIdeaTabData versions: Échec du chargement du lineage pour ${ideaId}`);
            return null;
          }
          
          const { lineage: lineageData, users = [] } = result;
          
          // Vérifier que lineageData a les propriétés attendues
          if (!lineageData || !lineageData.parents || !lineageData.children) {
            console.error(`❌ [apiActions] loadIdeaTabData versions: Structure de lineage invalide`, lineageData);
            return null;
          }
          
          // ✅ Ajouter les utilisateurs au store
          users.forEach((user: User) => {
            actions.addUser(user);
          });
          
          console.log(`✅ [apiActions] Lineage chargé depuis l'API:`, {
            parents: lineageData.parents.length,
            children: lineageData.children.length,
            users: users.length
          });
          
          // 2. AJOUTER toutes les entités du lineage au store
          // Ajouter les parents au store
          lineageData.parents.forEach(parent => {
            // ✅ Type guard pour déterminer le type de l'entité de manière robuste
            if ('summary' in parent && 'creatorIds' in parent) {
              // C'est une Idea (a summary ET creatorIds)
              const existingIdea = boundSelectors.getIdeaById(parent.id);
              if (!existingIdea) {
                console.log(`📥 [apiActions] Ajout idée parente au store: ${parent.title || parent.id}`);
                actions.addIdea({
                  id: parent.id,
                  title: parent.title || '',
                  summary: parent.summary || '',
                  description: parent.description || '',
                  creatorIds: parent.creatorIds || [],
                  createdAt: parent.createdAt,
                  supportCount: 0,
                  supporters: [],
                  ratings: [],
                  ratingCriteria: [],
                  tags: parent.tags || [],
                  status: 'published',
                  sourceIdeas: [],
                  sourcePosts: [],
                  sourceDiscussions: [],
                  derivedIdeas: [ideaId], // ✅ L'idée parente a l'idée actuelle comme dérivée
                  discussionIds: []
                });
              }
            } else if ('content' in parent && 'authorId' in parent && 'supporters' in parent) {
              // C'est un Post (a content, authorId ET supporters)
              const existingPost = boundSelectors.getPostById(parent.id);
              if (!existingPost) {
                console.log(`📥 [apiActions] Ajout post parent au store: ${parent.title || parent.content?.substring(0, 50)}`);
                actions.addPost({
                  id: parent.id,
                  title: parent.title,
                  content: parent.content || '',
                  authorId: parent.authorId,
                  createdAt: parent.createdAt,
                  supportCount: 0,
                  supporters: [],
                  replies: [],
                  tags: parent.tags || [],
                  location: parent.location || '',
                  sourcePosts: [],
                  derivedIdeas: [ideaId], // ✅ Le post parent a l'idée actuelle comme dérivée
                  derivedPosts: []
                });
              }
            } else if ('posts' in parent && 'type' in parent) {
              // C'est un DiscussionTopic (a posts ET type)
              const existingDiscussion = boundSelectors.getDiscussionTopicById(parent.id);
              if (!existingDiscussion) {
                console.log(`📥 [apiActions] Ajout discussion parente au store: ${parent.title || parent.id}`);
                actions.addDiscussionTopic(parent);
              } else {
                console.log(`✓ [apiActions] Discussion déjà dans le store: ${parent.title}`);
              }
            } else {
              console.warn(`⚠️ [apiActions] Type de parent non reconnu:`, parent);
            }
          });
          
          // Ajouter les enfants au store
          lineageData.children.forEach(child => {
            if (child.type === 'idea') {
              const existingIdea = boundSelectors.getIdeaById(child.id);
              if (!existingIdea) {
                console.log(`📥 [apiActions] Ajout idée dérivée au store: ${child.title}`);
                actions.addIdea({
                  id: child.id,
                  title: child.title || '',
                  summary: child.summary || '',
                  description: '',
                  creators: child.authors || [],
                  createdAt: child.createdAt,
                  supportCount: 0,
                  supporters: [],
                  ratings: [],
                  ratingCriteria: [],
                  tags: [],
                  status: 'published',
                  sourceIdeas: [ideaId], // ✅ L'idée dérivée provient de l'idée actuelle
                  sourcePosts: [],
                  derivedIdeas: [],
                  discussionIds: []
                });
              }
            }
          });
          
          // 3. METTRE À JOUR l'idée actuelle avec les IDs des parents et enfants
          const parentIdeaIds = lineageData.parents
            .filter(p => 'summary' in p && 'creatorIds' in p)
            .map(p => p.id);
          
          const parentPostIds = lineageData.parents
            .filter(p => 'content' in p && 'authorId' in p && 'supporters' in p)
            .map(p => p.id);
          
          const parentDiscussionIds = lineageData.parents
            .filter(p => 'posts' in p && 'type' in p)
            .map(p => p.id);
          
          const childIdeaIds = lineageData.children
            .filter(c => 'summary' in c && 'creatorIds' in c)
            .map(c => c.id);
          
          actions.updateIdea(ideaId, {
            sourceIdeas: parentIdeaIds,
            sourcePosts: parentPostIds,
            sourceDiscussions: parentDiscussionIds,
            derivedIdeas: childIdeaIds
          });
          
          console.log(`✅ [apiActions] Idée mise à jour avec lineage:`, {
            sourceIdeas: parentIdeaIds.length,
            sourcePosts: parentPostIds.length,
            sourceDiscussions: parentDiscussionIds.length,
            derivedIdeas: childIdeaIds.length
          });
          
          // 4. RÉCUPÉRER depuis le store pour construire le résultat final
          const currentIdea = boundSelectors.getIdeaById(ideaId);
          
          if (!currentIdea) {
            console.error(`❌ [hook/apiActions] loadIdeaTabData versions: Idée ${ideaId} non trouvée dans le store après chargement`);
            return null;
          }
          
          console.log(`📊 [apiActions] Construction du résultat depuis le store pour: ${currentIdea.title}`);
          
          // 5. CONSTRUIRE le résultat en utilisant lineageData et le store
          console.log(`📊 [apiActions] Début construction, ${lineageData.parents.length} parents à traiter`);
          const parentsFromStore = lineageData.parents.map(parent => {
            console.log(`  🔍 [apiActions] Traitement parent:`, { 
              id: parent.id, 
              hasTitle: 'title' in parent, 
              hasSummary: 'summary' in parent,
              hasCreatorIds: 'creatorIds' in parent,
              hasContent: 'content' in parent,
              hasAuthorId: 'authorId' in parent,
              hasPosts: 'posts' in parent,
              hasType: 'type' in parent
            });
            
            // ✅ Type guard pour déterminer le type de l'entité de manière robuste
            if ('summary' in parent && 'creatorIds' in parent) {
              // C'est une Idea (a summary ET creatorIds)
              console.log(`    ✓ Identifié comme Idea: ${parent.id}`);
              const idea = boundSelectors.getIdeaById(parent.id);
              if (!idea) {
                console.log(`    ❌ Idea ${parent.id} non trouvée dans le store`);
                return null;
              }
              
              // Résoudre les créateurs depuis les IDs
              const authors = (idea.creatorIds || [])
                .map(id => boundSelectors.getUserById(id))
                .filter(Boolean) as User[];
              
              return {
                id: idea.id,
                type: 'idea' as const,
                title: idea.title,
                summary: idea.summary,
                authors: authors,
                createdAt: idea.createdAt,
                level: -1,
                relationshipType: 'parent' as const
              };
            } else if ('content' in parent && 'authorId' in parent && 'supporters' in parent) {
              // C'est un Post (a content, authorId ET supporters)
              console.log(`    ✓ Identifié comme Post: ${parent.id}`);
              const post = boundSelectors.getPostById(parent.id);
              if (!post) {
                console.log(`    ❌ Post ${parent.id} non trouvé dans le store`);
                return null;
              }
              
              const author = boundSelectors.getUserById(post.authorId);
              return {
                id: post.id,
                type: 'post' as const,
                content: post.content,
                authors: author ? [author] : [],
                createdAt: post.createdAt,
                level: -1,
                relationshipType: 'parent' as const
              };
            } else if ('posts' in parent && 'type' in parent) {
              // C'est un DiscussionTopic (a posts ET type)
              console.log(`    ✓ Identifié comme DiscussionTopic: ${parent.id}`);
              const discussion = boundSelectors.getDiscussionTopicById(parent.id);
              if (!discussion) {
                console.log(`    ❌ Discussion ${parent.id} non trouvée dans le store`);
                return null;
              }
              
              const author = boundSelectors.getUserById(discussion.authorId);
              return {
                id: discussion.id,
                type: 'discussion' as const,
                title: discussion.title,
                content: discussion.content,
                authors: author ? [author] : [],
                createdAt: discussion.createdAt || discussion.timestamp,
                level: -1,
                relationshipType: 'parent' as const
              };
            }
            console.log(`    ⚠️ Type de parent non reconnu pour ${parent.id}`);
            return null;
          }).filter(Boolean);
          
          const childrenFromStore = lineageData.children.map(child => {
            if (child.type === 'idea') {
              const idea = boundSelectors.getIdeaById(child.id);
              // Résoudre les créateurs depuis les IDs
              const authors = (idea.creatorIds || [])
                .map(id => boundSelectors.getUserById(id))
                .filter(Boolean) as User[];
              
              return idea ? {
                id: idea.id,
                type: 'idea' as const,
                title: idea.title,
                summary: idea.summary,
                authors: authors,
                createdAt: idea.createdAt,
                level: 1,
                relationshipType: 'child' as const
              } : null;
            }
            return null;
          }).filter(Boolean);
          
          console.log(`✅ [apiActions] Construit lineage depuis le store: ${parentsFromStore.length} parents, ${childrenFromStore.length} enfants`);
          
          // Résoudre les créateurs de l'idée actuelle depuis les IDs
          const currentAuthors = (currentIdea.creatorIds || [])
            .map(id => boundSelectors.getUserById(id))
            .filter(Boolean) as User[];
          
          // Retourner un objet compatible avec LineageResult
          return {
            currentItem: {
              id: currentIdea.id,
              type: 'idea' as const,
              title: currentIdea.title,
              summary: currentIdea.summary,
              authors: currentAuthors,
              createdAt: currentIdea.createdAt,
              level: 0,
              relationshipType: 'current' as const
            },
            parents: parentsFromStore,
            children: childrenFromStore,
            totalLevels: Math.max(parentsFromStore.length, childrenFromStore.length) + 1
          };
        }
        
        if (tabType === 'description') {
          // L'idée est déjà dans le store, pas besoin de la recharger
          // Si elle n'existe pas, elle sera chargée par le composant parent
          const currentIdea = boundSelectors.getIdeaById(ideaId);
          
          console.log(`📊 [hook/apiActions] loadIdeaTabData description - Idée dans le store:`, currentIdea ? currentIdea.title : 'non trouvée');
          
          return currentIdea;
        }
        
        if (tabType === 'discussions') {
          // Charger les discussions liées à l'idée
          const discussions = await actions.loadDiscussions(ideaId, 'idea');
          
          // L'idée est déjà dans le store, elle a été mise à jour par loadDiscussions
          const currentIdea = boundSelectors.getIdeaById(ideaId);
          
          console.log(`📊 [hook/apiActions] loadIdeaTabData discussions - ${discussions.length} discussions chargées`);
          
          return discussions;
        }
        
        if (tabType === 'evaluation') {
          // Charger les évaluations de l'idée
          const ratings = await actions.loadIdeaRatings(ideaId);
          
          // L'idée est déjà dans le store, elle a été mise à jour par loadIdeaRatings
          const currentIdea = boundSelectors.getIdeaById(ideaId);
          
          console.log(`📊 [hook/apiActions] loadIdeaTabData evaluation - ${ratings.length} évaluations chargées`);
          
          return ratings;
        }
        
        console.log(`⚠️ [hook/apiActions] loadIdeaTabData: Type d'onglet non géré: ${tabType}`);
        return [];
        
      } catch (error) {
        console.error(`❌ [hook/apiActions] loadIdeaTabData ${tabType}:`, error);
        return [];
      }
    },

    /**
     * Publie une nouvelle idée avec extraction automatique des hashtags
     */
    publishIdea: async (payload: {
      title: string;
      summary: string;
      description: string;
      location?: Location | string;
      groupIds?: string[];
      creators?: User[];
      sourceIdeas?: string[];
      sourcePosts?: string[];
      sourceDiscussions?: string[];
      discussionIds?: string[];
      tags?: string[];
    }) => {
      try {
        const currentUser = boundSelectors.getCurrentUser();
        if (!currentUser) {
          console.error('❌ [hook/apiActions] publishIdea: Aucun utilisateur connecté');
          toast.error('Vous devez être connecté pour publier une idée');
          return null;
        }

        // Extraire les hashtags du titre, résumé et description
        const { extractHashtagsFromMultipleTexts } = await import('../utils/hashtagUtils');
        const extractedTags = extractHashtagsFromMultipleTexts(
          payload.title || '',
          payload.summary || '',
          payload.description || ''
        );
        
        // Combiner les tags fournis et les hashtags extraits
        const finalTags = [...(payload.tags || []), ...extractedTags];

        console.log('✅ [apiActions] publishIdea: Tags extraits:', extractedTags, '| Tags finaux:', finalTags);

        // Créer l'idée via l'API avec les tags
        const { createIdeaOnApi } = await import('../api/contentService');
        const newIdea = await createIdeaOnApi({
          title: payload.title,
          summary: payload.summary,
          description: payload.description,
          location: payload.location,
          authorId: currentUser.id,
          groupIds: payload.groupIds,
          tags: finalTags, // ✅ Envoyer les tags à l'API
          sourceIdeas: payload.sourceIdeas || [],
          sourcePosts: payload.sourcePosts || [],
          sourceDiscussions: payload.sourceDiscussions || []
        });

        if (!newIdea) {
          toast.error('Échec de la création de l\'idée');
          return null;
        }
        
        // 2. AJOUTER AU STORE
        actions.addIdea(newIdea);
        
        console.log(`✅ [apiActions] publishIdea: Idée "${newIdea.title}" créée et ajoutée au store`);
        
        // Note: Navigation is now handled by the caller using useNavigate()
        toast.success('Votre idée a été publiée avec succès !');
        return newIdea;
      } catch (error) {
        console.error('❌ [hook/apiActions] publishIdea:', error);
        toast.error('Une erreur est survenue lors de la publication');
        return null;
      }
    },



    /**
     * Publie un nouveau post avec extraction automatique des hashtags
     */
    publishPost: async (payload: {
      title?: string;
      content: string;
      location?: Location | string;
      tags?: string[];
      authorId?: string;
      groupIds?: string[];
      linkedContent?: string[];
      parentDiscussionId?: string;
      sourcePostIds?: string[];
    }) => {
      try {
        const currentUser = boundSelectors.getCurrentUser();
        
        // ✅ Si un authorId est fourni, on vérifie que cet utilisateur existe
        // Sinon, on vérifie qu'un utilisateur est connecté
        if (payload.authorId) {
          const author = boundSelectors.getUserById(payload.authorId);
          if (!author) {
            console.error('❌ [hook/apiActions] publishPost: Utilisateur authorId non trouvé:', payload.authorId);
            toast.error('Erreur: utilisateur introuvable');
            return null;
          }
        } else if (!currentUser) {
          console.error('❌ [hook/apiActions] publishPost: Aucun utilisateur connecté');
          toast.error('Vous devez être connecté pour publier un post');
          return null;
        }

        // ✅ Déterminer l'auteur réel : si authorId est fourni, le récupérer du store
        const finalAuthorId = payload.authorId || currentUser?.id;
        const finalAuthor = payload.authorId 
          ? boundSelectors.getUserById(payload.authorId)!
          : currentUser!;
        
        console.log(`✅ [hook/apiActions] publishPost - Auteur: ${finalAuthor.id} ${finalAuthor.name}`);

        // Extraction automatique des hashtags
        const { extractHashtagsFromMultipleTexts } = await import('../utils/hashtagUtils');
        const extractedTags = extractHashtagsFromMultipleTexts(
          payload.content || ''
        );
        
        // Fusionner tags fournis + hashtags extraits (dédoublonner)
        const allTags = [...(payload.tags || []), ...extractedTags];
        const finalTags = Array.from(new Set(allTags));

        // Créer le post via l'API en passant les tags extraits
        const { createPostOnApi } = await import('../api/contentService');
        const newPost = await createPostOnApi({
          title: payload.title,
          content: payload.content,
          location: payload.location,
          authorId: finalAuthorId,
          author: finalAuthor, // ✅ Passer l'objet author complet pour éviter les problèmes avec les utilisateurs temporaires
          groupIds: payload.groupIds,
          sourcePostIds: payload.sourcePostIds || [],
          tags: finalTags // ✅ Envoyer les tags au service API
        });

        if (!newPost) {
          toast.error('Échec de la création du post');
          return null;
        }
        
        // 2. AJOUTER AU STORE
        actions.addPost(newPost);
        
        console.log(`✅ [apiActions] publishPost: Post créé et ajouté au store`);
        
        // Note: Navigation is now handled by the caller using useNavigate()
        toast.success('Votre post a été publié avec succès !');
        return newPost;
      } catch (error) {
        console.error('❌ [hook/apiActions] publishPost:', error);
        toast.error('Une erreur est survenue lors de la publication');
        return null;
      }
    },
    
    /**
     * Charge les groupes et memberships de l'utilisateur
     * À appeler après l'authentification
     */
    loadUserGroups: async (userId: string) => {
      try {
        console.log(`🔄 [apiActions] Chargement des groupes pour l'utilisateur ${userId}...`);
        
        const { fetchMyGroups } = await import('../api/groupService');
        const { groupsWithMemberships, pendingGroups } = await fetchMyGroups(userId);
        
        console.log(`✅ [apiActions] Groupes chargés:`, {
          actifs: groupsWithMemberships.length,
          pending: pendingGroups.length
        });
        
        // Ajouter les groupes et memberships au store
        storeUpdater(prevStore => {
          const newGroups = { ...prevStore.groups };
          const newMemberships = { ...prevStore.groupMemberships };
          const newPendingGroups = { ...prevStore.pendingGroups };
          
          // Ajouter les groupes actifs
          groupsWithMemberships.forEach(({ group, membership }) => {
            newGroups[group.id] = group;
            const membershipId = `${membership.userId}-${membership.groupId}`;
            newMemberships[membershipId] = membership;
          });
          
          // Ajouter les groupes pending
          pendingGroups.forEach(pg => {
            newPendingGroups[pg.id] = pg;
          });
          
          return {
            groups: newGroups,
            groupMemberships: newMemberships,
            pendingGroups: newPendingGroups
          };
        });
        
        console.log(`✅ [apiActions] ${groupsWithMemberships.length} groupes et ${pendingGroups.length} groupes pending ajoutés au store`);
        
        return { groupsWithMemberships, pendingGroups };
      } catch (error) {
        console.error('❌ [apiActions] Erreur lors du chargement des groupes:', error);
        return null;
      }
    },
    
    /**
     * ✅ NOUVELLE: Charge tous les groupes (pour l'onglet groupes)
     * Lazy loading - à appeler seulement quand nécessaire
     */
    loadAllGroups: async () => {
      try {
        console.log(`🔄 [apiActions] Chargement de tous les groupes...`);
        
        const { fetchAllGroups } = await import('../api/groupService');
        const { groups: allGroups, users: animators } = await fetchAllGroups();
        
        console.log(`✅ [apiActions] ${allGroups.length} groupes et ${animators.length} animateurs chargés`);
        
        // Ajouter au store
        storeUpdater(prevStore => {
          const newGroups = { ...prevStore.groups };
          const newUsers = { ...prevStore.users };
          
          allGroups.forEach(group => {
            newGroups[group.id] = group;
          });
          
          animators.forEach(user => {
            newUsers[user.id] = user;
          });
          
          return {
            groups: newGroups,
            users: newUsers
          };
        });
        
        console.log(`✅ [apiActions] Tous les groupes ajoutés au store`);
        
        return allGroups;
      } catch (error) {
        console.error('❌ [apiActions] Erreur lors du chargement de tous les groupes:', error);
        return [];
      }
    },

    /**
     * Charge le profil COMPLET d'un utilisateur depuis l'API
     * Cette fonction charge toutes les données du profil (bio, location, etc.)
     * et met à jour le store avec les données complètes
     * 
     * @param userId - ID de l'utilisateur (avec ou sans préfixe)
     * @returns true si succès, false sinon
     */
    loadUserProfile: async (userId: string): Promise<boolean> => {
      try {
        console.log(`🔄 [apiActions] loadUserProfile - userId: ${userId}`);
        
        const { fetchUserProfile } = await import('../api/userService');
        const userProfile = await fetchUserProfile(userId);
        
        if (!userProfile) {
          console.warn(`⚠️ [apiActions] loadUserProfile - Utilisateur ${userId} non trouvé`);
          return false;
        }
        
        // ✅ Mettre à jour le store avec le profil complet
        // Le store a la vérité - cette fonction fait autorité
        actions.addUser(userProfile);
        
        console.log(`✅ [apiActions] loadUserProfile - Profil complet ajouté au store:`, {
          id: userProfile.id,
          name: userProfile.name,
          hasBio: !!userProfile.bio,
          hasLocation: !!userProfile.location
        });
        
        return true;
      } catch (error) {
        console.error('❌ [apiActions] Erreur lors du chargement du profil utilisateur:', error);
        return false;
      }
    }
  };
}