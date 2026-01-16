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
  const encodedId = encodeURIComponent(userId);

  console.log(`🌐 [API] fetchUserProfile - key: ${encodedId}`);

  try {
    // 2. Appel API GET /users/<key>
    // Cette route backend utilise 'sanitize_users', donc pas d'email dans la réponse.
    const response = await apiClient.get<RawUser>(`/${encodedId}`);
    
    // 3. Transformation des données (RawUser -> User)
    // Gestion des dates, valeurs par défaut, mapping _key -> id
    const user = transformUser(response.data);

    console.log(`✅ [API] fetchUserProfile - Chargé: ${user.name}`);
    return user;

  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      console.warn(`⚠️ [API] fetchUserProfile - Utilisateur ${encodedId} introuvable.`);
      return null;
    }
    console.error(`❌ [API] fetchUserProfile - Erreur:`, error);
    return null;
  }
}

export interface UserStats {
  ideasCount: number;      // Contributions (Idées + Posts)
  ideasSupported: number;  // Engagement (Soutiens donnés)
  supportsReceived: number;// Impact (Soutiens reçus)
}

/**
 * Récupère les statistiques agrégées d'un utilisateur
 */
export async function fetchUserStats(userId: string): Promise<UserStats> {
  // Gestion de l'ID (users/123 -> 123)
  const userKey = userId.includes('/') ? userId.split('/')[1] : userId;
  
  try {
    const response = await apiClient.get<UserStats>(`/users/${userKey}/stats`);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des stats utilisateur:", error);
    // Retour par défaut en cas d'erreur pour ne pas casser l'UI
    return { ideasCount: 0, ideasSupported: 0, supportsReceived: 0 };
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