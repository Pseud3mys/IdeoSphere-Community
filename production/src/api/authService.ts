// src/api/authService.ts

import { User } from '../types';
import apiClient from './apiClient';
import { keycloak } from './keycloak';
import { transformUser, RawUser } from './transformService';
import { currentConfig } from '../config/clientConfig';

let initialized = false;
// 1. On ajoute une variable pour stocker la promesse globale
let initPromise: Promise<boolean> | null = null; 

export const initAuth = async (): Promise<boolean> => {
  // 2. Si déjà initialisé avec succès, on retourne direct
  if (initialized) {
    return keycloak.authenticated || false;
  }

  // 3. LE VERROU : Si une initialisation est DÉJÀ en cours, 
  // on retourne la promesse existante. Tous les appels simultanés attendront le même résultat !
  if (initPromise) {
    return initPromise;
  }

  console.log('🔒 [AUTH] Initialisation Keycloak (check-sso)...');
  
  // 4. On stocke la promesse d'initialisation
  initPromise = keycloak.init({
    onLoad: 'check-sso',
    silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
    pkceMethod: 'S256'
  }).then((authenticated) => {
    initialized = true;
    console.log(`🔓 [AUTH] Initialisation terminée. Authentifié: ${authenticated}`);

    if (authenticated) {
      setInterval(() => {
        keycloak.updateToken(70).catch(console.error);
      }, 60000);
    }

    return authenticated;
  }).catch((error) => {
    console.error("❌ [AUTH] Erreur d'initialisation de Keycloak:", error);
    // En cas d'erreur (réseau, etc.), on libère le verrou pour permettre un nouvel essai plus tard
    initPromise = null; 
    return false;
  });

  return initPromise;
};

/**
 * Crée un compte invité (non authentifié) via l'API, ou récupère l'existant via LocalStorage.
 * Utilisé par createTemporaryGuest dans userActions.ts
 */
export async function createUnfinalizedAccountOnApi(guestData?: { name?: string; email?: string; address?: string }): Promise<User> {
  console.log('👤 [AUTH] Vérification ou création d\'un compte invité...');

  // 1. On vérifie si un compte invité existe déjà dans ce navigateur
  const storedGuestEmail = localStorage.getItem('ideosphere_guest_email');

  // Si on a un email stocké et qu'on n'est pas en train d'en forcer un nouveau
  if (storedGuestEmail && !guestData?.email) {
    try {
      // On utilise la route existante POST /users/login pour récupérer l'utilisateur par email
      const response = await apiClient.post('/users/login', { email: storedGuestEmail });
      console.log('✅ [AUTH] Compte invité existant récupéré depuis la session locale');
      return transformUser(response.data);
    } catch (error) {
      console.warn('⚠️ [AUTH] Ancien compte invité introuvable en base (peut-être supprimé), on en recrée un...');
      localStorage.removeItem('ideosphere_guest_email');
    }
  }

  // 2. Aucun invité existant ou échec de récupération : création d'un NOUVEAU compte
  const timestamp = new Date().getTime();
  const name = guestData?.name || `visiteur (${timestamp.toString().slice(-4)})`;
  const email = guestData?.email || `guest_${timestamp}@temp.local`;

  try {
    const response = await apiClient.post<RawUser>('/users', {
      name,
      email,
      //address: guestData?.address || '',
      // a remplacer par: 
      //location: {
      //    label: guestData?.address || ''
      //},
      isRegistered: false, // Marqueur important pour le backend
      createdAt: new Date().toISOString()
    });

    const newUser = transformUser(response.data);

    // 3. On sauvegarde l'email généré dans le navigateur pour les prochains rechargements
    localStorage.setItem('ideosphere_guest_email', newUser.email);

    return newUser;
  } catch (error) {
    console.error('❌ [AUTH] Erreur création invité:', error);
    throw error;
  }
}

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
  // On nettoie la trace de l'invité pour repartir sur un compte vierge si besoin
  localStorage.removeItem('ideosphere_guest_email');
  // Redirection vers l'accueil après logout
  keycloak.logout({ redirectUri: window.location.origin });
}

/**
 * Synchronise la session : Gère les 3 cas (Nouveau, Invité, Existant)
 */
export async function syncUserSession(): Promise<User | null> {
  // 1. mode mock supprime.

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
      name: keycloakProfile.name, // On met à jour le nom depuis Keycloak
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

/**
 * Vérifie si l'utilisateur a le rôle admin pour le tenant actuel
 * Le format du rôle est "admin:{tenant}" (ex: "admin:client")
 * Le tenant est extrait de la première partie de l'URL (ex: client.localhost)
 * 
 * IMPORTANT: Retourne false si l'utilisateur n'est pas authentifié via Keycloak
 * (les utilisateurs invités n'ont jamais accès à l'admin)
 */
export function hasAdminRole(): boolean {
  // 1. Vérifier d'abord si l'utilisateur est authentifié via Keycloak
  if (!keycloak.authenticated) {
    console.warn('⚠️ [AUTH] Utilisateur non authentifié via Keycloak (utilisateur invité)');
    return false;
  }

  // 2. Vérifier si on a un token parsé
  if (!keycloak.tokenParsed) {
    console.warn('⚠️ [AUTH] Pas de token parsé disponible');
    return false;
  }

  // 3. Extraire le tenant depuis l'URL (première partie du domaine)
  const hostname = window.location.hostname;
  const tenant = hostname.split('.')[0]; // Ex: "client" depuis "client.localhost"
  
  // Le rôle admin est "admin:{tenant}"
  const adminRole = `admin:${tenant}`;
  
  console.log(`🔍 [AUTH] Vérification du rôle: ${adminRole}`);
  
  // 4. Vérifier dans resource_access (rôles clients)
  const resourceAccess = keycloak.tokenParsed.resource_access || {};
  const clientId = keycloak.clientId || 'ideosphere-front';
  const clientRoles = resourceAccess[clientId]?.roles || [];
  
  // 5. Vérifier aussi dans les realm_access (rôles du realm)
  const realmRoles = keycloak.tokenParsed.realm_access?.roles || [];
  
  // 6. Chercher dans les deux listes
  const hasRole = clientRoles.includes(adminRole) || realmRoles.includes(adminRole);
  
  if (hasRole) {
    console.log(`✅ [AUTH] Utilisateur a le rôle ${adminRole}`);
  } else {
    console.log(`❌ [AUTH] Utilisateur n'a pas le rôle ${adminRole}`);
    console.log(`📋 [AUTH] Rôles client disponibles:`, clientRoles);
    console.log(`📋 [AUTH] Rôles realm disponibles:`, realmRoles);
  }
  
  return hasRole;
}

