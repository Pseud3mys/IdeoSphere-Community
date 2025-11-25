/**
 * CreateGroupLinkDialog.tsx
 * 
 * Dialog pour créer un nouveau lien entre groupes (Phase 4)
 * Formulaire en 2 étapes : Type de lien → Sélection du groupe
 */

import { useState, useEffect, useMemo } from 'react';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';
import { useGroupLinkActions } from '../../hooks/useGroupLinkActions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Badge } from '../ui/badge';
import { 
  ArrowDown, 
  ArrowLeftRight, 
  Search, 
  Loader2,
  Check,
  ChevronLeft,
  Lightbulb,
  Users
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Group } from '../../types';

interface CreateGroupLinkDialogProps {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateGroupLinkDialog({ 
  groupId, 
  open, 
  onOpenChange 
}: CreateGroupLinkDialogProps) {
  const { 
    getGroupById, 
    getAllGroups,
    getGroupLinks,
    getCurrentUser,
    store // ✅ Ajouter store pour forcer le re-render
  } = useEntityStoreSimple();
  const { createVerticalLink, createHorizontalLink } = useGroupLinkActions();

  // États du formulaire en 2 étapes
  const [step, setStep] = useState<1 | 2>(1);
  const [linkType, setLinkType] = useState<'vertical' | 'horizontal'>('vertical');
  const [verticalRole, setVerticalRole] = useState<'parent' | 'child'>('parent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const currentUser = getCurrentUser();
  const currentGroup = getGroupById(groupId);
  
  // ✅ Lire le store.groups pour forcer le re-render quand il change
  const _ = store.groups;
  
  const allGroups = getAllGroups();
  const links = getGroupLinks(groupId);

  // Réinitialiser le formulaire quand le dialog s'ouvre/ferme
  useEffect(() => {
    if (!open) {
      setStep(1);
      setLinkType('vertical');
      setVerticalRole('parent');
      setSearchQuery('');
      setSelectedGroupId(null);
    }
  }, [open]);

  // Filtrer les groupes disponibles
  const availableGroups = useMemo(() => {
    // IDs des groupes déjà liés
    const linkedGroupIds = new Set<string>();
    links.parentLinks.forEach(l => linkedGroupIds.add(l.parentGroupId));
    links.childLinks.forEach(l => linkedGroupIds.add(l.childGroupId));
    links.partnerLinks.forEach(l => {
      linkedGroupIds.add(l.groupId1);
      linkedGroupIds.add(l.groupId2);
    });

    return allGroups
      .filter(g => g.id !== groupId) // Exclure le groupe actuel
      .filter(g => !linkedGroupIds.has(g.id)) // Exclure les groupes déjà liés
      .filter(g => g.isActive) // Seulement les groupes actifs
      .filter(g => {
        // Filtrer par recherche
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
          g.name.toLowerCase().includes(query) ||
          g.shortDescription.toLowerCase().includes(query) ||
          g.tags.some(tag => tag.toLowerCase().includes(query))
        );
      });
  }, [allGroups, groupId, links, searchQuery]);

  // Gérer la création du lien
  const handleCreate = async () => {
    if (!selectedGroupId || !currentUser?.isRegistered) {
      toast.error('Veuillez sélectionner un groupe');
      return;
    }

    setIsCreating(true);
    try {
      if (linkType === 'vertical') {
        // Déterminer qui est parent et qui est enfant
        const parentId = verticalRole === 'parent' ? selectedGroupId : groupId;
        const childId = verticalRole === 'parent' ? groupId : selectedGroupId;
        
        await createVerticalLink(parentId, childId);
      } else {
        await createHorizontalLink(groupId, selectedGroupId);
      }

      onOpenChange(false);
    } catch (error) {
      console.error('❌ [CreateGroupLinkDialog] Erreur création lien:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!currentGroup) return null;

  const selectedGroup = selectedGroupId ? getGroupById(selectedGroupId) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Type de connexion' : 'Choisir un groupe'}
          </DialogTitle>
          <DialogDescription>
            {step === 1 
              ? 'Quel type de relation souhaitez-vous établir ?'
              : `Connectez ${currentGroup.name} à un autre groupe`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* ÉTAPE 1 : Type de lien */}
          {step === 1 && (
            <div className="space-y-3">
              <RadioGroup value={linkType} onValueChange={(v) => setLinkType(v as 'vertical' | 'horizontal')}>
                {/* Lien hiérarchique */}
                <div 
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    linkType === 'vertical' 
                      ? 'border-blue-300 bg-blue-50/50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setLinkType('vertical')}
                >
                  <RadioGroupItem value="vertical" id="vertical" className="mt-1" />
                  <label htmlFor="vertical" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ArrowDown className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Groupe parent/enfant</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Pour organiser votre groupe en sous-groupes thématiques ou géographiques.
                    </p>
                    <div className="text-xs text-gray-500 bg-white/80 rounded px-2 py-1 inline-block">
                      Exemple : Ville → Quartiers, Thème général → Thèmes spécifiques
                    </div>
                  </label>
                </div>

                {/* Lien de collaboration/inspiration */}
                <div 
                  className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    linkType === 'horizontal' 
                      ? 'border-purple-300 bg-purple-50/50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setLinkType('horizontal')}
                >
                  <RadioGroupItem value="horizontal" id="horizontal" className="mt-1" />
                  <label htmlFor="horizontal" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="font-semibold text-gray-900">Inspiration & Collaboration</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Pour créer des ponts entre groupes complémentaires, échanger des idées et collaborer.
                    </p>
                    <div className="text-xs text-gray-500 bg-white/80 rounded px-2 py-1 inline-block">
                      Exemple : Groupes voisins, thématiques similaires, partenaires
                    </div>
                  </label>
                </div>
              </RadioGroup>

              {/* Rôle vertical (si lien vertical) */}
              {linkType === 'vertical' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <Label className="text-sm font-medium text-gray-900">Le groupe que vous allez sélectionner sera :</Label>
                  <RadioGroup value={verticalRole} onValueChange={(v) => setVerticalRole(v as 'parent' | 'child')}>
                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <RadioGroupItem value="parent" id="parent" />
                      <label htmlFor="parent" className="flex-1 cursor-pointer">
                        <span className="font-medium">Groupe parent de <span className="text-blue-600">{currentGroup.name}</span></span>
                      </label>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white border rounded-lg">
                      <RadioGroupItem value="child" id="child" />
                      <label htmlFor="child" className="flex-1 cursor-pointer">
                        <span className="font-medium">Groupe enfant de <span className="text-blue-600">{currentGroup.name}</span></span>
                      </label>
                    </div>
                  </RadioGroup>
                </div>
              )}
            </div>
          )}

          {/* ÉTAPE 2 : Sélection du groupe */}
          {step === 2 && (
            <>
              {/* Recherche de groupe */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, description ou tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
              </div>

              {/* Liste des groupes */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                {availableGroups.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>
                      {searchQuery 
                        ? "Aucun groupe trouvé pour cette recherche"
                        : "Aucun groupe disponible"}
                    </p>
                  </div>
                ) : (
                  availableGroups.map((group) => (
                    <GroupSelectItem
                      key={group.id}
                      group={group}
                      isSelected={selectedGroupId === group.id}
                      onSelect={() => setSelectedGroupId(group.id)}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {step === 2 && (
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                disabled={isCreating}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreating}
            >
              Annuler
            </Button>
            
            {step === 1 ? (
              <Button onClick={() => setStep(2)}>
                Continuer
              </Button>
            ) : (
              <Button
                onClick={handleCreate}
                disabled={!selectedGroupId || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Créer la connexion
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Composant pour afficher un groupe sélectionnable
 */
interface GroupSelectItemProps {
  group: Group;
  isSelected: boolean;
  onSelect: () => void;
}

function GroupSelectItem({ group, isSelected, onSelect }: GroupSelectItemProps) {
  return (
    <div
      className={`
        flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all
        ${isSelected 
          ? 'bg-blue-50 border-blue-300 shadow-sm' 
          : 'hover:bg-gray-50 hover:border-gray-300'
        }
      `}
      onClick={onSelect}
    >
      <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
        {group.avatar || '📁'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{group.name}</span>
          {isSelected && <Check className="h-4 w-4 text-blue-600 flex-shrink-0" />}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {group.shortDescription}
        </p>
        {group.tags.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {group.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}