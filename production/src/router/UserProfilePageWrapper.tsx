import { useNavigate } from 'react-router-dom';
import { UserProfilePage } from '../components/UserProfilePage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useAuth } from '../context/authContext';

/**
 * UserProfilePageWrapper
 * Wrapper pour UserProfilePage (profil de l'utilisateur courant)
 * Récupère l'utilisateur courant depuis le store et connecte les handlers
 */
export function UserProfilePageWrapper() {
  const navigate = useNavigate();
  const { getCurrentUser, actions } = useEntityStoreSimple();
  const { isLoading: authLoading } = useAuth();
  
  const currentUser = getCurrentUser();

  // Afficher un loader pendant le chargement de l'auth
  if (authLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-500">Chargement du profil...</p>
      </div>
    );
  }

  // Si pas d'utilisateur connecté, rediriger vers l'accueil
  if (!currentUser) {
    navigate('/');
    return null;
  }

  // Handler pour retourner en arrière
  const handleBack = () => {
    navigate(-1);
  };

  // Handler pour mettre à jour le profil
  const handleUpdateProfile = (updates: Partial<typeof currentUser>) => {
    actions.updateCurrentUser(updates);
  };

  return (
    <UserProfilePage
      user={currentUser}
      isOwnProfile={true}
      onUpdateProfile={handleUpdateProfile}
      onBack={handleBack}
    />
  );
}