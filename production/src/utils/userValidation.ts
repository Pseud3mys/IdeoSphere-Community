import { User } from '../types';

/**
 * Valide et normalise un objet User pour éviter les crashes
 * Retourne null si l'utilisateur n'est pas valide
 */
export function validateUser(user: User | string | undefined | null): User | null {
  // Cas 1: user est undefined ou null
  if (!user) {
    // Pas de log - c'est un cas normal dans notre architecture
    return null;
  }

  // Cas 2: user est un string (ID au lieu d'un objet)
  if (typeof user === 'string') {
    console.error('🔴 validateUser: Received user ID instead of User object:', user);
    return null;
  }

  // Cas 3: user est un objet mais manque des propriétés essentielles
  if (!user.id || !user.name) {
    console.error('🔴 validateUser: Invalid User object, missing id or name:', user);
    return null;
  }

  return user;
}

/**
 * Retourne le premier créateur valide d'une liste d'IDs de créateurs
 * Retourne null si aucun créateur valide n'est trouvé
 * @param creatorIds - Tableau d'IDs de créateurs
 * @param getUserById - Fonction pour résoudre un ID en User
 */
export function getFirstCreator(
  creatorIds: string[] | undefined, 
  getUserById: (id: string) => User | undefined
): User | null {
  if (!creatorIds || creatorIds.length === 0) {
    // Pas de log - c'est un cas normal dans notre architecture
    return null;
  }

  const firstCreatorId = creatorIds[0];
  if (!firstCreatorId) {
    console.warn('[getFirstCreator] Premier creatorId est undefined ou vide');
    return null;
  }

  const firstCreator = getUserById(firstCreatorId);
  return validateUser(firstCreator || null);
}

/**
 * Crée un utilisateur par défaut pour les cas où l'utilisateur est manquant
 */
export function getDefaultUser(): User {
  return {
    id: 'unknown',
    name: 'Utilisateur inconnu',
    email: '',
    avatar: '',
    createdAt: new Date(),
    isRegistered: false
  };
}

/**
 * Obtient un utilisateur valide ou retourne un utilisateur par défaut
 */
export function getUserOrDefault(user: User | string | undefined | null): User {
  const validUser = validateUser(user);
  return validUser || getDefaultUser();
}