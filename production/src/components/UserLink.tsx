import { Link } from 'react-router-dom';
import { User } from '../types';
import { validateUser } from '../utils/userValidation';

interface UserLinkProps {
  user?: User | string; // Peut être undefined, un User ou un ID (string)
  className?: string;
  children?: React.ReactNode;
}

export function UserLink({ user, className = '', children }: UserLinkProps) {
  // Validation de l'utilisateur
  const validUser = validateUser(user as User);

  // Si l'utilisateur n'est pas valide, afficher un span non-cliquable
  if (!validUser) {
    return <span className={className}>{children || 'Utilisateur inconnu'}</span>;
  }

  return (
    <Link
      to={`/user/${validUser.id}`}
      className={`hover:text-primary transition-colors ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children || validUser.name}
    </Link>
  );
}