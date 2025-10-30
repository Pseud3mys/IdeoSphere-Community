import { useNavigate } from 'react-router-dom';
import { useEntityStoreSimple } from './useEntityStoreSimple';

/**
 * Hook personnalisé pour la navigation avec React Router
 * Remplace progressivement les actions.goToTab(), actions.goToIdea(), etc.
 * 
 * Phase 3: Ce hook fournit des fonctions de navigation qui utilisent React Router
 * au lieu du système activeTab
 * 
 * Note : Utilise maintenant le format d'URL unifié /content/:id
 * où l'ID contient le préfixe (ideas/123, posts/456)
 */
export function useNavigationActions() {
  const navigate = useNavigate();
  const { actions, getIdeaById, getUserById } = useEntityStoreSimple();

  return {
    /**
     * Navigation vers une idée (avec chargement des données)
     */
    goToIdea: async (ideaId: string) => {
      try {
        // 1. Charger les données de l'idée depuis l'API
        const { fetchIdeaDetails } = await import('../api/contentService');
        const { fetchDiscussions } = await import('../api/detailsService');
        const { getIdeaRatingsOnApi } = await import('../api/interactionService');
        
        const apiIdeaDetails = await fetchIdeaDetails(ideaId);
        
        if (!apiIdeaDetails) {
          console.error(`❌ Idée ${ideaId} non trouvée`);
          return;
        }
        
        // 2. Ajouter au store
        actions.addIdea(apiIdeaDetails);
        
        // 3. Charger les ratings
        const ratings = await getIdeaRatingsOnApi(ideaId);
        if (ratings) {
          actions.updateIdea(ideaId, { ratings });
        }
        
        // 4. Charger les discussions
        const { discussions, users } = await fetchDiscussions(ideaId, 'idea');
        
        if (users && users.length > 0) {
          users.forEach(user => actions.addUser(user));
        }
        
        if (discussions && discussions.length > 0) {
          discussions.forEach(discussion => actions.addDiscussionTopic(discussion));
          
          const currentIdea = getIdeaById(ideaId);
          if (currentIdea) {
            const discussionIds = discussions.map(d => d.id);
            const newDiscussionIds = [
              ...(currentIdea.discussionIds || []),
              ...discussionIds.filter(id => !currentIdea.discussionIds?.includes(id))
            ];
            actions.updateIdea(ideaId, { discussionIds: newDiscussionIds });
          }
        }
        
        console.log(`✅ Idée ${ideaId} chargée avec succès`);
        
        // 5. Naviguer vers la page de détail avec React Router
        // Utiliser le format unifié /content/:id avec l'ID préfixé
        navigate(`/content/${ideaId}`);
      } catch (error) {
        console.error(`❌ Erreur lors du chargement de l'idée ${ideaId}:`, error);
      }
    },

    /**
     * Navigation vers un post (avec chargement des données)
     */
    goToPost: async (postId: string) => {
      try {
        // 1. Charger les données du post depuis l'API
        const { fetchPostDetails } = await import('../api/contentService');
        const apiPostDetails = await fetchPostDetails(postId);
        
        if (!apiPostDetails) {
          console.error(`❌ Post ${postId} non trouvé`);
          return;
        }
        
        // 2. Ajouter au store
        actions.addPost(apiPostDetails);
        
        console.log(`✅ Post ${postId} chargé avec succès`);
        
        // 3. Naviguer vers la page de détail avec React Router
        // Utiliser le format unifié /content/:id avec l'ID préfixé
        navigate(`/content/${postId}`);
      } catch (error) {
        console.error(`❌ Erreur lors du chargement du post ${postId}:`, error);
      }
    },

    /**
     * Navigation vers un profil utilisateur
     */
    goToUser: (userId: string) => {
      const user = getUserById(userId);
      
      if (!user) {
        console.warn(`⚠️ Utilisateur ${userId} non trouvé dans le store`);
      }
      
      navigate(`/user/${userId}`);
    },

    /**
     * Navigation vers une communauté
     */
    goToCommunity: (communityId: string) => {
      navigate(`/community/${communityId}`);
    },

    /**
     * Navigations vers des pages simples
     */
    goToDiscovery: () => navigate('/discovery'),
    goToMyIdeas: () => navigate('/my-ideas'),
    goToCreateIdea: () => navigate('/create-idea'),
    goToProfile: () => navigate('/profile'),
    goToCommunities: () => navigate('/communities'),
    goToHome: () => navigate('/'),
  };
}
