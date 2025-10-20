import { User } from '../types';
import { getFirstCreator } from '../utils/userValidation';

interface CreatorNamesProps {
  creators: User[];
  className?: string;
}

/**
 * Composant robuste pour afficher les noms des créateurs
 * Gère les cas où creators est vide ou contient des données invalides
 */
export function CreatorNames({ creators, className = '' }: CreatorNamesProps) {
  // Vérification de base
  if (!creators || creators.length === 0) {
    console.warn('⚠️ CreatorNames: creators array is empty or undefined');
    return <span className={className}>Créateur inconnu</span>;
  }

  // Valider le premier créateur
  const firstCreator = getFirstCreator(creators);
  
  if (!firstCreator) {
    return <span className={className}>Créateur inconnu</span>;
  }

  // Affichage selon le nombre de créateurs
  if (creators.length === 1) {
    return <span className={className}>{firstCreator.name}</span>;
  }

  if (creators.length === 2) {
    const secondCreator = creators[1];
    if (!secondCreator || !secondCreator.name) {
      return <span className={className}>{firstCreator.name}</span>;
    }
    return <span className={className}>{firstCreator.name} et {secondCreator.name}</span>;
  }

  // Plus de 2 créateurs
  return (
    <span className={className}>
      {firstCreator.name} et {creators.length - 1} autre{creators.length > 2 ? 's' : ''}
    </span>
  );
}
