// src/services/authService.ts

import { User } from '../types';
import apiClient from './apiClient';
import { transformUser, RawUser } from './transformService';

/**
 * Tente de connecter un utilisateur via son email.
 * Corresponds à POST /users/login
 */
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
 * Gère la connexion ou l'inscription via un fournisseur social.
 */
export async function loginWithSocialProvider(
  provider: string, 
  userData: { email: string; name: string; avatar?: string; }
): Promise<User | null> {
  console.log('🔄 [AUTH] Connexion sociale API avec:', provider, userData.email);
  
  try {
    const existingUser = await loginWithEmail(userData.email);
    if (existingUser) {
      console.log('✅ [AUTH] Utilisateur social existant trouvé:', existingUser.name);
      return existingUser;
    }
    
    console.log('✨ [AUTH] Création d\'un nouvel utilisateur social...');
    return await createUserAccount({ ...userData, isRegistered: true });

  } catch (error) {
    console.error('❌ [AUTH] Erreur lors de la connexion sociale:', error);
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
 * Déconnecte un utilisateur. (Nécessite un endpoint backend)
 */
export async function logoutUser(userId: string): Promise<void> {
  console.log(`LOG: logoutUser a été appelé pour l'utilisateur ${userId}. Ce service est principalement côté client ou nécessite un endpoint API pour invalider le token.`);
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