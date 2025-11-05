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
  
  // Groupes pré-remplis depuis la navigation (ex: depuis GroupHubPage) OU depuis le store (héritage)
  const navigationGroupIds = location.state?.prefilledGroupIds;
  const storeGroupIds = store.prefilledGroupIds;
  const prefilledGroupIds = navigationGroupIds || (storeGroupIds.length > 0 ? storeGroupIds : undefined);
  
  // Mode de création pré-rempli (ex: 'idea' depuis le bouton "Projet" du groupe)
  const prefilledCreationMode = location.state?.creationMode as 'post' | 'idea' | undefined;

  return (
    <CreateIdeaPage
      sourcePost={sourcePost}
      prefilledSourceIdea={store.prefilledSourceIdea}
      prefilledLinkedContent={store.prefilledLinkedContent?.map(content => content.id) || []}
      prefilledSelectedDiscussions={store.prefilledSelectedDiscussions}
      prefilledGroupIds={prefilledGroupIds}
      prefilledCreationMode={prefilledCreationMode}
      onClearPrefilled={actions.clearPrefill}
    />
  );
}
