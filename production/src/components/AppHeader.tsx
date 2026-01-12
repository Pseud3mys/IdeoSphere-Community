import { User } from '../types';
import logoImage from '../assets/logo.png';
import { AuthButtons } from './AuthButtons';
import { clientConfig } from '../config/clientConfig';
import { Button } from './ui/button';

interface AppHeaderProps {
  currentUserData: User | null;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onHelpClick?: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSocialLogin: (provider: string) => Promise<boolean>;
  onNavigateToHowItWorks?: () => void;
  isWelcomePage?: boolean;
}

export function AppHeader({ 
  currentUserData, 
  onHomeClick, 
  onProfileClick, 
  onHelpClick, 
  onLogin, 
  onSocialLogin,
  onNavigateToHowItWorks,
  isWelcomePage = false
}: AppHeaderProps) {
  return (
    <header className={`border-b ${isWelcomePage ? 'border-gray-100' : 'border-gray-200'} bg-white sticky top-0 z-50 shadow-sm`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <div 
            className="cursor-pointer min-w-0 flex-1"
            onClick={onHomeClick}
          >
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center flex-shrink-0">
                <img src={logoImage} alt="IdeoSphere Logo" className="w-full h-full object-contain" />
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl text-gray-900 truncate">{clientConfig.identity.appName}</h1>
                {isWelcomePage && (
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    {clientConfig.identity.appTagline}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            {/* Bouton "Comment ça marche" pour la page welcome */}
            {isWelcomePage && onNavigateToHowItWorks && (
              <Button 
                variant="ghost" 
                onClick={onNavigateToHowItWorks}
                className="hidden sm:flex text-muted-foreground hover:text-gray-900 text-sm sm:text-base px-2 sm:px-4 whitespace-nowrap"
              >
                {clientConfig.navigation.howItWorksButton}
              </Button>
            )}
            
            {/* Bouton d'aide pour les pages internes */}
            {!isWelcomePage && onHelpClick && (
              <button
                onClick={onHelpClick}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center text-primary transition-colors text-sm sm:text-base"
                title={clientConfig.navigation.helpButton.title}
              >
                {clientConfig.navigation.helpButton.icon}
              </button>
            )}
            
            {/* Composant réutilisable pour l'authentification */}
            <AuthButtons
              currentUser={currentUserData}
              onLogin={onLogin}
              onSocialLogin={onSocialLogin}
              onProfileClick={onProfileClick}
              compact={true}
            />
          </div>
        </div>
      </div>
    </header>
  );
}