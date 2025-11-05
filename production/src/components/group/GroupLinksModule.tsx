/**
 * GroupLinksModule.tsx
 * 
 * Module d'affichage et de gestion des liens entre groupes (Phase 4)
 * 
 * Affiche :
 * - Liens verticaux (parents/enfants)
 * - Liens horizontaux (partenaires)
 * - Bouton de création (pour animateurs)
 * - Bouton de suppression (pour animateurs)
 */

import { useState, useEffect } from 'react';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';
import { useGroupLinkActions } from '../../hooks/useGroupLinkActions';
import { useNavigationActions } from '../../hooks/useNavigationActions';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { GroupTypeBadge } from './GroupTypeBadge';
import { 
  Link as LinkIcon, 
  ArrowDown, 
  ArrowUp, 
  ArrowLeftRight, 
  Plus, 
  Trash2,
  Loader2,
  Network,
  ChevronRight
} from 'lucide-react';
import { CreateGroupLinkDialog } from './CreateGroupLinkDialog';
import { toast } from 'sonner@2.0.3';
import { VerticalGroupLink, HorizontalGroupLink } from '../../types';

interface GroupLinksModuleProps {
  groupId: string;
  isAnimator?: boolean; // Si true, affiche les boutons de gestion
}

export function GroupLinksModule({ groupId, isAnimator = false }: GroupLinksModuleProps) {
  const { 
    getGroupById, 
    getGroupLinks,
    getCurrentUser 
  } = useEntityStoreSimple();
  const { loadGroupLinks, deleteGroupLink } = useGroupLinkActions();

  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [deletingLinkId, setDeletingLinkId] = useState<string | null>(null);

  const currentUser = getCurrentUser();
  const group = getGroupById(groupId);
  const links = getGroupLinks(groupId);

  // Charger les liens au montage
  useEffect(() => {
    const loadLinks = async () => {
      setIsLoading(true);
      try {
        await loadGroupLinks(groupId);
      } catch (error) {
        console.error('❌ [GroupLinksModule] Erreur chargement liens:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLinks();
  }, [groupId]);

  // Gérer la suppression d'un lien
  const handleDeleteLink = async (linkId: string) => {
    if (!currentUser || !currentUser.isRegistered) {
      toast.error('Vous devez être connecté pour supprimer un lien');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lien ?')) {
      return;
    }

    setDeletingLinkId(linkId);
    try {
      await deleteGroupLink(linkId);
    } catch (error) {
      console.error('❌ [GroupLinksModule] Erreur suppression lien:', error);
    } finally {
      setDeletingLinkId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (!group) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Groupe introuvable</p>
      </Card>
    );
  }

  const { parentLinks, childLinks, partnerLinks } = links;
  const hasNoLinks = parentLinks.length === 0 && childLinks.length === 0 && partnerLinks.length === 0;

  return (
    <div className="space-y-6">
      {/* Header avec bouton de création */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Liens avec d'autres groupes</h3>
        </div>
        {isAnimator && (
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            size="sm"
            disabled={!currentUser?.isRegistered}
          >
            <Plus className="h-4 w-4 mr-2" />
            Créer un lien
          </Button>
        )}
      </div>

      {/* Message si aucun lien */}
      {hasNoLinks && (
        <Card className="p-8 text-center border-dashed">
          <LinkIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="mb-2">Aucun lien pour le moment</h4>
          <p className="text-sm text-muted-foreground mb-4">
            {isAnimator
              ? "Créez des liens pour connecter ce groupe à d'autres groupes du territoire."
              : "Ce groupe n'est pas encore lié à d'autres groupes."}
          </p>
        </Card>
      )}

      {/* Groupes parents */}
      {parentLinks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <ArrowUp className="h-4 w-4 text-blue-500" />
            <span>Groupes parents ({parentLinks.length})</span>
          </div>
          <div className="space-y-2">
            {parentLinks.map((link) => (
              <GroupLinkItem
                key={link.id}
                link={link}
                currentGroupId={groupId}
                type="parent"
                isAnimator={isAnimator}
                onDelete={handleDeleteLink}
                isDeleting={deletingLinkId === link.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Groupes enfants */}
      {childLinks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <ArrowDown className="h-4 w-4 text-green-500" />
            <span>Groupes enfants ({childLinks.length})</span>
          </div>
          <div className="space-y-2">
            {childLinks.map((link) => (
              <GroupLinkItem
                key={link.id}
                link={link}
                currentGroupId={groupId}
                type="child"
                isAnimator={isAnimator}
                onDelete={handleDeleteLink}
                isDeleting={deletingLinkId === link.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Groupes connectés (inspiration & collaboration) */}
      {partnerLinks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            <ArrowLeftRight className="h-4 w-4 text-purple-500" />
            <span>Inspiration & Collaboration ({partnerLinks.length})</span>
          </div>
          <div className="space-y-2">
            {partnerLinks.map((link) => (
              <GroupLinkItem
                key={link.id}
                link={link}
                currentGroupId={groupId}
                type="partner"
                isAnimator={isAnimator}
                onDelete={handleDeleteLink}
                isDeleting={deletingLinkId === link.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* Dialog de création */}
      <CreateGroupLinkDialog
        groupId={groupId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
}

/**
 * Composant pour afficher un lien individuel
 */
interface GroupLinkItemProps {
  link: VerticalGroupLink | HorizontalGroupLink;
  currentGroupId: string;
  type: 'parent' | 'child' | 'partner';
  isAnimator: boolean;
  onDelete: (linkId: string) => void;
  isDeleting: boolean;
}

function GroupLinkItem({ 
  link, 
  currentGroupId, 
  type, 
  isAnimator, 
  onDelete,
  isDeleting 
}: GroupLinkItemProps) {
  const { getGroupById, isStoreInitialized } = useEntityStoreSimple();
  const { goToGroup } = useNavigationActions();
  
  // Ne rien afficher si le store n'est pas encore initialisé
  if (!isStoreInitialized()) return null;
  
  // Trouver l'autre groupe (celui qui n'est pas le groupe courant)
  let linkedGroupId: string;
  if (link.type === 'vertical') {
    linkedGroupId = link.parentGroupId === currentGroupId ? link.childGroupId : link.parentGroupId;
  } else {
    linkedGroupId = link.groupId1 === currentGroupId ? link.groupId2 : link.groupId1;
  }

  const linkedGroup = getGroupById(linkedGroupId);

  if (!linkedGroup) {
    return null;
  }

  return (
    <div className="group flex items-center justify-between py-3 px-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      {/* Contenu cliquable */}
      <div 
        className="flex items-center gap-3 flex-1 cursor-pointer"
        onClick={() => goToGroup(linkedGroupId)}
      >
        {/* Avatar */}
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-base flex-shrink-0">
          {linkedGroup.avatar || '📁'}
        </div>
        
        {/* Infos */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{linkedGroup.name}</span>
            <GroupTypeBadge type={linkedGroup.type} size="sm" />
          </div>
          {linkedGroup.shortDescription && (
            <p className="text-sm text-gray-500 truncate mt-0.5">
              {linkedGroup.shortDescription}
            </p>
          )}
        </div>

        {/* Icône de navigation */}
        <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Bouton de suppression (animateurs seulement) */}
      {isAnimator && (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation(); // Empêcher la navigation
            onDelete(link.id);
          }}
          disabled={isDeleting}
          className="ml-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4 text-gray-400 hover:text-red-500" />
          )}
        </Button>
      )}
    </div>
  );
}
