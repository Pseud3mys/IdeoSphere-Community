import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { MyContributionsPage } from '../components/MyContributionsPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';

export function MyContributionsPageWrapper() {
  const navigate = useNavigate();
  const { actions, getCurrentUser } = useEntityStoreSimple();
  const navigation = useNavigationActions();
  
  const currentUser = getCurrentUser();

  // Charger les contributions au montage
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        console.log('⏸️ [MyContributionsPageWrapper] Utilisateur non connecté, chargement différé');
        return;
      }
      
      console.log('🔄 [MyContributionsPageWrapper] Chargement des contributions...');
      
      try {
        // Appeler fetchMyContributions depuis apiActions qui utilise fetchUserContributionsFromApi
        await actions.fetchMyContributions(false);
        console.log('✅ [MyContributionsPageWrapper] Contributions chargées');
      } catch (error) {
        console.error('❌ [MyContributionsPageWrapper] Erreur lors du chargement:', error);
      }
    };
    
    loadData();
  }, [currentUser?.id, actions]); // Recharger si l'utilisateur change

  // Utiliser les fonctions de navigation qui gèrent déjà les préfixes correctement

  const handleLike = async (postId: string) => {
    await actions.togglePostLike(postId);
  };

  const handleSupport = async (ideaId: string) => {
    await actions.toggleIdeaSupport(ideaId);
  };

  const handleIgnoreIdea = async (ideaId: string) => {
    await actions.ignoreIdea(ideaId);
  };

  const handleReportIdea = async (ideaId: string) => {
    await actions.reportIdea(ideaId);
  };

  const handleIgnorePost = async (postId: string) => {
    await actions.ignorePost(postId);
  };

  const handleReportPost = async (postId: string) => {
    await actions.reportPost(postId);
  };

  const handleCreateContent = () => {
    navigate('/create-idea');
  };

  return (
    <MyContributionsPage
      onIdeaClick={navigation.goToIdea}
      onPostClick={navigation.goToPost}
      onGroupClick={navigation.goToGroup}
      onLike={handleLike}
      onSupport={handleSupport}
      onIgnoreIdea={handleIgnoreIdea}
      onReportIdea={handleReportIdea}
      onIgnorePost={handleIgnorePost}
      onReportPost={handleReportPost}
      onCreateContent={handleCreateContent}
    />
  );
}