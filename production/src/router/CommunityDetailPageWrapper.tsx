import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { CommunityDetailPage } from '../components/CommunityDetailPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

/**
 * CommunityDetailPageWrapper
 * Wrapper pour CommunityDetailPage qui utilise useParams() pour récupérer l'ID depuis l'URL
 * et met à jour le store pour que CommunityDetailPage fonctionne correctement
 * 
 * Note: CommunityDetailPage utilise getSelectedCommunity() qui lit store.selectedCommunityId
 * Ce wrapper met à jour ce state pour assurer la compatibilité
 */
export function CommunityDetailPageWrapper() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();
  const { actions } = useEntityStoreSimple();

  // Mettre à jour selectedCommunityId dans le store
  useEffect(() => {
    if (!communityId) {
      navigate('/communities');
      return;
    }

    // Mettre à jour le store pour que CommunityDetailPage puisse fonctionner
    actions.setSelectedCommunityId(communityId);
  }, [communityId, navigate, actions]);

  // Si pas de communityId, ne rien afficher (la redirection se fera dans useEffect)
  if (!communityId) {
    return null;
  }

  // Handler pour retourner à la liste des communautés
  const handleBack = () => {
    navigate('/communities');
  };

  return <CommunityDetailPage onBack={handleBack} />;
}
