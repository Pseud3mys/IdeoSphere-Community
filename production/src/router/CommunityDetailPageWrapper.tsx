import { useParams, useNavigate } from 'react-router-dom';
import { CommunityDetailPage } from '../components/CommunityDetailPage';

/**
 * CommunityDetailPageWrapper
 * Wrapper pour CommunityDetailPage qui utilise useParams() pour récupérer l'ID depuis l'URL
 * et le passe directement en prop au composant
 * 
 * Phase 6 : Plus besoin de store.selectedCommunityId - l'ID est passé directement via props
 */
export function CommunityDetailPageWrapper() {
  const { communityId } = useParams<{ communityId: string }>();
  const navigate = useNavigate();

  // Si pas de communityId, rediriger
  if (!communityId) {
    navigate('/communities');
    return null;
  }

  // Handler pour retourner à la liste des communautés
  const handleBack = () => {
    navigate('/communities');
  };

  return <CommunityDetailPage communityId={communityId} onBack={handleBack} />;
}
