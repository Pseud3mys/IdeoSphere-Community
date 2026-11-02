import { useEffect } from 'react';
import { GroupBadge } from './GroupBadge';
import { Badge } from '../ui/badge';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';
import { useGroupActions } from '../../hooks/useGroupActions';

interface GroupBadgeListProps {
  groupIds?: string[];
  maxDisplay?: number; // Nombre maximum de badges à afficher
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean; // Afficher "+X" si plus de maxDisplay
}

// Chargement unique de la liste des groupes, partagé par tous les badges de la page
let allGroupsRequest: Promise<void> | null = null;

/**
 * Liste de badges de groupes avec limitation d'affichage.
 * Si un groupe n'est pas encore en mémoire (ex: feed principal), la liste
 * des groupes est chargée une fois pour pouvoir afficher son nom.
 */
export function GroupBadgeList({
  groupIds,
  maxDisplay = 3,
  size = 'sm',
  showCount = true
}: GroupBadgeListProps) {
  const { getGroupById } = useEntityStoreSimple();
  const { loadAllGroups } = useGroupActions();
  const hasMissingGroup = (groupIds || []).some(groupId => !getGroupById(groupId));

  useEffect(() => {
    if (!hasMissingGroup || allGroupsRequest) return;
    allGroupsRequest = loadAllGroups().catch(() => {
      allGroupsRequest = null; // Nouvel essai possible au prochain affichage
    });
  }, [hasMissingGroup]);

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
