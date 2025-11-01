import { useEffect } from 'react';
import { MyIdeasPage } from '../components/MyIdeasPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';

/**
 * MyIdeasPageWrapper
 * Wrapper pour MyIdeasPage qui connecte tous les handlers depuis le store
 * Utilise useNavigationActions pour la navigation avec React Router
 * Charge automatiquement les contributions de l'utilisateur au montage
 */
export function MyIdeasPageWrapper() {
  const { actions } = useEntityStoreSimple();
  const navigation = useNavigationActions();

  // Charger les contributions de l'utilisateur au montage de la page
  useEffect(() => {
    console.log('🔄 [MyIdeasPageWrapper] Chargement des contributions...');
    
    // Charger les contributions avec gestion du cache
    const loadContributions = async () => {
      try {
        const result = await actions.fetchMyContributions();
        if (result) {
          console.log('✅ [MyIdeasPageWrapper] Contributions chargées:', {
            participationIdeas: result.participationIdeas.length,
            participationPosts: result.participationPosts.length,
            supportIdeas: result.supportIdeas.length,
            supportPosts: result.supportPosts.length
          });
        } else {
          console.warn('⚠️ [MyIdeasPageWrapper] Aucune contribution retournée');
        }
      } catch (error) {
        console.error('❌ [MyIdeasPageWrapper] Erreur lors du chargement des contributions:', error);
      }
    };
    
    loadContributions();
  }, []); // Pas de dépendances pour ne charger qu'une fois

  return (
    <MyIdeasPage
      onIdeaClick={navigation.goToIdea}
      onPostClick={navigation.goToPost}
      onLike={actions.togglePostLike}
      onSupport={actions.toggleIdeaSupport}
      onIgnoreIdea={actions.ignoreIdea}
      onReportIdea={actions.reportIdea}
      onIgnorePost={actions.ignorePost}
      onReportPost={actions.reportPost}
      onCreateContent={navigation.goToCreateIdea}
    />
  );
}
