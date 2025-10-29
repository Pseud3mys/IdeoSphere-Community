// api/authService.ts

import { User } from '../types';
import apiClient from './apiClient';
import { keycloak } from './keycloak';
import { transformUser, RawUser } from './transformService';

let initialized = false;

export const initAuth = async (): Promise<boolean> => {
  if (initialized) {
    return keycloak.authenticated || false;
  }
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
    });
    initialized = true;
    console.log(`[AUTH] Keycloak initialisé. Authentifié: ${authenticated}`);
    if (authenticated) {
      // Si l'utilisateur est authentifié, stocker le token pour les appels API
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
    }
    return authenticated;
  } catch (error) {
    console.error("❌ [AUTH] Erreur d'initialisation de Keycloak:", error);
    return false;
  }
};

/**
 * Connecte un utilisateur en appelant le backend pour obtenir un token Keycloak.
 * @returns {Promise<User | null>} Le profil de l'utilisateur si la connexion réussit.
 */
export async function loginWithEmail(email: string, password: string): Promise<User | null> {
  console.log('[AUTH] Tentative de connexion via le backend pour:', email);

  if (!password) {
    password="1234"
  }
  console.log('[AUTH] Mot de passe utilisé pour la connexion via le backend pour:', password);
  try {
    // 1. Appeler le backend pour échanger email/password contre un token
    const response = await apiClient.post('/users/login', {
      email,
      password,
    });

    const tokenData = response.data;

    if (tokenData && tokenData.access_token) {
      // 2. Initialiser l'instance keycloak-js avec les tokens reçus
      // Cela permet à l'application de savoir que l'utilisateur est authentifié
      // sans avoir besoin de redirection.
      await keycloak.init({
        onLoad: 'check-sso',
        token: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        idToken: tokenData.id_token,
      });

      // 3. Mettre à jour manuellement le header pour les futurs appels API
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${keycloak.token}`;
      console.log('✅ [AUTH] Connexion réussie via le backend.');
      
      return getUserProfile();
    }

    return null;
  } catch (error) {
    console.error("❌ [AUTH] Échec de la connexion via le backend:", error);
    return null;
  }
}

/**
 * Crée un compte utilisateur en deux étapes :
 * 1. Appelle le backend pour créer l'utilisateur dans ArangoDB ET dans Keycloak.
 * 2. Si réussi, connecte automatiquement l'utilisateur.
 * @returns {Promise<User | null>} Le profil de l'utilisateur si l'inscription et la connexion réussissent.
 */
export async function createUserAccount(userData: Partial<User> & { password?: string }): Promise<User | null> {
  console.log('🔄 [AUTH] Inscription via le backend pour:', userData.email);
  try {
    // Étape 1: Appeler votre backend pour créer l'utilisateur dans les deux systèmes.
    // Le payload contient maintenant toutes les données du formulaire d'inscription.
    const response = await apiClient.post<RawUser>('/users/register', userData);
    const newUser = transformUser(response.data);
    console.log('✅ [AUTH] Utilisateur créé via le backend:', newUser?.name);

    // Étape 2: Si la création a réussi, connecter automatiquement l'utilisateur.
    if (newUser && userData.email && userData.password) {
      console.log('🔄 [AUTH] Connexion automatique après inscription...');
      return await loginWithEmail(userData.email, userData.password);
    }
    
    return null;
  } catch (error) {
    console.error('❌ [AUTH] Erreur lors de la création du compte via le backend:', error);
    // On peut potentiellement extraire le message d'erreur du backend pour l'afficher
    // à l'utilisateur (ex: "Cet email est déjà utilisé").
    return null;
  }
}

/**
 * Déconnecte l'utilisateur.
 */
export async function logoutUser(): Promise<void> {
  await initAuth();
  delete apiClient.defaults.headers.common['Authorization'];
  await keycloak.logout({ redirectUri: window.location.origin });
}

/**
 * Récupère les informations du profil de l'utilisateur depuis le token Keycloak.
 */
export async function getUserProfile(): Promise<User | null> {
  await initAuth();
  if (keycloak.tokenParsed) {
    return {
      id: keycloak.tokenParsed.sub,
      name: keycloak.tokenParsed.name || `${keycloak.tokenParsed.given_name} ${keycloak.tokenParsed.family_name}`,
      email: keycloak.tokenParsed.email,
    } as User;
  }
  return null;
}

// Les fonctions de connexion sociale continuent d'utiliser la redirection
export async function loginWithSocialProvider(provider: string): Promise<void> {
  await initAuth();
  await keycloak.login({ idpHint: provider });
}
// --- FONCTIONS UTILITAIRES ---

/**
 * Récupère le token d'authentification de l'utilisateur.
 * C'est la fonction qui manquait.
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