import { User } from '../types';
import { getFirstCreator } from '../utils/userValidation';

interface CreatorNamesProps {
  creatorIds: string[];
  getUserById: (id: string) => User | undefined;
  className?: string;
}

/**
 * Composant robuste pour afficher les noms des créateurs
 * Gère les cas où creatorIds est vide ou contient des données invalides
 */
export function CreatorNames({ creatorIds, getUserById, className = '' }: CreatorNamesProps) {
  // Vérification de base
  if (!creatorIds || creatorIds.length === 0) {
    console.warn('⚠️ CreatorNames: creatorIds array is empty or undefined');
    return <span className={className}>Créateur inconnu</span>;
  }

  // Valider le premier créateur
  const firstCreator = getFirstCreator(creatorIds, getUserById);
  
  if (!firstCreator) {
    return <span className={className}>Créateur inconnu</span>;
  }

  // Affichage selon le nombre de créateurs
  if (creatorIds.length === 1) {
    return <span className={className}>{firstCreator.name}</span>;
  }

  if (creatorIds.length === 2) {
    const secondCreator = getUserById(creatorIds[1]);
    if (!secondCreator || !secondCreator.name) {
      return <span className={className}>{firstCreator.name}</span>;
    }
    return <span className={className}>{firstCreator.name} et {secondCreator.name}</span>;
  }

  // Plus de 2 créateurs
  return (
    <span className={className}>
      {firstCreator.name} et {creatorIds.length - 1} autre{creatorIds.length > 2 ? 's' : ''}
    </span>
  );
}
