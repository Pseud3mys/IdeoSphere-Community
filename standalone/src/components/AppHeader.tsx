import { User } from '../types';
import logoImage from 'figma:asset/f40f0fed92c1933fc6e0d4bd7aad22c5b11f342d.png';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

interface AppHeaderProps {
  currentUserData: User;
  onHomeClick: () => void;
  onProfileClick: () => void;
  onHelpClick: () => void;
}

export function AppHeader({ currentUserData, onHomeClick, onProfileClick, onHelpClick }: AppHeaderProps) {
  const { actions } = useEntityStoreSimple();
  
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
          </div>
        </div>
      </div>
    </header>
  );
}