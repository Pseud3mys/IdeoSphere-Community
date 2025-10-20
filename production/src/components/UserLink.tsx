import { User } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { validateUser } from '../utils/userValidation';

interface UserLinkProps {
  user?: User | string; // Peut être undefined, un User ou un ID (string)
  className?: string;
  children?: React.ReactNode;
}

export function UserLink({ user, className = '', children }: UserLinkProps) {
  const { actions } = useEntityStoreSimple();

  // Validation de l'utilisateur
  const validUser = validateUser(user as User);

  // Si l'utilisateur n'est pas valide, afficher un span non-cliquable
  if (!validUser) {
    return <span className={className}>{children || 'Utilisateur inconnu'}</span>;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    actions.goToUser(validUser.id);
  };

  return (
    <button 
      onClick={handleClick}
      className={`text-left hover:text-primary transition-colors cursor-pointer ${className}`}
    >
      {children || validUser.name}
    </button>
  );
}