import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../../hooks/useNavigationActions';
import { Badge } from '../ui/badge';
import { Users } from 'lucide-react';
import { cn } from '../ui/utils';

interface GroupBadgeProps {
  groupId: string;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean; // Si true, cliquable pour naviguer
}

/**
 * Badge pour afficher un groupe
 * Cliquable par défaut pour naviguer vers le groupe
 */
export function GroupBadge({ 
  groupId, 
  size = 'sm', 
  interactive = true 
}: GroupBadgeProps) {
  const { getGroupById, isStoreInitialized } = useEntityStoreSimple();
  const { goToGroup } = useNavigationActions();
  
  // Ne rien afficher si le store n'est pas encore initialisé
  if (!isStoreInitialized()) return null;
  
  const group = getGroupById(groupId);
  
  // Si le groupe n'existe pas, ne rien afficher
  if (!group) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    if (interactive) {
      e.stopPropagation(); // Éviter de déclencher le clic sur la card parente
      goToGroup(groupId);
    }
  };
  
  return (
    <Badge 
      variant="outline" 
      className={cn(
        "gap-1.5 border-blue-200 bg-blue-50 text-blue-700",
        interactive && "cursor-pointer hover:bg-blue-100 transition-colors",
        size === 'sm' && "text-xs",
        size === 'md' && "text-sm",
        size === 'lg' && "text-base"
      )}
      onClick={handleClick}
    >
      <Users className={cn(
        size === 'sm' && "w-3 h-3",
        size === 'md' && "w-4 h-4",
        size === 'lg' && "w-5 h-5"
      )} />
      <span>{group.name}</span>
    </Badge>
  );
}
