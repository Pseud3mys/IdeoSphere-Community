// src/auth/MockAuthService.ts
import { User } from '../types';
import { currentConfig } from '../config/clientConfig';
import { users } from '../data/users';

const MOCK_STORAGE_KEY = 'mock_auth_is_logged_in';
const MOCK_EMAIL_KEY = 'mock_auth_email';

export const MockAuthService = {
  init: async (): Promise<boolean> => {
    console.log('⚠️ [MockAuth] Initialisation...');
    const isLoggedIn = localStorage.getItem(MOCK_STORAGE_KEY) === 'true';
    
    // Si connecté mais pas d'email stocké, utiliser l'email par défaut
    if (isLoggedIn && !localStorage.getItem(MOCK_EMAIL_KEY)) {
      const defaultEmail = currentConfig.auth?.mockUser?.email || 'marie.dubois@email.com';
      console.log('🔄 [MockAuth] Initialisation de l\'email par défaut:', defaultEmail);
      localStorage.setItem(MOCK_EMAIL_KEY, defaultEmail);
    }
    
    return isLoggedIn;
  },

  login: async (email?: string): Promise<void> => {
    console.log('⚠️ [MockAuth] Connexion simulée...', email);
    // Utiliser l'email fourni, ou l'email par défaut
    const emailToStore = email || currentConfig.auth?.mockUser?.email || 'marie.dubois@email.com';
    localStorage.setItem(MOCK_EMAIL_KEY, emailToStore);
    localStorage.setItem(MOCK_STORAGE_KEY, 'true');
    window.location.reload(); // Simule le retour du SSO
  },

  register: async (): Promise<void> => {
    console.log('⚠️ [MockAuth] Inscription simulée...');
    // Initialiser avec l'email par défaut si pas déjà défini
    if (!localStorage.getItem(MOCK_EMAIL_KEY)) {
      const defaultEmail = currentConfig.auth?.mockUser?.email || 'marie.dubois@email.com';
      localStorage.setItem(MOCK_EMAIL_KEY, defaultEmail);
    }
    localStorage.setItem(MOCK_STORAGE_KEY, 'true');
    window.location.reload();
  },

  logout: (): void => {
    console.log('⚠️ [MockAuth] Déconnexion...');
    localStorage.removeItem(MOCK_STORAGE_KEY);
    localStorage.removeItem(MOCK_EMAIL_KEY);
    window.location.reload();
  },

  getUserProfile: (): User | null => {
    if (localStorage.getItem(MOCK_STORAGE_KEY) !== 'true') return null;

    // Récupérer l'email stocké
    const storedEmail = localStorage.getItem(MOCK_EMAIL_KEY);
    
    // Chercher l'utilisateur correspondant dans les données mockées
    const mockUser = users.find(u => u.email === storedEmail);
    
    if (mockUser) {
      console.log('✅ [MockAuth] Utilisateur trouvé:', mockUser.name, mockUser.email);
      return {
        ...mockUser,
        // S'assurer que tous les champs requis sont présents
        followedIdeas: mockUser.followedIdeas || [],
        followedPosts: mockUser.followedPosts || [],
        likedIdeas: mockUser.likedIdeas || [],
        likedPosts: mockUser.likedPosts || [],
        contributions: mockUser.contributions || [],
        groups: mockUser.groups || [],
      };
    }

    // Fallback sur la config si aucun email stocké ou utilisateur non trouvé
    const mockUserConfig = currentConfig.auth?.mockUser || { 
      name: 'Mock User', 
      email: 'mock@test.com' 
    };

    console.warn('⚠️ [MockAuth] Aucun utilisateur trouvé pour email:', storedEmail, '- Utilisation du fallback');

    return {
      id: 'mock-user-fallback',
      name: mockUserConfig.name,
      email: mockUserConfig.email,
      avatar: '',
      bio: (mockUserConfig as any).bio || 'Utilisateur de test',
      address: (mockUserConfig as any).location || '',
      birthYear: 1990,
      createdAt: new Date().toISOString(),
      followedIdeas: [],
      followedPosts: [],
      likedIdeas: [],
      likedPosts: [],
      contributions: [],
      groups: [],
      isRegistered: true
    } as User;
  },
  
  getToken: (): string => 'mock-jwt-token',

  // Nouvelle méthode pour récupérer les utilisateurs disponibles
  getAvailableUsers: (): User[] => users,
};