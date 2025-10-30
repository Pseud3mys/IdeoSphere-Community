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

// --- NOUVELLES FONCTIONS D'ACTION ---

/**
 * Redirige l'utilisateur vers la page de connexion de Keycloak.
 */
export function login(): void {
  console.log('[AUTH] Redirection vers la page de connexion Keycloak...');
  keycloak.login();
}

/**
 * Redirige l'utilisateur vers la page d'inscription de Keycloak.
 */
export function register(): void {
  console.log('[AUTH] Redirection vers la page d\'inscription Keycloak...');
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

/**
 * LANCE le processus de connexion en redirigeant l'utilisateur vers Keycloak.
 * CETTE FONCTION NE RETOURNE PAS D'UTILISATEUR.
 * La récupération de l'utilisateur se fait via getUserProfile() APRES le rechargement de la page.
 * @param _email - Ignoré, présent pour la compatibilité
 * @param _password - Ignoré, présent pour la compatibilité
 * @returns {Promise<void>} Une promesse qui ne se résoudra jamais avec une valeur, car la page sera redirigée.
 */
export async function loginWithEmail(_email: string, _password: string): Promise<User | null> {
  console.log('🔄 [AUTH] Lancement du processus de connexion via redirection...');
  // On ne fait qu'appeler la fonction de redirection simple.
  // Les arguments email/password ne sont plus utilisés.
  keycloak.login();
  
  // NOTE IMPORTANTE :
  // Le code ci-dessous ne sera jamais atteint car le navigateur redirige la page.
  // Nous retournons null pour satisfaire le typage de la fonction, mais en pratique,
  // le composant qui appelle cette fonction doit gérer l'état d'authentification
  // de manière globale (via un Context, Redux, etc.) et non via la valeur de retour.
  return null; 
}


/**
 * LANCE le processus d'inscription en redirigeant l'utilisateur vers Keycloak.
 * CETTE FONCTION NE RETOURNE PAS D'UTILISATEUR.
 * @param _userData - Données ignorées, présentes pour la compatibilité.
 * @returns {Promise<void>} Une promesse qui ne se résoudra jamais avec une valeur.
 */
export async function createUserAccount(_userData: Partial<User> & { password?: string }): Promise<User | null> {
  console.log('🔄 [AUTH] Lancement du processus d\'inscription via redirection...');
  // On appelle simplement la méthode register de keycloak-js.
  keycloak.register();

  // Mêmes remarques que pour loginWithEmail.
  return null;
}

/**
 * Déconnecte l'utilisateur.
 */
export async function logoutUser(): Promise<void> {
  await initAuth();
  delete apiClient.defaults.headers.common['Authorization'];
  await keycloak.logout({ redirectUri: window.location.origin });
}

// Les fonctions de connexion sociale continuent d'utiliser la redirection
export async function loginWithSocialProvider(provider: string): Promise<void> {
  await initAuth();
  await keycloak.login({ idpHint: provider });
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