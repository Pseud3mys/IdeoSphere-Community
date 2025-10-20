import { User } from '../types';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { getFirstCreator } from '../utils/userValidation';

interface CreatorAvatarProps {
  creators: User[];
  className?: string;
}

/**
 * Composant robuste pour afficher l'avatar du premier créateur
 * Gère les cas où creators est vide ou contient des données invalides
 */
export function CreatorAvatar({ creators, className = 'w-5 h-5' }: CreatorAvatarProps) {
  const creator = getFirstCreator(creators);

  if (!creator) {
    return (
      <Avatar className={className}>
        <AvatarFallback className="text-xs">?</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <Avatar className={className}>
      <AvatarImage src={creator.avatar} alt={creator.name} />
      <AvatarFallback className="text-xs">
        {creator.name ? creator.name.slice(0, 2).toUpperCase() : '?'}
      </AvatarFallback>
    </Avatar>
  );
}
