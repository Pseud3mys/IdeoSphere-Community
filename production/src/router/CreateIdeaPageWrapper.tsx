import { CreateIdeaPage } from '../components/CreateIdeaPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

/**
 * CreateIdeaPageWrapper
 * Wrapper pour CreateIdeaPage qui connecte les données préremplies depuis le store
 */
export function CreateIdeaPageWrapper() {
  const { store, getAllPosts, actions } = useEntityStoreSimple();
  
  const posts = getAllPosts();
  const sourcePost = store.prefilledSourcePostId 
    ? posts.find(p => p.id === store.prefilledSourcePostId) 
    : undefined;

  return (
    <CreateIdeaPage
      sourcePost={sourcePost}
      prefilledSourceIdea={store.prefilledSourceIdea}
      prefilledLinkedContent={store.prefilledLinkedContent?.map(content => content.id) || []}
      prefilledSelectedDiscussions={store.prefilledSelectedDiscussions}
      onClearPrefilled={actions.clearPrefill}
    />
  );
}
