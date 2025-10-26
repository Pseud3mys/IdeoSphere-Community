import { SimpleEntityStore, StoreUpdater } from '../store/SimpleEntityStore';
import { User, Idea, Post, DiscussionTopic } from '../types';
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
          discussions: mockData.discussions.length
        });
        
        // Initialiser le store avec toutes les données
        actions.initializeStore({
          users: [mockData.currentUser, mockData.guestUser, ...mockData.users],
          ideas: mockData.ideas,
          posts: mockData.posts,
          discussionTopics: mockData.discussions,
          communities: [],
          communityMemberships: [],
          currentUserId: mockData.currentUser.id
        });
        
        console.log('✅ [apiActions] Store initialisé avec toutes les données');
        
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
          
          // Naviguer vers la page discovery
          actions.setActiveTab('discovery');
          
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
        
        // Stocker les IDs des items du feed et mettre à jour le timestamp du cache
        actions.setFeedIdeaIds(feedIdeaIds);
        actions.setFeedPostIds(feedPostIds);
        actions.setFeedLastFetched(now);
        
        // 3. LIRE DEPUIS LE STORE (trouve mockées + dynamiques)
        const ideasFromStore = feedIdeaIds.map(id => boundSelectors.getIdeaById(id)).filter(Boolean);
        const postsFromStore = feedPostIds.map(id => boundSelectors.getPostById(id)).filter(Boolean);
        
        console.log(`✅ [apiActions] fetchFeed: Chargé ${ideasFromStore.length} idées et ${postsFromStore.length} posts depuis l'API`);
        
        // Naviguer vers la page discovery
        actions.setActiveTab('discovery');
        
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
        
        actions.setActiveTab('discovery');
        
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
            // Naviguer vers mes idées
            actions.setActiveTab('my-ideas');
            
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
          actions.setActiveTab('my-ideas');
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
          .filter(idea => idea.creators?.includes(currentUser.id));
          
        const supportIdeas = allIdeaIds
          .map(id => boundSelectors.getIdeaById(id))
          .filter(Boolean)
          .filter(idea => 
            idea.supporters?.includes(currentUser.id) && // ✅ supporters est maintenant string[]
            !idea.creators?.includes(currentUser.id)
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
        
        // Naviguer vers mes idées
        actions.setActiveTab('my-ideas');
        
        return contributionsFromStore;
        
      } catch (error) {
        console.error('❌ [hook/apiActions] fetchMyContributions:', error);
        actions.setActiveTab('my-ideas');
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
          actions.setActiveTab('profile');
          return null;
        }
        
        console.log(`✅ [apiActions] fetchMyProfile: Chargé profil de ${userFromStore.name} depuis le store`);
        
        // Naviguer vers le profil
        actions.setActiveTab('profile');
        
        return userFromStore;
        
      } catch (error) {
        console.error('❌ [apiActions] fetchMyProfile:', error);
        
        // En cas d'erreur, naviguer quand même vers le profil
        actions.setActiveTab('profile');
        
        // Retourner l'utilisateur depuis le store
        return boundSelectors.getUserById(currentUser.id) || currentUser;
      }
    },
    
    /**
     * Charge le lineage (parents/enfants) d'un contenu
     */
    loadLineage: async (itemId: string, itemType: 'idea' | 'post') => {
      try {
        const { fetchLineage } = await import('../api/lineageService');
        const lineageResult = await fetchLineage(itemId, itemType);
        
        if (lineageResult) {
          // Ajouter/fusionner les éléments au store directement
          const parentIds: string[] = [];
          const childIds: string[] = [];
          
          lineageResult.parents.forEach((parentItem: any) => {
            if (parentItem.type === 'idea') {
              // Créer un objet Idea complet à partir du LineageItem
              actions.addIdea({
                id: parentItem.id,
                title: parentItem.title || '',
                summary: parentItem.summary || '',
                description: '',
                creators: parentItem.authors || [],
                createdAt: parentItem.createdAt,
                supportCount: 0,
                supporters: [],
                ratings: [],
                ratingCriteria: [],
                tags: [],
                status: 'published',
                sourceIdeas: [],
                sourcePosts: [],
                derivedIdeas: [],
                discussionIds: []
              });
            } else {
              // Créer un objet Post complet à partir du LineageItem
              actions.addPost({
                id: parentItem.id,
                content: parentItem.content || '',
                authorId: parentItem.authors?.[0]?.id || 'unknown', // ✅ Migré de author: object vers authorId: string
                createdAt: parentItem.createdAt,
                supportCount: 0,
                supporters: [],
                replies: [],
                tags: [],
                location: '',
                linkedContent: [],
                sourcePosts: [],
                derivedIdeas: [],
                derivedPosts: []
              });
            }
            parentIds.push(parentItem.id);
          });
          
          lineageResult.children.forEach((childItem: any) => {
            if (childItem.type === 'idea') {
              // Créer un objet Idea complet à partir du LineageItem
              actions.addIdea({
                id: childItem.id,
                title: childItem.title || '',
                summary: childItem.summary || '',
                description: '',
                creators: childItem.authors || [],
                createdAt: childItem.createdAt,
                supportCount: 0,
                supporters: [],
                ratings: [],
                ratingCriteria: [],
                tags: [],
                status: 'published',
                sourceIdeas: [],
                sourcePosts: [],
                derivedIdeas: [],
                discussionIds: []
              });
            } else {
              // Créer un objet Post complet à partir du LineageItem
              actions.addPost({
                id: childItem.id,
                content: childItem.content || '',
                authorId: childItem.authors?.[0]?.id || 'unknown', // ✅ Migré de author: object vers authorId: string
                createdAt: childItem.createdAt,
                supportCount: 0,
                supporters: [],
                replies: [],
                tags: [],
                location: '',
                linkedContent: [],
                sourcePosts: [],
                derivedIdeas: [],
                derivedPosts: []
              });
            }
            childIds.push(childItem.id);
          });
          
          // Mettre à jour l'élément actuel avec les IDs des parents et enfants
          if (itemType === 'idea') {
            const parentIdeaIds = parentIds.filter(id => {
              const item = lineageResult.parents.find((p: any) => p.id === id);
              return item?.type === 'idea';
            });
            const parentPostIds = parentIds.filter(id => {
              const item = lineageResult.parents.find((p: any) => p.id === id);
              return item?.type === 'post';
            });
            const childIdeaIds = childIds.filter(id => {
              const item = lineageResult.children.find((c: any) => c.id === id);
              return item?.type === 'idea';
            });
            
            actions.updateIdea(itemId, {
              sourceIdeas: parentIdeaIds,
              sourcePosts: parentPostIds,
              derivedIdeas: childIdeaIds
            });
          } else {
            // Pour un post
            const parentPostIds = parentIds.filter(id => {
              const item = lineageResult.parents.find((p: any) => p.id === id);
              return item?.type === 'post';
            });
            const childIdeaIds = childIds.filter(id => {
              const item = lineageResult.children.find((c: any) => c.id === id);
              return item?.type === 'idea';
            });
            const childPostIds = childIds.filter(id => {
              const item = lineageResult.children.find((c: any) => c.id === id);
              return item?.type === 'post';
            });
            
            actions.updatePost(itemId, {
              sourcePosts: parentPostIds,
              derivedIdeas: childIdeaIds,
              derivedPosts: childPostIds
            });
          }
          
          console.log(`✅ [hook/apiActions] loadLineage - ${itemType} ${itemId} mis à jour avec ${parentIds.length} parents et ${childIds.length} enfants`);
          
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
        const discussions = await fetchDiscussions(itemId, itemType);
        
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
          const lineageData = await fetchLineage(ideaId);
          
          if (!lineageData) {
            console.error(`❌ [apiActions] loadIdeaTabData versions: Échec du chargement du lineage pour ${ideaId}`);
            return null;
          }
          
          console.log(`✅ [apiActions] Lineage chargé depuis l'API:`, {
            parents: lineageData.parents.length,
            children: lineageData.children.length
          });
          
          // 2. AJOUTER toutes les entités du lineage au store
          // Ajouter les parents au store
          lineageData.parents.forEach(parent => {
            if (parent.type === 'idea') {
              // Vérifier si l'idée existe dans le store
              const existingIdea = boundSelectors.getIdeaById(parent.id);
              if (!existingIdea) {
                console.log(`📥 [apiActions] Ajout idée parente au store: ${parent.title}`);
                // Créer un objet Idea complet à partir du LineageItem
                actions.addIdea({
                  id: parent.id,
                  title: parent.title || '',
                  summary: parent.summary || '',
                  description: '',
                  creators: parent.authors || [],
                  createdAt: parent.createdAt,
                  supportCount: 0,
                  supporters: [],
                  ratings: [],
                  ratingCriteria: [],
                  tags: [],
                  status: 'published',
                  sourceIdeas: [],
                  sourcePosts: [],
                  derivedIdeas: [],
                  discussionIds: []
                });
              }
            } else if (parent.type === 'post') {
              const existingPost = boundSelectors.getPostById(parent.id);
              if (!existingPost) {
                console.log(`📥 [apiActions] Ajout post parent au store: ${parent.content?.substring(0, 50)}`);
                actions.addPost({
                  id: parent.id,
                  content: parent.content || '',
                  authorId: parent.authors?.[0]?.id || 'unknown', // ✅ Migré de author: object vers authorId: string
                  createdAt: parent.createdAt,
                  supportCount: 0,
                  supporters: [],
                  replies: [],
                  tags: [],
                  location: '',
                  linkedContent: [],
                  sourcePosts: [],
                  derivedIdeas: [],
                  derivedPosts: []
                });
              }
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
                  sourceIdeas: [],
                  sourcePosts: [],
                  derivedIdeas: [],
                  discussionIds: []
                });
              }
            }
          });
          
          // 3. METTRE À JOUR l'idée actuelle avec les IDs des parents et enfants
          const parentIdeaIds = lineageData.parents
            .filter(p => p.type === 'idea')
            .map(p => p.id);
          
          const parentPostIds = lineageData.parents
            .filter(p => p.type === 'post')
            .map(p => p.id);
          
          const childIdeaIds = lineageData.children
            .filter(c => c.type === 'idea')
            .map(c => c.id);
          
          actions.updateIdea(ideaId, {
            sourceIdeas: parentIdeaIds,
            sourcePosts: parentPostIds,
            derivedIdeas: childIdeaIds
          });
          
          console.log(`✅ [apiActions] Idée mise à jour avec lineage:`, {
            sourceIdeas: parentIdeaIds.length,
            sourcePosts: parentPostIds.length,
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
          const parentsFromStore = lineageData.parents.map(parent => {
            if (parent.type === 'idea') {
              const idea = boundSelectors.getIdeaById(parent.id);
              return idea ? {
                id: idea.id,
                type: 'idea' as const,
                title: idea.title,
                summary: idea.summary,
                authors: idea.creators,
                createdAt: idea.createdAt,
                level: -1,
                relationshipType: 'parent' as const
              } : null;
            } else {
              const post = boundSelectors.getPostById(parent.id);
              return post ? {
                id: post.id,
                type: 'post' as const,
                content: post.content,
                authors: [post.author],
                createdAt: post.createdAt,
                level: -1,
                relationshipType: 'parent' as const
              } : null;
            }
          }).filter(Boolean);
          
          const childrenFromStore = lineageData.children.map(child => {
            if (child.type === 'idea') {
              const idea = boundSelectors.getIdeaById(child.id);
              return idea ? {
                id: idea.id,
                type: 'idea' as const,
                title: idea.title,
                summary: idea.summary,
                authors: idea.creators,
                createdAt: idea.createdAt,
                level: 1,
                relationshipType: 'child' as const
              } : null;
            }
            return null;
          }).filter(Boolean);
          
          console.log(`✅ [apiActions] Construit lineage depuis le store: ${parentsFromStore.length} parents, ${childrenFromStore.length} enfants`);
          
          // Retourner un objet compatible avec LineageResult
          return {
            currentItem: {
              id: currentIdea.id,
              type: 'idea' as const,
              title: currentIdea.title,
              summary: currentIdea.summary,
              authors: currentIdea.creators,
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
      location?: string;
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
        
        // Naviguer vers la page de détail de l'idée
        actions.setSelectedIdeaId(newIdea.id);
        actions.setActiveTab('idea-detail');
        
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
      content: string;
      location?: string;
      tags?: string[];
      authorId?: string;
      linkedContent?: string[];
      parentDiscussionId?: string;
      sourcePostIds?: string[];
    }) => {
      try {
        const currentUser = boundSelectors.getCurrentUser();
        if (!currentUser) {
          console.error('❌ [hook/apiActions] publishPost: Aucun utilisateur connecté');
          toast.error('Vous devez être connecté pour publier un post');
          return null;
        }

        // ✅ Déterminer l'auteur réel : si authorId est fourni, le récupérer du store
        const finalAuthorId = payload.authorId || currentUser.id;
        const finalAuthor = payload.authorId 
          ? boundSelectors.getUserById(payload.authorId) || currentUser
          : currentUser;
        
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
          content: payload.content,
          location: payload.location,
          authorId: finalAuthorId,
          author: finalAuthor, // ✅ Passer l'objet author complet pour éviter les problèmes avec les utilisateurs temporaires
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
        
        // Naviguer vers la page de détail du post
        actions.setSelectedPostId(newPost.id);
        actions.setActiveTab('post-detail');
        
        toast.success('Votre post a été publié avec succès !');
        return newPost;
      } catch (error) {
        console.error('❌ [hook/apiActions] publishPost:', error);
        toast.error('Une erreur est survenue lors de la publication');
        return null;
      }
    }
  };
}
