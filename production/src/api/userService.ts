import apiClient from './apiClient';
import { User } from '../types';
import { transformUser, RawUser } from './transformService';

/**
 * Service API pour les opérations utilisateurs
 * Charge les profils depuis le backend ArangoDB
 */

/**
 * Charge le profil PUBLIC d'un utilisateur.
 * Le backend se charge de retirer les données sensibles (email, keycloakId).
 * * @param userId - ID de l'utilisateur (ex: "123" ou "users/123")
 * @returns Profil utilisateur public ou null si non trouvé
 */
export async function fetchUserProfile(userId: string): Promise<User | null> {
  // 1. Nettoyage de l'ID : L'API attend "123" et non "users/123" pour la route /users/<key>
  const cleanKey = userId.replace('users/', '');
  
  console.log(`🌐 [API] fetchUserProfile - key: ${cleanKey}`);

  try {
    // 2. Appel API GET /users/<key>
    // Cette route backend utilise 'sanitize_users', donc pas d'email dans la réponse.
    const response = await apiClient.get<RawUser>(`/users/${cleanKey}`);
    
    // 3. Transformation des données (RawUser -> User)
    // Gestion des dates, valeurs par défaut, mapping _key -> id
    const user = transformUser(response.data);

    console.log(`✅ [API] fetchUserProfile - Chargé: ${user.name}`);
    return user;

  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn(`⚠️ [API] fetchUserProfile - Utilisateur ${cleanKey} introuvable.`);
      return null;
    }
    console.error(`❌ [API] fetchUserProfile - Erreur:`, error);
    return null;
  }
}

/**
 * Charge les statistiques d'un utilisateur
 */
export async function fetchUserStats(userId: string): Promise<{
  ideasCount: number;
  postsCount: number; // Note: Le backend retourne "ideasCount" qui englobe tout pour l'instant
  supportsReceived: number;
  ideasSupported: number;
} | null> {
  // Nettoyage de l'ID si nécessaire (ex: "users/123" -> "123")
  const cleanKey = userId.replace('users/', '');
  
  console.log(`🌐 [API] fetchUserStats - key: ${cleanKey}`);
  
  try {
    const response = await apiClient.get<{
        ideasCount: number;
        ideasSupported: number;
        supportsReceived: number;
    }>(`/users/${cleanKey}/stats`);

    const data = response.data;

    return {
      ideasCount: data.ideasCount, 
      postsCount: 0, // Optionnel : si vous voulez séparer plus tard, il faudra adapter l'AQL
      supportsReceived: data.supportsReceived,
      ideasSupported: data.ideasSupported
    };
  } catch (error) {
    console.error(`❌ [API] fetchUserStats - Erreur:`, error);
    return null;
  }
}

/**
 * Inscription à la newsletter
 * @param email - Email pour l'inscription
 * @param frequency - Fréquence de la newsletter (daily, weekly, monthly, important)
 * @param location - Localisation pour la newsletter
 * @returns true si l'inscription a réussi
 */
export async function subscribeToNewsletterOnApi(email: string, frequency: string = 'weekly', location: string = ''): Promise<boolean> {
  
  console.log(`🔄 [API] Inscription à la newsletter pour: ${email}, fréquence: ${frequency}, lieu: ${location}`);
  
  try {
    // Appel API POST /newsletter/subscribe
    const response = await apiClient.post('/newsletter/subscribe', {
      email: email,
      frequency: frequency,
      location: location
    });
    
    // Vérifier que le backend a retourné success: true
    if (response.data && response.data.success) {
      console.log(`✅ [API] Inscription à la newsletter réussie pour: ${email}`);
      return true;
    } else {
      console.warn(`⚠️ [API] Inscription échouée: ${response.data?.message || 'Erreur inconnue'}`);
      return false;
    }
    
  } catch (error: any) {
    console.error('❌ [API] Erreur lors de l\'inscription à la newsletter:', error);
    
    // Afficher le message d'erreur du backend si disponible
    if (error.response?.data?.message) {
      console.error(`Message d'erreur: ${error.response.data.message}`);
    }
    
    return false;
  }
}