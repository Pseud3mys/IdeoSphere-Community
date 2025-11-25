import { useState } from 'react';
import { User } from '../types';
import { Button } from './ui/button';
import { LogIn, UserPlus } from 'lucide-react';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { loginWithSSO, registerWithSSO } from '../api/authService';

interface AuthButtonsProps {
  currentUser: User | null;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSocialLogin: (provider: string) => Promise<boolean>;
  onProfileClick: () => void;
  onEnterPlatform?: () => void;
  onLoginSSO?: () => void;
  compact?: boolean; // Si true, affiche une version compacte (pour le header)
}

/**
 * Composant réutilisable pour les boutons d'authentification
 * Affiche les bons boutons selon l'état de connexion de l'utilisateur
 * S'adapte automatiquement au contexte (header compact ou page d'accueil)
 */
export function AuthButtons({ 
  currentUser, 
  onLogin,
  onSocialLogin,
  onProfileClick,
  onEnterPlatform,
  onLoginSSO,
  compact = false
}: AuthButtonsProps) {
  const navigation = useNavigationActions();
  
  // Vérifier si l'utilisateur est connecté et enregistré
  const isGuest = !currentUser || !currentUser.isRegistered;

  const handleSignupClick = async () => {
    // Rediriger directement vers le SSO pour créer un compte
    await registerWithSSO();
  };
  
  const handleLoginClick = async () => {
    // Rediriger directement vers le SSO pour se connecter
    await loginWithSSO();
  };

  // Si l'utilisateur est connecté, afficher le lien vers le profil
  if (!isGuest) {
    if (compact) {
      // Version compacte pour le header
      return (
        <>
          <div className="text-right hidden sm:block">
            <div className="text-sm text-gray-900">{currentUser?.name || 'Utilisateur'}</div>
            <div className="text-xs text-muted-foreground">
              {currentUser?.location || 'Membre actif'}
            </div>
          </div>
          <div 
            className="w-12 h-12 sm:w-10 sm:h-10 bg-primary rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-105 transition-transform shadow-sm"
            onClick={onProfileClick}
            title="Voir mon profil"
          >
            {currentUser?.name?.slice(0, 2).toUpperCase() || 'U'}
          </div>
        </>
      );
    } else {
      // Version complète pour la page d'accueil
      return (
        <Button
          onClick={onProfileClick}
          size="lg"
          className="bg-primary text-white hover:bg-primary/90"
        >
          Mon profil
        </Button>
      );
    }
  }

  // Si l'utilisateur n'est pas connecté, afficher les boutons de connexion/inscription
  if (compact) {
    // Version compacte pour le header - deux boutons côte à côte
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleLoginClick}
          className="flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
          title="Se connecter"
        >
          <LogIn className="w-4 h-4" />
          <span className="hidden sm:inline">Se connecter</span>
        </button>
        <button
          onClick={handleSignupClick}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          title="Créer un compte"
        >
          <UserPlus className="w-4 h-4" />
          <span className="hidden sm:inline">Créer un compte</span>
        </button>
      </div>
    );
  } else {
    // Version complète pour la page d'accueil - deux boutons côte à côte
    return (
      <div className="flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="lg"
          onClick={handleLoginClick}
          className="flex items-center space-x-2 px-8"
        >
          <LogIn className="w-4 h-4" />
          <span>Se connecter</span>
        </Button>
        
        <Button
          size="lg"
          onClick={handleSignupClick}
          className="flex items-center space-x-2 px-8 bg-primary text-white hover:bg-primary/90"
        >
          <UserPlus className="w-4 h-4" />
          <span>Créer un compte</span>
        </Button>
      </div>
    );
  }
}