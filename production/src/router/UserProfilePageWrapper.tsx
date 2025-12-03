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
  const { actions, store } = useEntityStoreSimple();
  const { isLoading: authLoading } = useAuth();
  
  // Récupérer l'utilisateur courant directement depuis le store pour que le composant se re-rende quand il change
  const currentUser = store.currentUserId ? store.users[store.currentUserId] : null;

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