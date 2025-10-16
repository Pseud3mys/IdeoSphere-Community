import { SimpleEntityStore, StoreUpdater } from '../store/SimpleEntityStore';
import { User, Idea, Post, DiscussionTopic } from '../types';

/**
 * Actions de navigation pour l'Entity Store
 * Gère la navigation entre les différentes pages et le chargement des données nécessaires
 */
export function createNavigationActions(
  store: SimpleEntityStore,
  actions: any,
  boundSelectors: any,
  storeUpdater: StoreUpdater
) {
  return {
    // Navigation actions de base
    goToTab: (tab: typeof store.activeTab) => actions.setActiveTab(tab),
    
    goToIdea: async (ideaId: string, initialTab: 'description' | 'discussions' | 'evaluation' | 'versions' = 'description') => {
      try {
        // 1. APPELER L'API pour obtenir les détails de l'idée
        const { fetchIdeaDetails } = await import('../api/contentService');
        const { fetchDiscussions } = await import('../api/detailsService');
        
        const apiIdeaDetails = await fetchIdeaDetails(ideaId);
        
        if (!apiIdeaDetails) {
          console.error(`❌ [navigationActions] goToIdea: Idée ${ideaId} non trouvée par l'API`);
          return;
        }
        
        // 2. AJOUTER AU STORE
        actions.addIdea(apiIdeaDetails);
        
        // 3. Charger les discussions et mettre à jour l'idée
        const discussions = await fetchDiscussions(ideaId, 'idea');
        
        if (discussions && discussions.length > 0) {
          // Ajouter les discussions au store
          discussions.forEach(discussion => {
            actions.addDiscussionTopic(discussion);
          });
          
          // Mettre à jour l'idée avec les discussionIds
          const currentIdea = boundSelectors.getIdeaById(ideaId);
          if (currentIdea) {
            const discussionIds = discussions.map(d => d.id);
            const newDiscussionIds = [...(currentIdea.discussionIds || []), ...discussionIds.filter(id => !currentIdea.discussionIds?.includes(id))];
            actions.updateIdea(ideaId, {
              discussionIds: newDiscussionIds
            });
          }
        }
        
        // 4. LIRE DEPUIS LE STORE (trouve mockées + dynamiques)
        const ideaFromStore = boundSelectors.getIdeaById(ideaId);
        
        if (!ideaFromStore) {
          console.error(`❌ [navigationActions] goToIdea: Idée ${ideaId} non trouvée dans le store après ajout`);
          return;
        }
        
        console.log(`✅ [navigationActions] goToIdea: Chargé idée "${ideaFromStore.title}" depuis le store avec ${ideaFromStore.discussionIds?.length || 0} discussions`);
        
      } catch (error) {
        console.error(`❌ [navigationActions] goToIdea:`, error);
        return;
      }
      
      // Naviguer vers la page de détail
      actions.setSelectedIdeaId(ideaId);
      actions.setActiveTab('idea-detail');
    },
    
    goToPost: async (postId: string, initialTab: 'content' | 'discussions' = 'content') => {
      try {
        // 1. APPELER L'API pour obtenir les détails du post
        const { fetchPostDetails } = await import('../api/contentService');
        const apiPostDetails = await fetchPostDetails(postId);
        
        if (!apiPostDetails) {
          console.error(`❌ [navigationActions] goToPost: Post ${postId} non trouvé par l'API`);
          return;
        }
        
        // 2. AJOUTER AU STORE
        actions.addPost(apiPostDetails);
        
        // 3. LIRE DEPUIS LE STORE (trouve mockées + dynamiques)
        const postFromStore = boundSelectors.getPostById(postId);
        
        if (!postFromStore) {
          console.error(`❌ [navigationActions] goToPost: Post ${postId} non trouvé dans le store après ajout`);
          return;
        }
        
        console.log(`✅ [navigationActions] goToPost: Chargé post "${postFromStore.content.substring(0, 50)}..." depuis le store`);
        
      } catch (error) {
        console.error(`❌ [navigationActions] goToPost:`, error);
        return;
      }
      
      actions.setSelectedPostId(postId);
      actions.setActiveTab('post-detail');
    },
    
    goToUser: async (userId: string) => {
      // Les données utilisateur sont déjà dans le store (chargées au démarrage)
      // On a juste besoin de naviguer vers le profil
      try {
        // Vérifier que l'utilisateur existe dans le store
        const user = boundSelectors.getUserById(userId);
        
        if (!user) {
          console.error(`❌ [hook/navigationActions] goToUser: Utilisateur ${userId} non trouvé dans le store`);
          // On continue quand même la navigation pour afficher le message "Utilisateur non trouvé"
        } else {
          console.log(`✅ [navigationActions] goToUser: Utilisateur ${user.name} trouvé dans le store`);
        }
      } catch (error) {
        console.error(`❌ [hook/navigationActions] goToUser:`, error);
      }
      
      // Naviguer vers le profil
      actions.setSelectedUserId(userId);
      actions.setActiveTab('user-profile');
    },
    
    goToCommunity: (communityId: string) => {
      actions.setSelectedCommunityId(communityId);
      actions.setActiveTab('community-detail');
    },
    
    goToCreateIdea: () => {
      actions.setActiveTab('create-idea');
    },
    
    goToProfile: () => {
      actions.setActiveTab('profile');
    },
    
    goToMyIdeas: () => {
      actions.setActiveTab('my-ideas');
    },
    
    goToDiscovery: () => {
      actions.setActiveTab('discovery');
    },
    
    goToWelcome: () => {
      actions.setActiveTab('welcome');
    },
    
    goToCommunities: () => {
      actions.setActiveTab('communities');
    },
    
    // Version click navigation
    viewVersion: (versionId: string) => {
      return versionId;
    },
    
    // Actions d'entrée de plateforme
    enterPlatform: () => {
      actions.setHasEnteredPlatform(true);
      
      // Déterminer la destination selon l'utilisateur connecté
      const currentUser = boundSelectors.getCurrentUser();
      
      if (currentUser && currentUser.isRegistered) {
        // Utilisateur connecté → aller aux contributions
        actions.setActiveTab('my-ideas');
      } else {
        // Visiteur → aller au discovery
        actions.setActiveTab('discovery');
      }
    },
    
    exitPlatform: () => {
      actions.setHasEnteredPlatform(false);
      actions.setActiveTab('welcome');
    }
  };
}
