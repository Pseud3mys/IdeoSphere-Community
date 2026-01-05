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

  // ✨ FUSION: Combiner tous les contenus pré-remplis dans un seul array
  const allPrefilledParentIds = new Set<string>();
  
  // Ajouter l'idée source
  if (store.prefilledSourceIdea) {
    allPrefilledParentIds.add(store.prefilledSourceIdea);
  }
  
  // Ajouter les contenus liés
  if (store.prefilledLinkedContent) {
    store.prefilledLinkedContent.forEach(content => allPrefilledParentIds.add(content.id));
  }
  
  // Ajouter les discussions sélectionnées
  if (store.prefilledSelectedDiscussions) {
    store.prefilledSelectedDiscussions.forEach(id => allPrefilledParentIds.add(id));
  }
  
  // Ajouter les IDs déjà dans prefilledSelectedParentIds
  if (store.prefilledSelectedParentIds) {
    store.prefilledSelectedParentIds.forEach(id => allPrefilledParentIds.add(id));
  }
  
  const prefilledParentIds = Array.from(allPrefilledParentIds);
  console.log('🔄 [CreateIdeaPageWrapper] Fusion des contenus pré-remplis:', prefilledParentIds);

  return (
    <CreateIdeaPage
      sourcePost={sourcePost}
      prefilledParentIds={prefilledParentIds}
      prefilledGroupIds={prefilledGroupIds}
      prefilledCreationMode={prefilledCreationMode}
      onClearPrefilled={actions.clearPrefill}
    />
  );
}
