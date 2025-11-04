import { useNavigate } from 'react-router-dom';
import { CitizenWelcome } from '../components/CitizenWelcome';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useAuthHandlers } from '../hooks/useAuthHandlers';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { toast } from 'sonner@2.0.3';

/**
 * CitizenWelcomeWrapper
 * Wrapper pour CitizenWelcome qui connecte tous les handlers d'authentification
 * et de navigation avec React Router
 */
export function CitizenWelcomeWrapper() {
  const navigate = useNavigate();
  const { actions } = useEntityStoreSimple();
  const navigation = useNavigationActions();

  // Handlers d'authentification
  const {
    handleLogin,
    handleSocialLogin,
    handleSignup,
    handleNewsletterSubscribe,
    handleLoginSSO,
    handleRegisterSSO
  } = useAuthHandlers(
    (userData) => {
      // Vérifier si l'utilisateur existe déjà dans le store local
      const existingUser = actions.switchToUserByEmail(userData.email);
      if (existingUser) {
        return;
      }
      
      // Ajouter l'utilisateur au store local puis basculer vers lui
      actions.addUserAndSetAsCurrent(userData);
    },
    () => {
      // Après connexion réussie, rediriger vers /discovery
      navigate('/discovery');
    },
    actions.switchToUserByEmail,
    actions.checkEmailExists,
    actions.loginWithSocialProvider,
    actions.signupUser,
    actions.subscribeToNewsletter,
    actions.loginWithSSO,
    actions.registerWithSSO
  );

  // Handler pour entrer sur la plateforme (après connexion ou en mode exploration)
  const handleEnterPlatform = async () => {
    try {
      // Créer un compte invité via l'API
      console.log('🔄 [CitizenWelcomeWrapper] Création d\'un compte invité via l\'API...');
      const guestUser = await actions.createTemporaryGuest();
      
      if (guestUser) {
        console.log('✅ [CitizenWelcomeWrapper] Compte invité créé avec succès via l\'API !');
        console.log('   - ID:', guestUser.id);
        console.log('   - Nom:', guestUser.name);
        console.log('   - Email:', guestUser.email);
        console.log('   - isRegistered:', guestUser.isRegistered);
        
        toast.success(`Bienvenue ${guestUser.name} !`, {
          description: 'Compte invité créé - Vous pouvez explorer IdeoSphere'
        });
        
        actions.enterPlatform();
        navigate('/discovery');
      } else {
        console.error('❌ [CitizenWelcomeWrapper] Impossible de créer le compte invité');
        toast.error('Erreur lors de la création du compte invité');
      }
    } catch (error) {
      console.error('❌ [CitizenWelcomeWrapper] Erreur handleEnterPlatform:', error);
      toast.error('Une erreur est survenue');
    }
  };

  // Handler pour entrer avec un utilisateur temporaire (alias)
  const handleEnterPlatformWithTempUser = async () => {
    await handleEnterPlatform();
  };

  // Handler pour naviguer vers la création d'idée
  const handleNavigateToCreateIdea = () => {
    navigation.goToCreateIdea();
  };

  // Handler pour naviguer vers "Comment ça marche"
  const handleNavigateToHowItWorks = () => {
    navigate('/how-it-works');
  };

  return (
    <CitizenWelcome
      onEnterPlatform={handleEnterPlatform}
      onEnterPlatformWithTempUser={handleEnterPlatformWithTempUser}
      onNavigateToCreateIdea={handleNavigateToCreateIdea}
      onNavigateToHowItWorks={handleNavigateToHowItWorks}
      onLogin={handleLogin}
      onSocialLogin={handleSocialLogin}
      onSignup={handleSignup}
      onNewsletterSubscribe={handleNewsletterSubscribe}
      onLoginSSO={handleLoginSSO}
      onRegisterSSO={handleRegisterSSO}
      cityName="Le Blanc"
    />
  );
}
