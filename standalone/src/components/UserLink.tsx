import { User } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

interface UserLinkProps {
  user: User;
  className?: string;
  children?: React.ReactNode;
}

export function UserLink({ user, className = '', children }: UserLinkProps) {
  const { actions } = useEntityStoreSimple();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    actions.goToUser(user.id);
  };

  return (
    <button 
      onClick={handleClick}
      className={`text-left hover:text-primary transition-colors cursor-pointer ${className}`}
    >
      {children || user.name}
    </button>
  );
}