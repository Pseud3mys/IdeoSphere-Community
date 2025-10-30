import { DiscoveryPage } from '../components/DiscoveryPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';

/**
 * DiscoveryPageWrapper
 * Wrapper pour DiscoveryPage qui connecte tous les handlers depuis le store
 * Utilise useNavigationActions pour la navigation avec React Router
 */
export function DiscoveryPageWrapper() {
  const { actions } = useEntityStoreSimple();
  const navigation = useNavigationActions();

  return (
    <DiscoveryPage
      onIdeaClick={navigation.goToIdea}
      onPostClick={navigation.goToPost}
      onLike={actions.togglePostLike}
      onSupport={actions.toggleIdeaSupport}
      onPromoteToIdea={actions.promotePostToIdea}
      onCreateContent={navigation.goToCreateIdea}
      onIgnoreIdea={actions.ignoreIdea}
      onReportIdea={actions.reportIdea}
      onIgnorePost={actions.ignorePost}
      onReportPost={actions.reportPost}
    />
  );
}
