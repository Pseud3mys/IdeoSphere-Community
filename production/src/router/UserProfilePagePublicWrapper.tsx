import { useParams, useNavigate } from 'react-router-dom';
import { UserProfilePagePublic } from '../components/UserProfilePagePublic';

/**
 * UserProfilePagePublicWrapper
 * Wrapper pour UserProfilePagePublic qui utilise useParams() pour récupérer l'ID depuis l'URL
 */
export function UserProfilePagePublicWrapper() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // Si pas d'userId, rediriger vers discovery
  if (!userId) {
    navigate('/discovery');
    return null;
  }

  // Handler pour retourner en arrière
  const handleBack = () => {
    navigate(-1);
  };

  return <UserProfilePagePublic userId={userId} onBack={handleBack} />;
}
