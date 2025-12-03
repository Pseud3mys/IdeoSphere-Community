import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserProfilePagePublic } from '../components/UserProfilePagePublic';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

/**
 * UserProfilePagePublicWrapper
 * Wrapper pour UserProfilePagePublic qui utilise useParams() pour récupérer l'ID depuis l'URL
 * Charge l'utilisateur depuis l'API s'il n'est pas dans le store
 */
export function UserProfilePagePublicWrapper() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { getUserById, actions } = useEntityStoreSimple();
  const [isLoading, setIsLoading] = useState(true);

  // Si pas d'userId, rediriger vers discovery
  if (!userId) {
    navigate('/discovery');
    return null;
  }

  // Charger l'utilisateur au montage
  useEffect(() => {
    const loadUser = async () => {
      console.log('🔄 [UserProfilePagePublicWrapper] Chargement utilisateur:', userId);
      setIsLoading(true);
      
      try {
        // Vérifier si l'utilisateur est déjà dans le store
        const user = getUserById(userId);
        
        if (user && user.id !== 'unknown') {
          console.log('✅ [UserProfilePagePublicWrapper] Utilisateur déjà dans le store:', user.name);
          setIsLoading(false);
          return;
        }
        
        // Charger depuis l'API
        console.log('🌐 [UserProfilePagePublicWrapper] Chargement depuis l\'API...');
        const { getUserById: getUserByIdFromApi } = await import('../api/dataService');
        const apiUser = await getUserByIdFromApi(userId);
        
        if (apiUser) {
          actions.addUser(apiUser);
          console.log('✅ [UserProfilePagePublicWrapper] Utilisateur ajouté au store:', apiUser.name);
        } else {
          console.warn('⚠️ [UserProfilePagePublicWrapper] Utilisateur non trouvé dans l\'API');
        }
      } catch (error) {
        console.error('❌ [UserProfilePagePublicWrapper] Erreur lors du chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, [userId, getUserById, actions]);

  // Handler pour retourner en arrière
  const handleBack = () => {
    navigate(-1);
  };

  // Afficher un loader pendant le chargement
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="text-center py-12">
          <p className="text-gray-500">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return <UserProfilePagePublic userId={userId} onBack={handleBack} />;
}
