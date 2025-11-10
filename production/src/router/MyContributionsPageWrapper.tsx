import { useNavigate } from 'react-router-dom';
import { MyContributionsPage } from '../components/MyContributionsPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

export function MyContributionsPageWrapper() {
  const navigate = useNavigate();
  const { actions } = useEntityStoreSimple();

  const handleIdeaClick = (ideaId: string) => {
    navigate(`/content/ideas/${ideaId}`);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/content/posts/${postId}`);
  };

  const handleGroupClick = (groupId: string) => {
    navigate(`/groups/${groupId}`);
  };

  const handleLike = async (postId: string) => {
    await actions.togglePostSupport(postId);
  };

  const handleSupport = async (ideaId: string) => {
    await actions.toggleIdeaSupport(ideaId);
  };

  const handleIgnoreIdea = async (ideaId: string) => {
    console.log('Ignorer idée:', ideaId);
    // TODO: Implémenter la logique d'ignorance
  };

  const handleReportIdea = async (ideaId: string) => {
    console.log('Signaler idée:', ideaId);
    // TODO: Implémenter la logique de signalement
  };

  const handleIgnorePost = async (postId: string) => {
    console.log('Ignorer post:', postId);
    // TODO: Implémenter la logique d'ignorance
  };

  const handleReportPost = async (postId: string) => {
    console.log('Signaler post:', postId);
    // TODO: Implémenter la logique de signalement
  };

  const handleCreateContent = () => {
    navigate('/create-idea');
  };

  return (
    <MyContributionsPage
      onIdeaClick={handleIdeaClick}
      onPostClick={handlePostClick}
      onGroupClick={handleGroupClick}
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