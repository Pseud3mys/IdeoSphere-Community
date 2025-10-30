import { MyIdeasPage } from '../components/MyIdeasPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';

/**
 * MyIdeasPageWrapper
 * Wrapper pour MyIdeasPage qui connecte tous les handlers depuis le store
 * Utilise useNavigationActions pour la navigation avec React Router
 */
export function MyIdeasPageWrapper() {
  const { actions } = useEntityStoreSimple();
  const navigation = useNavigationActions();

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
