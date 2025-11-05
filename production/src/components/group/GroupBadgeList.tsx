import { GroupBadge } from './GroupBadge';
import { Badge } from '../ui/badge';

interface GroupBadgeListProps {
  groupIds?: string[];
  maxDisplay?: number; // Nombre maximum de badges à afficher
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean; // Afficher "+X" si plus de maxDisplay
}

/**
 * Liste de badges de groupes avec limitation d'affichage
 */
export function GroupBadgeList({ 
  groupIds, 
  maxDisplay = 3, 
  size = 'sm',
  showCount = true 
}: GroupBadgeListProps) {
  // Si pas de groupes, ne rien afficher
  if (!groupIds || groupIds.length === 0) return null;
  
  // Groupes à afficher (limités par maxDisplay)
  const displayGroups = groupIds.slice(0, maxDisplay);
  // Nombre de groupes restants non affichés
  const remainingCount = groupIds.length - maxDisplay;
  
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {displayGroups.map(groupId => (
        <GroupBadge key={groupId} groupId={groupId} size={size} />
      ))}
      {showCount && remainingCount > 0 && (
        <Badge variant="outline" className="text-xs text-muted-foreground border-gray-300">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}
