import { Outlet, useNavigate } from 'react-router-dom';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useAuthHandlers } from '../hooks/useAuthHandlers';
import { AppHeader } from './AppHeader';
import { Navigation } from './Navigation';
import { OnboardingTour } from './OnboardingTour';
import { Toaster } from './ui/sonner';

/**
 * AppLayout
 * Layout principal pour les pages protégées (utilisateur authentifié)
 * Contient le header, la navigation et le contenu principal
 */
export function AppLayout() {
  const navigate = useNavigate();
  const { store, actions, getCurrentUser } = useEntityStoreSimple();
  const currentUserData = getCurrentUser();

  // Créer les handlers d'authentification
  const authHandlers = useAuthHandlers(
    (user) => {
      actions.addUser(user);
      actions.setCurrentUserId(user.id);
    },
    () => {
      // handleEnterPlatform - navigation vers la page discovery
      navigate('/discovery');
    },
    (email) => {
      // switchToUserByEmail
      const allUsers = Object.values(store.users);
      const user = allUsers.find(u => u.email === email);
      if (user) {
        actions.setCurrentUserId(user.id);
        return user;
      }
      return null;
    },
    actions.checkEmailExists,
    actions.loginWithSocialProvider,
    actions.signupUser,
    actions.subscribeToNewsletter
  );

  // Handlers pour le header
  const handleHomeClick = () => {
    navigate('/discovery');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleHelpClick = () => {
    actions.showOnboarding();
  };

  const handleOnboardingComplete = () => {
    actions.hideOnboarding();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de l'application */}
      <AppHeader
        currentUserData={currentUserData}
        onHomeClick={handleHomeClick}
        onProfileClick={handleProfileClick}
        onHelpClick={handleHelpClick}
        onLogin={authHandlers.handleLogin}
        onSocialLogin={authHandlers.handleSocialLogin}
      />

      {/* Navigation principale */}
      <Navigation />

      {/* Contenu principal (rendu par React Router) */}
      <main className="min-h-screen pb-20 sm:pb-0">
        <Outlet />
      </main>

      {/* Tour d'onboarding */}
      <OnboardingTour 
        isVisible={store.showOnboarding}
        onClose={handleOnboardingComplete}
        onComplete={handleOnboardingComplete}
      />

      {/* Notifications toast */}
      <Toaster position="bottom-right" />
    </div>
  );
}
