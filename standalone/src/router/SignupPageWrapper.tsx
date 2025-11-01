import { useNavigate } from 'react-router-dom';
import { SignupPage } from '../components/auth/SignupPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useAuthHandlers } from '../hooks/useAuthHandlers';

/**
 * SignupPageWrapper
 * Wrapper pour SignupPage qui connecte tous les handlers d'authentification
 * et de navigation avec React Router
 */
export function SignupPageWrapper() {
  const navigate = useNavigate();
  const { actions } = useEntityStoreSimple();

  // Handlers d'authentification
  const {
    handleSignup,
    handleSocialLogin,
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
      // Après inscription réussie, rediriger vers /discovery
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

  // Handler pour retourner à la page d'accueil
  const handleBack = () => {
    navigate('/');
  };

  return (
    <SignupPage
      onBack={handleBack}
      onSignup={handleSignup}
      onSocialLogin={handleSocialLogin}
      onLoginSSO={handleLoginSSO}
      onRegisterSSO={handleRegisterSSO}
    />
  );
}
