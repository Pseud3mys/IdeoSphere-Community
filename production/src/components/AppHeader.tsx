import { useState } from 'react';
import { User } from '../types';
import logoImage from '../assets/logo.png';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { LoginDialog } from './auth/LoginDialog';
import { LogIn } from 'lucide-react';

interface AppHeaderProps {
  currentUserData: User | null;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onHelpClick: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSocialLogin: (provider: string) => Promise<boolean>;
}

export function AppHeader({ currentUserData, onHomeClick, onProfileClick, onHelpClick, onLogin, onSocialLogin }: AppHeaderProps) {
  const { actions } = useEntityStoreSimple();
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  
  // Vérifier si l'utilisateur est en mode visiteur
  const isGuest = !currentUserData || !currentUserData.isRegistered;
  
  const handleLoginSuccess = async (email: string, password: string) => {
    const success = await onLogin(email, password);
    if (success) {
      setShowLoginDialog(false);
    }
    return success;
  };
  
  const handleSocialLoginSuccess = async (provider: string) => {
    const success = await onSocialLogin(provider);
    if (success) {
      setShowLoginDialog(false);
    }
    return success;
  };
  
  return (
    <>
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
                  <h1 className="text-xl text-gray-900">IdeoSphere</h1>
                  <p className="text-sm text-muted-foreground">
                    Votre communauté d'idées
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">

              {/* Bouton d'aide */}
              <button
                onClick={onHelpClick}
                className="w-10 h-10 sm:w-8 sm:h-8 bg-primary/10 hover:bg-primary/20 rounded-full flex items-center justify-center text-primary transition-colors text-sm"
                title="Aide et visite guidée"
              >
                ?
              </button>
              
              {/* Bouton de connexion pour les visiteurs */}
              {isGuest && (
                <button
                  onClick={() => setShowLoginDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  title="Se connecter"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Se connecter</span>
                </button>
              )}
              
              {/* Profil utilisateur (connecté) */}
              {!isGuest && (
                <>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-gray-900">{currentUserData?.name || 'Utilisateur'}</div>
                    <div className="text-xs text-muted-foreground">
                      {currentUserData?.location || 'Membre actif'}
                    </div>
                  </div>
                  <div 
                    className="w-12 h-12 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shadow-sm"
                    onClick={onProfileClick}
                  >
                    {currentUserData?.name?.slice(0, 2) || 'U'}
                  </div>
                </>
              )}
              
              {/* Indicateur visiteur */}
              {isGuest && (
                <div className="flex items-center gap-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm text-gray-600">Visiteur</div>
                    <div className="text-xs text-muted-foreground">Mode consultation</div>
                  </div>
                  <div 
                    className="w-12 h-12 sm:w-10 sm:h-10 bg-gray-400 rounded-full flex items-center justify-center text-white"
                    title="Visiteur"
                  >
                    ?
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Dialog de connexion */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={handleLoginSuccess}
        onSocialLogin={handleSocialLoginSuccess}
      />
    </>
  );
}
