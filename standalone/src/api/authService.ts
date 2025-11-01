import { User } from '../types';
import { loadMockDataSet, getUserByEmail } from './dataService';
import { getValidAvatar } from './avatarService';

// Simuler un délai d'API
const simulateApiDelay = (ms: number = 100) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Service d'authentification
 * Gère les connexions et créations de comptes utilisateurs
 */

/**
 * Connexion avec email et mot de passe
 * @param email - Email de l'utilisateur
 * @param password - Mot de passe de l'utilisateur
 * @returns User complet ou null si non trouvé/mot de passe incorrect
 */
export async function loginWithEmail(email: string, password: string): Promise<User | null> {
  await simulateApiDelay(200);
  
  console.log('🔄 [AUTH] Tentative de connexion avec email:', email);
  
  // Utiliser dataService pour récupérer l'utilisateur
  const user = await getUserByEmail(email);
  
  if (!user || !user.isRegistered) {
    console.log('❌ [AUTH] Utilisateur non trouvé ou non enregistré pour:', email);
    return null;
  }
  
  // ⚠️ EN MODE DÉMO : Accepter n'importe quel mot de passe (ou vide)
  // Dans un vrai système, vérifier le hash du mot de passe ici
  // const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  // if (!passwordMatch) {
  //   console.log('❌ [AUTH] Mot de passe incorrect pour:', email);
  //   return null;
  // }
  
  console.log('✅ [AUTH] Utilisateur trouvé et connecté:', user.name);
  return user;
}

/**
 * Connexion avec un provider social (Google, Facebook, etc.)
 * @param provider - Le nom du provider social
 * @param userData - Données utilisateur du provider
 * @returns User complet nouvellement créé ou existant
 */
export async function loginWithSocialProvider(
  provider: string, 
  userData: {
    email: string;
    name: string;
    avatar?: string;
  }
): Promise<User | null> {
  await simulateApiDelay(300);
  
  console.log('🔄 [AUTH] Connexion sociale avec:', provider, userData.email);
  
  // Vérifier si l'utilisateur existe déjà via dataService
  const existingUser = await getUserByEmail(userData.email);
  
  if (existingUser && existingUser.isRegistered) {
    console.log('✅ [AUTH] Utilisateur existant trouvé:', existingUser.name);
    return existingUser;
  }
  
  // Créer un nouvel utilisateur depuis les données du provider social
  const newUser: User = {
    id: `user-social-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: userData.name,
    email: userData.email,
    avatar: getValidAvatar(userData.name, userData.avatar),
    bio: `Membre de la communauté IdeoSphere connecté via ${provider}`,
    address: '', // Sera demandé plus tard
    createdAt: new Date(),
    isRegistered: true
  };
  
  console.log('✅ [AUTH] Nouvel utilisateur créé via', provider, ':', newUser.name);
  return newUser;
}

/**
 * Création d'un compte utilisateur traditionnel
 * @param userData - Données complètes de l'utilisateur
 * @returns User complet nouvellement créé
 */
export async function createUserAccount(userData: {
  name: string;
  email: string;
  password: string;
  address?: string;
  bio?: string;
  birthYear: number;
}): Promise<User | null> {
  await simulateApiDelay(250);
  
  console.log('🔄 [AUTH] Création de compte utilisateur:', userData.email);
  
  // ⚠️ EN MODE DÉMO : Le mot de passe est reçu mais pas stocké
  // Dans un vrai système, on hasherait le mot de passe ici :
  // const passwordHash = await bcrypt.hash(userData.password, 10);
  // Et on le stockerait dans la base de données
  if (userData.password) {
    console.log('🔐 [AUTH] Mot de passe reçu (longueur:', userData.password.length, 'caractères) - Non stocké en mode démo');
  } else {
    console.warn('⚠️ [AUTH] Aucun mot de passe fourni - En mode démo, cela est accepté');
  }
  
  // Vérifier si l'email est déjà utilisé via dataService
  const existingUser = await getUserByEmail(userData.email);
  
  if (existingUser && existingUser.isRegistered) {
    console.log('❌ [AUTH] Email déjà utilisé:', userData.email);
    return null;
  }
  
  // Créer le nouvel utilisateur (sans le mot de passe)
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: userData.name,
    email: userData.email,
    avatar: getValidAvatar(userData.name),
    bio: userData.bio || 'Nouveau membre de la communauté IdeoSphere',
    address: userData.address,
    birthYear: userData.birthYear,
    createdAt: new Date(),
    isRegistered: true
  };
  
  console.log('✅ [AUTH] Compte utilisateur créé:', newUser.name);
  return newUser;
}

/**
 * Validation d'un token d'authentification
 * @param token - Token JWT ou session
 * @returns User si token valide, null sinon
 */
export async function validateAuthToken(token: string): Promise<User | null> {
  await simulateApiDelay(100);
  
  console.log('🔄 [AUTH] Validation du token d\'authentification');
  
  // Dans un vrai système, on décoderait et validerait le JWT
  // Ici on simule une validation simple
  if (token && token.startsWith('valid-token-')) {
    const userId = token.replace('valid-token-', '');
    // Utiliser dataService pour récupérer l'utilisateur
    const { getUserById } = await import('./dataService');
    const user = await getUserById(userId);
    
    if (user && user.isRegistered) {
      console.log('✅ [AUTH] Token valide pour:', user.name);
      return user;
    }
  }
  
  console.log('❌ [AUTH] Token invalide ou expiré');
  return null;
}

/**
 * Déconnexion utilisateur
 * @param userId - ID de l'utilisateur à déconnecter
 * @returns true si succès
 */
export async function logoutUser(userId: string): Promise<boolean> {
  await simulateApiDelay(100);
  
  console.log('🔄 [AUTH] Déconnexion utilisateur:', userId);
  
  // Dans un vrai système, on invaliderait le token côté serveur
  // Ici on simule juste le succès
  console.log('✅ [AUTH] Utilisateur déconnecté avec succès');
  return true;
}

/**
 * Réinitialisation de mot de passe
 * @param email - Email de l'utilisateur
 * @returns true si l'email de réinitialisation a été envoyé
 */
export async function resetPassword(email: string): Promise<boolean> {
  await simulateApiDelay(200);
  
  console.log('🔄 [AUTH] Demande de réinitialisation de mot de passe pour:', email);
  
  // Vérifier si l'utilisateur existe via dataService
  const user = await getUserByEmail(email);
  
  if (user && user.isRegistered) {
    console.log('✅ [AUTH] Email de réinitialisation envoyé à:', email);
    return true;
  }
  
  console.log('❌ [AUTH] Aucun utilisateur trouvé pour:', email);
  return false;
}

/**
 * Inscription à la newsletter
 * @param email - Email pour l'inscription
 * @returns true si l'inscription a réussi
 */
export async function subscribeToNewsletterOnApi(email: string): Promise<boolean> {
  await simulateApiDelay(150);
  
  console.log('🔄 [AUTH] Inscription à la newsletter pour:', email);
  
  try {
    // Validation basique de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ [AUTH] Email invalide:', email);
      return false;
    }
    
    // Dans un vrai système, on ajouterait l'email à la liste de newsletter
    // Ici on simule le succès
    console.log('✅ [AUTH] Inscription à la newsletter réussie pour:', email);
    return true;
    
  } catch (error) {
    console.error('❌ [AUTH] Erreur lors de l\'inscription à la newsletter:', error);
    return false;
  }
}

/**
 * Création d'un compte utilisateur non finalisé (temporaire)
 * Pour permettre aux visiteurs de publier du contenu avant de s'inscrire
 * @param guestData - Données optionnelles du visiteur
 * @returns User temporaire avec isRegistered: false
 */
export async function createUnfinalizedAccountOnApi(guestData?: { 
  name?: string;
  email?: string;
  address?: string;
  bio?: string;
}): Promise<User> {
  await simulateApiDelay(150);
  
  console.log('🔄 [AUTH] Création de compte non finalisé (temporaire)', {
    name: guestData?.name,
    email: guestData?.email,
    address: guestData?.address
  });
  
  const tempId = `temp-guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const userName = guestData?.name || `Invité ${Math.floor(Math.random() * 1000)}`;
  const userEmail = guestData?.email || `${tempId}@temp.guest`;
  
  const tempUser: User = {
    id: tempId,
    name: userName,
    email: userEmail,
    bio: guestData?.bio || 'Compte temporaire non finalisé',
    avatar: getValidAvatar(userName),
    address: guestData?.address || '',
    createdAt: new Date(),
    isRegistered: false // ✅ Compte non finalisé
  };
  
  console.log('✅ [AUTH] Compte non finalisé créé:', tempUser.name, tempUser.email, '- ID:', tempUser.id);
  return tempUser;
}

/**
 * Connexion via SSO (Single Sign-On)
 * Redirige vers le service d'authentification externe
 * Cette fonction provoquera une redirection complète de la page
 */
export function loginWithSSO(): void {
  console.log('🔄 [AUTH] Redirection vers SSO pour connexion');
  
  // ⚠️ EN MODE DÉMO : Simuler la redirection SSO
  // Dans un vrai système, on redirigerait vers le provider SSO :
  // window.location.href = `https://sso-provider.com/login?redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback`;
  
  // Pour la démo, on simule juste un log
  console.log('🔐 [AUTH] Redirection SSO simulée - URL cible: /auth/sso/login');
  
  // Dans un système réel, cette ligne provoquerait la redirection :
  // window.location.href = '/auth/sso/login';
  alert('🔐 SSO Connexion : Redirection vers le service d\'authentification externe (simulé en mode démo)');
}

/**
 * Inscription via SSO (Single Sign-On)
 * Redirige vers le service d'inscription externe
 * Cette fonction provoquera une redirection complète de la page
 */
export function registerWithSSO(): void {
  console.log('🔄 [AUTH] Redirection vers SSO pour inscription');
  
  // ⚠️ EN MODE DÉMO : Simuler la redirection SSO
  // Dans un vrai système, on redirigerait vers le provider SSO :
  // window.location.href = `https://sso-provider.com/register?redirect_uri=${encodeURIComponent(window.location.origin)}/auth/callback`;
  
  // Pour la démo, on simule juste un log
  console.log('🔐 [AUTH] Redirection SSO simulée - URL cible: /auth/sso/register');
  
  // Dans un système réel, cette ligne provoquerait la redirection :
  // window.location.href = '/auth/sso/register';
  alert('🔐 SSO Inscription : Redirection vers le service d\'authentification externe (simulé en mode démo)');
}