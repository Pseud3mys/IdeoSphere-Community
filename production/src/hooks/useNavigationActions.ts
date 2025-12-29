import { useNavigate } from 'react-router-dom';
import { useEntityStoreSimple } from './useEntityStoreSimple';
import { cleanGroupId, cleanId } from '../utils/idUtils';

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
        
        const apiResponse = await fetchIdeaDetails(ideaId);
        
        if (!apiResponse) {
          console.error(`❌ Idée ${ideaId} non trouvée`);
          return;
        }
        
        // 2. Ajouter au store (idée + utilisateurs)
        actions.addIdea(apiResponse.idea);
        apiResponse.users.forEach(user => actions.addUser(user));
        
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
        // Utiliser le format unifié /content/:id avec l'ID pr��fixé
        // Ajouter le préfixe 'ideas/' si ce n'est pas déjà présent
        const prefixedId = ideaId.startsWith('ideas/') ? ideaId : `ideas/${ideaId}`;
        navigate(`/content/${prefixedId}`);
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
        const apiResponse = await fetchPostDetails(postId);
        
        if (!apiResponse) {
          console.error(`❌ Post ${postId} non trouvé`);
          return;
        }
        
        // 2. Ajouter au store (post + utilisateurs)
        actions.addPost(apiResponse.post);
        apiResponse.users.forEach(user => actions.addUser(user));
        
        console.log(`✅ Post ${postId} chargé avec succès`);
        
        // 3. Naviguer vers la page de détail avec React Router
        // Utiliser le format unifié /content/:id avec l'ID préfixé
        // Ajouter le préfixe 'posts/' si ce n'est pas déjà présent
        const prefixedId = postId.startsWith('posts/') ? postId : `posts/${postId}`;
        navigate(`/content/${prefixedId}`);
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
      
      // ✅ Nettoyer l'ID pour éviter les doublons de préfixe (users/users/123)
      const cleanUserId = cleanId(userId);
      navigate(`/user/${cleanUserId}`);
    },

    /**
     * Navigation vers un groupe
     * Nettoie l'ID pour ne garder que la partie courte dans l'URL
     */
    goToGroup: (groupId: string) => {
      const cleanId = cleanGroupId(groupId);
      navigate(`/groups/${cleanId}`);
    },

    /**
     * Navigation vers l'annuaire des groupes
     */
    goToGroups: () => {
      navigate('/groups');
    },

    /**
     * Navigation vers mes groupes (Phase 2)
     */
    goToMyGroups: () => {
      navigate('/groups/my');
    },

    /**
     * Navigation vers un groupe pending (Phase 2)
     * Nettoie l'ID pour ne garder que la partie courte dans l'URL
     */
    goToPendingGroup: (pendingId: string) => {
      const cleanId = cleanGroupId(pendingId);
      navigate(`/groups/pending/${cleanId}`);
    },

    /**
     * Navigation vers la page de gestion d'un groupe (Phase 3)
     * Nettoie l'ID pour ne garder que la partie courte dans l'URL
     */
    goToGroupManage: (groupId: string) => {
      const cleanId = cleanGroupId(groupId);
      navigate(`/groups/${cleanId}/manage`);
    },

    /**
     * Navigations vers des pages simples
     */
    goToDiscovery: () => navigate('/discovery'),
    goToMyIdeas: () => navigate('/my-ideas'),
    goToCreateIdea: () => navigate('/create-idea'),
    goToCreatePost: () => navigate('/create-idea'), // Utilise la même page pour posts et projets
    goToProfile: () => navigate('/profile'),
    goToCommunities: () => navigate('/communities'),
    goToHome: () => navigate('/'),
    goToSignup: () => navigate('/signup'),
    goToStatistics: () => navigate('/statistics'),
    goToCartography: () => navigate('/cartography'),
    
    /**
     * Navigation vers la création avec des groupes pré-remplis
     * @param groupIds - IDs des groupes à pré-remplir
     * @param mode - Mode de création : 'post' (discussion rapide) ou 'idea' (projet complet)
     */
    goToCreateWithGroups: (groupIds: string[], mode: 'post' | 'idea' = 'post') => {
      navigate('/create-idea', { state: { prefilledGroupIds: groupIds, creationMode: mode } });
    },
  };
}