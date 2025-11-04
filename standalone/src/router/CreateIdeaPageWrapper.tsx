import { CreateIdeaPage } from '../components/CreateIdeaPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useLocation } from 'react-router-dom';

/**
 * CreateIdeaPageWrapper
 * Wrapper pour CreateIdeaPage qui connecte les données préremplies depuis le store
 * et depuis le state de navigation React Router
 */
export function CreateIdeaPageWrapper() {
  const { store, getAllPosts, actions } = useEntityStoreSimple();
  const location = useLocation();
  
  const posts = getAllPosts();
  
  // Priorité 1: Post depuis le state de navigation (promotePostToIdea)
  const navigationSourcePost = location.state?.sourcePost;
  
  // Priorité 2: Post depuis le store (ancien système)
  const storeSourcePost = store.prefilledSourcePostId 
    ? posts.find(p => p.id === store.prefilledSourcePostId) 
    : undefined;
  
  const sourcePost = navigationSourcePost || storeSourcePost;

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
