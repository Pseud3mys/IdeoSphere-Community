import { User } from '../types';
import { getFirstCreator } from '../utils/userValidation';
import { UserLink } from './UserLink';

interface CreatorNamesProps {
  creatorIds: string[];
  getUserById: (id: string) => User | undefined;
  className?: string;
}

/**
 * Composant robuste pour afficher les noms des créateurs (cliquables)
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
    return (
      <UserLink userId={firstCreator.id} className={`${className} hover:underline`}>
        {firstCreator.name}
      </UserLink>
    );
  }

  if (creatorIds.length === 2) {
    const secondCreator = getUserById(creatorIds[1]);
    if (!secondCreator || !secondCreator.name) {
      return (
        <UserLink userId={firstCreator.id} className={`${className} hover:underline`}>
          {firstCreator.name}
        </UserLink>
      );
    }
    return (
      <span className={className}>
        <UserLink userId={firstCreator.id} className="hover:underline">
          {firstCreator.name}
        </UserLink>
        {' et '}
        <UserLink userId={secondCreator.id} className="hover:underline">
          {secondCreator.name}
        </UserLink>
      </span>
    );
  }

  // Plus de 2 créateurs
  return (
    <span className={className}>
      <UserLink userId={firstCreator.id} className="hover:underline">
        {firstCreator.name}
      </UserLink>
      {' et '}{creatorIds.length - 1} autre{creatorIds.length > 2 ? 's' : ''}
    </span>
  );
}