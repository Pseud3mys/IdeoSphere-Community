// src/api/authService.ts

import { User } from '../types';
import apiClient from './apiClient';
import { keycloak } from './keycloak';
import { transformUser, RawUser } from './transformService';
import { currentConfig } from '../config/clientConfig';

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
      redirectUri: window.location.origin + "/my-contributions"
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

/**
 * Synchronise la session : Gère les 3 cas (Nouveau, Invité, Existant)
 */
export async function syncUserSession(): Promise<User | null> {
  // 1. MODE MOCK
  if (currentConfig.auth?.mode === 'mock') {
    return MockAuthService.getUserProfile();
  }

  // 2. MODE KEYCLOAK
  const keycloakProfile = getUserProfileFromToken();
  if (!keycloakProfile || !keycloakProfile.email) return null;

  try {
    console.log(`🔄 [AUTH] Recherche du compte pour ${keycloakProfile.email}...`);
    
    // On cherche par email pour voir si un compte (invité ou réel) existe déjà
    const response = await apiClient.get(`/users/me?email=${encodeURIComponent(keycloakProfile.email)}`);
    
    // --- CAS 2 & 3 : COMPTE EXISTANT (Invité ou Déjà enregistré) ---
    console.log('✅ [AUTH] Compte existant trouvé via email');
    
    const dbUser = transformUser(response.data);

    // Si c'était un compte invité (non enregistré) OU qu'il n'a pas encore l'ID Keycloak
    // On doit faire une MISE À JOUR pour lier le compte officiellement
    if (!dbUser.isRegistered || !response.data.keycloakId) {
        console.log('🔄 [AUTH] Transition compte Invité -> Membre (Liaison Keycloak)...');
        await linkGuestToKeycloak(dbUser.id, keycloakProfile.id);
    }
    
    return {
      ...dbUser, 
      isRegistered: true, // On force à true car maintenant il est authentifié
      keycloakId: keycloakProfile.id // On s'assure que l'ID technique est là
    };
    
  } catch (error: any) {
    // --- CAS 1 : NOUVEL UTILISATEUR (404) ---
    if (error.response?.status === 404) {
      console.log('🆕 [AUTH] Aucun compte trouvé (ni invité, ni membre). Création...');
      return await registerNewUserInBackend(keycloakProfile);
    }
    
    console.error('❌ [AUTH] Erreur critique synchro:', error);
    return keycloakProfile; // Mode dégradé
  }
}

/**
 * CAS 1 : Crée un tout nouvel utilisateur complet
 */
async function registerNewUserInBackend(baseProfile: User): Promise<User | null> {
  try {
    const response = await apiClient.post('/users', {
      email: baseProfile.email,
      name: baseProfile.name,
      avatar: baseProfile.avatar,
      
      // IMPORTANT : On enregistre directement l'ID Keycloak
      keycloakId: baseProfile.id, 
      isRegistered: true,
      createdAt: new Date().toISOString()
    });
    
    return transformUser(response.data);
  } catch (e) {
    console.error('❌ Impossible de créer l\'utilisateur', e);
    return baseProfile;
  }
}

/**
 * CAS 2 : Transforme un invité en membre officiel (Liaison)
 * Appelle une route PATCH pour injecter le keycloakId
 */
async function linkGuestToKeycloak(dbUserId: string, keycloakId: string): Promise<void> {
    try {
        // On met à jour l'utilisateur existant avec son nouvel ID Keycloak
        await apiClient.patch(`/${dbUserId}`, {
            keycloakId: keycloakId,
            isRegistered: true
            // On ne touche pas au reste (bio, contributions, date de création d'origine...)
        });
        console.log('✅ [AUTH] Liaison effectuée avec succès');
    } catch (e) {
        console.error('❌ Erreur lors de la liaison du compte invité', e);
        // On ne bloque pas le login, mais le compte ne sera pas "parfaitement" lié
    }
}

export function getUserProfileFromToken(): User | null {
  if (keycloak.tokenParsed) {
    return {
      id: keycloak.tokenParsed.sub,
      name: keycloak.tokenParsed.name, // keycloak.tokenParsed.preferred_username est le mail.
      email: keycloak.tokenParsed.email,
    } as User;
  }
  return null;
}


// --- FONCTIONS UTILITAIRES (Inchangées, à supprimer ?) ---
export async function loginWithSocialProvider(provider: string, userData: any): Promise<User | null> { return null; }

// elle est utilisée dans hooks user action.
export async function subscribeToNewsletterOnApi(email: string): Promise<void> {}