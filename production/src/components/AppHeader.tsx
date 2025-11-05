import { User } from '../types';
import logoImage from '../assets/logo.png';
import { AuthButtons } from './AuthButtons';
import { clientConfig } from '../config/clientConfig';

interface AppHeaderProps {
  currentUserData: User | null;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onHelpClick: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSocialLogin: (provider: string) => Promise<boolean>;
}

export function AppHeader({ currentUserData, onHomeClick, onProfileClick, onHelpClick, onLogin, onSocialLogin }: AppHeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="cursor-pointer"
            onClick={onHomeClick}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={logoImage} alt="IdeoSphere Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl text-gray-900">{clientConfig.identity.appName}</h1>
                <p className="text-sm text-muted-foreground">
                  {clientConfig.identity.appTagline}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Bouton d'aide */}
            <button
              onClick={onHelpClick}
              className="w-10 h-10 sm:w-8 sm:h-8 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center text-primary transition-colors text-sm"
              title={clientConfig.navigation.helpButton.title}
            >
              {clientConfig.navigation.helpButton.icon}
            </button>
            
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
