// api/authService.ts

import { User } from '../types';
import apiClient from './apiClient';
import { keycloak } from './keycloak';
import { transformUser, RawUser } from './transformService';

let initialized = false;

/**
 * Initialise le service d'authentification.
 * C'est la fonction la plus importante. Elle est appelée au démarrage de l'application.
 * Elle gère automatiquement le retour de l'utilisateur après une redirection depuis Keycloak.
 */
export const initAuth = async (): Promise<boolean> => {
  if (initialized) {
    return keycloak.authenticated || false;
  }
  
  try {
    // 'check-sso' vérifie si l'utilisateur est déjà connecté en silence.
    // Si l'URL contient des tokens (après une redirection de login), 
    // keycloak.init() les traitera et authentifiera l'utilisateur.
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    });
    
    initialized = true;
    console.log(`[AUTH] Keycloak initialisé. Authentifié: ${authenticated}`);

    if (authenticated) {
      // Si l'authentification réussit, on met à jour le token pour les appels API.
      // C'est ici que l'intercepteur de apiClient prendra le relais.
      console.log("[AUTH] Utilisateur authentifié, le token est prêt.");
    }

    // Mettre en place un rafraîchissement automatique du token
    setInterval(() => {
      if (keycloak.token) {
        keycloak.updateToken(70).then(refreshed => {
          if (refreshed) {
            console.log('[AUTH] Token rafraîchi avec succès');
          }
        }).catch(() => {
          console.error('[AUTH] Erreur lors du rafraîchissement du token');
        });
      }
    }, 60000); // Toutes les 60 secondes

    return authenticated;
  } catch (error) {
    console.error("❌ [AUTH] Erreur d'initialisation de Keycloak:", error);
    return false;
  }
};


/**
 * Connexion via SSO (Single Sign-On)
 * Redirige vers le service d'authentification externe
 * Cette fonction provoquera une redirection complète de la page
 */
export function loginWithSSO(): void {
  console.log('🔄 [AUTH] Redirection vers SSO pour connexion');
  keycloak.login();
}

/**
 * Inscription via SSO (Single Sign-On)
 * Redirige vers le service d'inscription externe
 * Cette fonction provoquera une redirection complète de la page
 */
export function registerWithSSO(): void {
  console.log('🔄 [AUTH] Redirection vers SSO pour inscription');
  keycloak.register();
}

/**
 * Déconnecte l'utilisateur et le redirige vers la page d'accueil.
 */
export function logout(): void {
  console.log('[AUTH] Déconnexion de Keycloak...');
  keycloak.logout({ redirectUri: window.location.origin });
}

// --- FONCTIONS UTILITAIRES (INCHANGÉES) ---

/**
 * Récupère les informations du profil de l'utilisateur depuis le token Keycloak.
 */
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

/**
 * Récupère le token d'authentification de l'utilisateur.
 * @returns {string | undefined} Le token JWT.
 */
export function getToken(): string | undefined {
  return keycloak.token;
}

/**
 * Vérifie si l'utilisateur est authentifié.
 */
export function isAuthenticated(): boolean {
  return !!keycloak.authenticated;
}


export async function loginWithEmail(email: string): Promise<User | null> {
  console.log('🔄 [AUTH] Tentative de connexion API avec email:', email);
  try {
    const response = await apiClient.post<RawUser>('/users/login', { email });
    const user = transformUser(response.data);
    
    if (user && user.isRegistered) {
      console.log('✅ [AUTH] Utilisateur trouvé via API:', user.name);
      return user;
    }
    
    console.log('❌ [AUTH] Utilisateur non trouvé ou non enregistré pour:', email);
    return null;
  } catch (error) {
    console.error('❌ [AUTH] Erreur lors de la connexion:', error);
    return null;
  }
}

/**
 * Crée un nouveau compte utilisateur.
 * Corresponds à POST /users
 */
export async function createUserAccount(userData: Partial<User>): Promise<User | null> {
  console.log('🔄 [AUTH] Création de compte API pour:', userData.email);
  try {
    const response = await apiClient.post<RawUser>('/users', { ...userData, isRegistered: true });
    const newUser = transformUser(response.data);
    console.log('✅ [AUTH] Compte utilisateur créé via API:', newUser?.name);
    return newUser;
  } catch (error) {
    console.error('❌ [AUTH] Erreur lors de la création du compte:', error);
    return null;
  }
}

/**
 * Gère la connexion ou l'inscription via un fournisseur social.
 */
export async function loginWithSocialProvider(
  provider: string, 
  userData: { email: string; name: string; avatar?: string; }
): Promise<User | null> {
  console.log("🔄 [AUTH] Connexion via fournisseur social appelée mais non implémentée");
  return null;
}

// la suite des fonction doit encore être migré pour utiliser Keycloak

/**
 * Crée un compte utilisateur non finalisé (temporaire) en appelant l'API.
 * Pour permettre aux visiteurs de publier du contenu avant de s'inscrire.
 * @param guestData - Données optionnelles du visiteur
 * @returns L'utilisateur temporaire créé par le backend avec isRegistered: false
 */
export async function createUnfinalizedAccountOnApi(guestData?: {
    name?: string;
    email?: string;
    address?: string;
    bio?: string;
}): Promise<User | null> {
  console.log('🔄 [AUTH] Création de compte non finalisé (temporaire) via API');
  console.log(guestData);
  try {
    // 1. Préparer le payload pour l'API.
    // L'email est généré aléatoirement pour être unique, car il est requis par le backend.
    const tempEmail = `guest-${Date.now()}@temp.guest`;
    const payload = {
      name: guestData?.name || `Invité ${Math.floor(Math.random() * 1000)}`,
      email: guestData?.email || tempEmail,
      location: guestData?.address || '',
      bio: guestData?.bio || '',
      isRegistered: false, // ✅ C'est le champ clé pour indiquer un compte non finalisé.
    };

    // 2. Appeler l'endpoint POST /users du backend.
    const response = await apiClient.post<RawUser>('/users', payload);

    // 3. Transformer la réponse de l'API en objet User pour le frontend.
    const newUser = transformUser(response.data);
    
    console.log('✅ [AUTH] Compte non finalisé créé via API:', newUser?.name);
    return newUser;

  } catch (error) {
    console.error('❌ [AUTH] Erreur lors de la création du compte non finalisé:', error);
    return null;
  }
}

/**
 * Valide un token de session. (Nécessite un endpoint backend)
 */
export async function validateAuthToken(token: string): Promise<User | null> {
  console.log('LOG: validateAuthToken a été appelé. Ce service nécessite un endpoint API dédié.');
  // Simulation: dans une vraie app, on enverrait le token au serveur pour validation.
  return null;
}

/**
 * Envoie un e-mail de réinitialisation de mot de passe. (Nécessite un endpoint backend)
 */
export async function resetPassword(email: string): Promise<boolean> {
  console.log(`LOG: resetPassword a été appelé pour ${email}. Ce service nécessite un endpoint API dédié.`);
  return false;
}

/**
 * Inscrit une adresse e-mail à la newsletter. (Nécessite un endpoint backend)
 */
export async function subscribeToNewsletterOnApi(email: string): Promise<void> {
  console.log(`LOG: subscribeToNewsletterOnApi a été appelé pour ${email}. Ce service nécessite un endpoint API dédié.`);
}