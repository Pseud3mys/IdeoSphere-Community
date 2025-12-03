import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserProfilePagePublic } from '../components/UserProfilePagePublic';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

/**
 * UserProfilePagePublicWrapper
 * Wrapper pour UserProfilePagePublic qui utilise useParams() pour récupérer l'ID depuis l'URL
 * Charge le profil COMPLET de l'utilisateur depuis l'API
 */
export function UserProfilePagePublicWrapper() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { getUserById, apiActions } = useEntityStoreSimple();
  const [isLoading, setIsLoading] = useState(true);

  // Si pas d'userId, rediriger vers discovery
  if (!userId) {
    navigate('/discovery');
    return null;
  }

  // Charger le profil complet de l'utilisateur au montage
  useEffect(() => {
    const loadUser = async () => {
      console.log('🔄 [UserProfilePagePublicWrapper] Chargement profil utilisateur:', userId);
      setIsLoading(true);
      
      try {
        // Vérifier si l'utilisateur est déjà dans le store avec des données complètes
        const user = getUserById(userId);
        
        // Si l'utilisateur existe dans le store ET a des données complètes (bio définie ou location),
        // on peut éviter de recharger depuis l'API
        const hasCompleteProfile = user && user.id !== 'unknown' && (user.bio !== undefined || user.location !== undefined);
        
        if (hasCompleteProfile) {
          console.log('✅ [UserProfilePagePublicWrapper] Profil complet déjà dans le store:', user.name);
          setIsLoading(false);
          return;
        }
        
        // Sinon, charger le profil complet depuis l'API
        // Les feeds ne renvoient que des objets User minimalistes (sans bio, location, etc.)
        console.log('🌐 [UserProfilePagePublicWrapper] Chargement du profil complet depuis l\'API...');
        const success = await apiActions.loadUserProfile(userId);
        
        if (!success) {
          console.warn('⚠️ [UserProfilePagePublicWrapper] Échec du chargement du profil');
        }
      } catch (error) {
        console.error('❌ [UserProfilePagePublicWrapper] Erreur lors du chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, [userId, getUserById, apiActions]);

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
