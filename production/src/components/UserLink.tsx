import { Link } from 'react-router-dom';
import { User } from '../types';
import { validateUser } from '../utils/userValidation';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { cleanId } from '../utils/idUtils';

interface UserLinkProps {
  user?: User | string; // Peut être undefined, un User ou un ID (string)
  userId?: string; // Alternative: passer directement un userId
  className?: string;
  children?: React.ReactNode;
}

export function UserLink({ user, userId, className = '', children }: UserLinkProps) {
  const { getUserById } = useEntityStoreSimple();

  // Si userId est fourni, résoudre l'utilisateur depuis le store
  let resolvedUser: User | null = null;
  
  if (userId) {
    const userFromStore = getUserById(userId);
    resolvedUser = validateUser(userFromStore || null);
  } else if (user) {
    // Si user est fourni directement
    resolvedUser = validateUser(user as User);
  }

  // Si l'utilisateur n'est pas valide, afficher un span non-cliquable
  if (!resolvedUser) {
    return <span className={className}>{children || 'Utilisateur inconnu'}</span>;
  }

  // ✅ Nettoyer l'ID pour éviter les doublons de préfixe (users/users/123)
  const cleanUserId = cleanId(resolvedUser.id);

  return (
    <Link
      to={`/user/${cleanUserId}`}
      className={`hover:text-primary transition-colors ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {children || resolvedUser.name}
    </Link>
  );
}