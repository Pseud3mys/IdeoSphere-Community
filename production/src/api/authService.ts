// src/api/authService.ts

import { User } from '../types';
import apiClient from './apiClient';
import { keycloak } from './keycloak';
import { transformUser, RawUser } from './transformService';

// Variable d'état simple (comme dans votre ancien code qui fonctionnait)
let initialized = false;

/**
 * Initialise Keycloak.
 * Reprend la logique "classique" : on vérifie si c'est déjà fait, sinon on lance init.
 */
export const initAuth = async (): Promise<boolean> => {
  // 1. Si déjà initialisé, on retourne l'état actuel
  if (initialized) {
    return keycloak.authenticated || false;
  }

  try {
    console.log('🔒 [AUTH] Initialisation Keycloak (check-sso)...');
    
    // 2. Initialisation avec check-sso
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      //checkLoginIframe: false, // Désactivé pour éviter les warnings de cookies tiers
      pkceMethod: 'S256' // Sécurité renforcée
    });

    initialized = true;
    console.log(`🔓 [AUTH] Initialisation terminée. Authentifié: ${authenticated}`);

    if (authenticated) {
      // Setup du refresh token automatique
      setInterval(() => {
        keycloak.updateToken(70).catch(console.error);
      }, 60000);
    }

    return authenticated;
  } catch (error) {
    console.error("❌ [AUTH] Erreur d'initialisation de Keycloak:", error);
    // En cas d'erreur, on ne marque PAS initialized à true pour permettre une nouvelle tentative
    return false;
  }
};

/**
 * Connexion via SSO
 * Ajout CRUCIAL : redirectUri explicite
 */
export async function loginWithSSO(): Promise<void> {
  console.log('🔄 [AUTH] Demande de connexion SSO...');
  try {
    // On s'assure que l'init est passée
    await initAuth();
    
    // On force la redirection vers l'origine actuelle
    await keycloak.login({
      redirectUri: window.location.origin
    });
  } catch (error) {
    console.error("❌ [AUTH] Impossible de lancer le login:", error);
  }
}

/**
 * Inscription via SSO
 */
export async function registerWithSSO(): Promise<void> {
  console.log('🔄 [AUTH] Demande d\'inscription SSO...');
  try {
    await initAuth();
    await keycloak.register({
      redirectUri: window.location.origin
    });
  } catch (error) {
    console.error("❌ [AUTH] Impossible de lancer l'inscription:", error);
  }
}

export function logout(): void {
  console.log('[AUTH] Déconnexion...');
  // Redirection vers l'accueil après logout
  keycloak.logout({ redirectUri: window.location.origin });
}

// --- FONCTIONS UTILITAIRES (Inchangées) ---

export function getUserProfile(): User | null {
  if (keycloak.tokenParsed) {
    return {
      id: keycloak.tokenParsed.sub,
      name: keycloak.tokenParsed.preferred_username || keycloak.tokenParsed.name,
      email: keycloak.tokenParsed.email,
    } as User;
  }
  return null;
}

export function getToken(): string | undefined {
  return keycloak.token;
}

export function isAuthenticated(): boolean {
  return !!keycloak.authenticated;
}

// Garder les autres fonctions API pour la compatibilité (mode invité, etc.)
export async function loginWithEmail(email: string): Promise<User | null> {
  console.log('🔄 [AUTH] Tentative de connexion API avec email:', email);
  try {
    const response = await apiClient.post<RawUser>('/users/login', { email });
    const user = transformUser(response.data);
    if (user && user.isRegistered) return user;
    return null;
  } catch (error) {
    console.error('❌ [AUTH] Erreur lors de la connexion:', error);
    return null;
  }
}

export async function createUserAccount(userData: Partial<User>): Promise<User | null> {
  try {
    const response = await apiClient.post<RawUser>('/users', { ...userData, isRegistered: true });
    return transformUser(response.data);
  } catch (error) {
    console.error('❌ [AUTH] Erreur lors de la création du compte:', error);
    return null;
  }
}

export async function createUnfinalizedAccountOnApi(guestData?: any): Promise<User | null> {
  try {
    const tempEmail = `guest-${Date.now()}@temp.guest`;
    const payload = {
      name: guestData?.name || `Invité ${Math.floor(Math.random() * 1000)}`,
      email: guestData?.email || tempEmail,
      location: guestData?.address || '',
      bio: guestData?.bio || '',
      isRegistered: false,
    };
    const response = await apiClient.post<RawUser>('/users', payload);
    return transformUser(response.data);
  } catch (error) {
    console.error('❌ [AUTH] Erreur compte temporaire:', error);
    return null;
  }
}

export async function loginWithSocialProvider(provider: string, userData: any): Promise<User | null> { return null; }
export async function validateAuthToken(token: string): Promise<User | null> { return null; }
export async function resetPassword(email: string): Promise<boolean> { return false; }
export async function subscribeToNewsletterOnApi(email: string): Promise<void> {}