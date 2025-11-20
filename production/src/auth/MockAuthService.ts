// src/auth/MockAuthService.ts
import { User } from '../types';
import { currentConfig } from '../config/clientConfig';

const MOCK_STORAGE_KEY = 'mock_auth_is_logged_in';

export const MockAuthService = {
  init: async (): Promise<boolean> => {
    console.log('⚠️ [MockAuth] Initialisation...');
    return localStorage.getItem(MOCK_STORAGE_KEY) === 'true';
  },

  login: async (): Promise<void> => {
    console.log('⚠️ [MockAuth] Connexion simulée...');
    localStorage.setItem(MOCK_STORAGE_KEY, 'true');
    window.location.reload(); // Simule le retour du SSO
  },

  register: async (): Promise<void> => {
    console.log('⚠️ [MockAuth] Inscription simulée...');
    localStorage.setItem(MOCK_STORAGE_KEY, 'true');
    window.location.reload();
  },

  logout: (): void => {
    console.log('⚠️ [MockAuth] Déconnexion...');
    localStorage.removeItem(MOCK_STORAGE_KEY);
    window.location.reload();
  },

  getUserProfile: (): User | null => {
    if (localStorage.getItem(MOCK_STORAGE_KEY) !== 'true') return null;

    const mockUserConfig = currentConfig.auth?.mockUser || { 
      name: 'Mock User', 
      email: 'mock@test.com' 
    };

    return {
      id: 'mock-user-id-1',
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
  
  getToken: (): string => 'mock-jwt-token'
};
