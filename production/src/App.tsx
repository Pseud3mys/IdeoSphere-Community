import { SimpleEntityStoreProvider } from './store/SimpleEntityStore';
import { useEntityStoreSimple } from './hooks/useEntityStoreSimple';
import { useAuthHandlers } from './hooks/useAuthHandlers';
import { URLStateSync } from './components/URLStateSync';
import { Navigation } from './components/Navigation';
import { AppHeader } from './components/AppHeader';
import { AppContent } from './components/AppContent';
import { Footer } from './components/Footer';

import { FAQPage } from './components/FAQPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsPage } from './components/TermsPage';
import { OnboardingTour } from './components/OnboardingTour';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from 'react-error-boundary';

// Composant d'erreur pour l'error boundary
function ErrorFallback({error, resetErrorBoundary}: {error: Error, resetErrorBoundary: () => void}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold mb-2">Oups ! Une erreur est survenue</h2>
        <p className="text-gray-600 mb-4">
          L'application a rencontré un problème. Essayez de recharger la page.
        </p>
        <button 
          onClick={resetErrorBoundary}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
        >
          Réessayer
        </button>
        <details className="mt-4 text-left">
          <summary className="cursor-pointer text-sm text-gray-500">
            Détails de l'erreur
          </summary>
          <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded">
            {error.message}
          </pre>
        </details>
      </div>
    </div>
  );
}

// Component principal avec le store
function AppWithStore() {
  // Hook simplifié avec Entity Store
  const {
    store,
    actions,
    getCurrentUser,
    getAllIdeas,
    getAllPosts,
    getAllDiscussionTopics,
    getSelectedIdea,
    getSelectedPost
  } = useEntityStoreSimple();

  // Récupérer l'utilisateur actuel
  const currentUserData = getCurrentUser();
  
  // Le store est maintenant toujours initialisé avec un utilisateur par défaut

  // Handler spécial pour naviguer vers les contributions
  const handleMyContributionsClick = () => {
    // Utiliser la fonction fetchMyContributions qui passe par le store
    actions.fetchMyContributions();
  };
  
  // Handler spécial pour naviguer vers le feed de discovery
  const handleDiscoveryClick = () => {
    // Utiliser la fonction fetchFeed qui passe par le store
    actions.fetchFeed();
  };

  // Handler spécial pour les statistiques d'accueil
  const handleHomePageStatsClick = () => {
    // Utiliser la fonction fetchHomePageStats qui est la première appelée
    actions.fetchHomePageStats();
  };

  // Handlers d'authentification - approche simplifiée et sécurisée
  const {
    handleLogin,
    handleSocialLogin,
    handleSignup,
    handleNewsletterSubscribe
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
      actions.enterPlatform();
      // La redirection se fait automatiquement selon le statut de l'utilisateur
    },
    actions.switchToUserByEmail,
    actions.checkEmailExists,
    actions.loginWithSocialProvider,
    actions.signupUser,
    actions.subscribeToNewsletter
  );
  
  // Handlers simplifiés utilisant les actions du store
  const handleProfileClick = () => actions.fetchMyProfile();
  const handleHomeClick = () => {
    // Utiliser la fonction fetchFeed pour aller à l'accueil (discovery)
    handleDiscoveryClick();
  };
  const handleHelpClick = () => actions.showOnboarding();
  const handleOnboardingComplete = () => actions.hideOnboarding();
  
  // Handler personnalisé pour la navigation qui gère spécialement les contributions et le feed
  const handleTabChange = (tab: typeof store.activeTab) => {
    if (tab === 'my-ideas') {
      handleMyContributionsClick();
    } else if (tab === 'discovery') {
      handleDiscoveryClick();
    } else {
      actions.goToTab(tab);
    }
  };

  // Handler pour la navigation du footer
  const handleFooterNavigation = (page: string) => {
    const pageMap: Record<string, typeof store.activeTab> = {
      'about': 'about',
      'how-it-works': 'how-it-works',
      'faq': 'faq',
      'privacy': 'privacy',
      'terms': 'terms'
    };
    
    const tabType = pageMap[page];
    if (tabType) {
      actions.goToTab(tabType);
    }
  };

  // Handler pour revenir à la page d'accueil depuis les pages du footer
  const handleNavigateBackToWelcome = () => {
    actions.goToTab('welcome');
  };

  // Si on est sur une page du footer
  const footerPages = ['about', 'how-it-works', 'faq', 'privacy', 'terms'];
  if (footerPages.includes(store.activeTab)) {
    let PageComponent;
    switch (store.activeTab) {
      case 'about': {
        const { AboutPage } = require('./components/AboutPage');
        PageComponent = () => <AboutPage onNavigateBack={handleNavigateBackToWelcome} />;
        break;
      }
      case 'how-it-works': {
        const { HowItWorksPage } = require('./components/HowItWorksPage');
        PageComponent = () => <HowItWorksPage onNavigateBack={handleNavigateBackToWelcome} />;
        break;
      }
      case 'faq':
        PageComponent = () => <FAQPage onNavigateBack={handleNavigateBackToWelcome} />;
        break;
      case 'privacy':
        PageComponent = () => <PrivacyPolicyPage onNavigateBack={handleNavigateBackToWelcome} />;
        break;
      case 'terms':
        PageComponent = () => <TermsPage onNavigateBack={handleNavigateBackToWelcome} />;
        break;
      default:
        PageComponent = () => <div>Page non trouvée</div>;
    }

    return (
      <div className="min-h-screen">
        <URLStateSync />
        <PageComponent />
        <Toaster position="bottom-right" />
      </div>
    );
  }

  // Si on est sur la page d'accueil, ne pas afficher le header et la navigation
  if (store.activeTab === 'welcome' && !store.hasEnteredPlatform) {
    return (
      <div className="min-h-screen flex flex-col">
        <URLStateSync />
        <main className="flex-1">
          <AppContent 
            onLogin={handleLogin}
            onSocialLogin={handleSocialLogin}
            onSignup={handleSignup}
            onNewsletterSubscribe={handleNewsletterSubscribe}
          />
        </main>
        <Footer onNavigate={handleFooterNavigation} />
        <Toaster position="bottom-right" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <URLStateSync />
      
      {store.activeTab !== 'signup' && (
        <AppHeader
          currentUserData={currentUserData}
          onHomeClick={handleHomeClick}
          onProfileClick={handleProfileClick}
          onHelpClick={handleHelpClick}
        />
      )}

      {store.activeTab !== 'idea-detail' && store.activeTab !== 'post-detail' && store.activeTab !== 'profile' && store.activeTab !== 'community-detail' && store.activeTab !== 'signup' && (
        <Navigation activeTab={store.activeTab} onTabChange={handleTabChange} />
      )}

      <main className="min-h-screen pb-20 sm:pb-0">
        <AppContent 
          onLogin={handleLogin}
          onSocialLogin={handleSocialLogin}
          onSignup={handleSignup}
          onNewsletterSubscribe={handleNewsletterSubscribe}
        />
      </main>

      {/* Tour d'onboarding */}
      <OnboardingTour 
        isVisible={store.showOnboarding}
        onClose={() => actions.hideOnboarding()}
        onComplete={handleOnboardingComplete}
      />

      <Toaster position="bottom-right" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('❌ Erreur capturée par ErrorBoundary:', error, errorInfo);
      }}
      onReset={() => {
        // Recharger la page en cas de reset
        window.location.reload();
      }}
    >
      <SimpleEntityStoreProvider>
        <AppWithStore />
      </SimpleEntityStoreProvider>
    </ErrorBoundary>
  );
}