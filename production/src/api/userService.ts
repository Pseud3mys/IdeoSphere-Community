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
 * MOCK: Charge les statistiques (À implémenter côté backend plus tard si besoin)
 */
export async function fetchUserStats(userId: string): Promise<{
  ideasCount: number;
  postsCount: number;
  supportsReceived: number;
  ideasSupported: number;
} | null> {
    // Pour l'instant, on laisse à null, le frontend calculera ça 
    // ou on fera une route dédiée /users/<id>/stats plus tard.
    return null;
}