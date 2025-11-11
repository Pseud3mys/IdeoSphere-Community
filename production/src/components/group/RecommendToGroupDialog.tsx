import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Users, Search, Check } from 'lucide-react';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';
import { useGroupActions } from '../../hooks/useGroupActions';
import { toast } from 'sonner@2.0.3';
import { Group } from '../../types';

interface RecommendToGroupDialogProps {
  contentId: string;
  contentType: 'idea' | 'post';
  contentTitle: string;
  children?: React.ReactNode;
  currentGroupIds?: string[]; // Groupes déjà associés
}

/**
 * Dialog pour recommander un contenu (idée ou post) dans un ou plusieurs groupes
 */
export function RecommendToGroupDialog({
  contentId,
  contentType,
  contentTitle,
  children,
  currentGroupIds = []
}: RecommendToGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  
  const { 
    getAllGroups, 
    getCurrentUser, 
    getUserGroups,
    isUserMemberOfGroup 
  } = useEntityStoreSimple();
  
  const { recommendContentToGroups } = useGroupActions();
  
  const currentUser = getCurrentUser();
  const allGroups = getAllGroups();
  
  // Filtrer les groupes : uniquement ceux dont l'utilisateur est membre
  const userGroups = currentUser 
    ? allGroups.filter(g => isUserMemberOfGroup(currentUser.id, g.id))
    : [];
  
  // Filtrer selon la recherche
  const filteredGroups = userGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Groupes déjà associés au contenu
  const alreadyAssociatedGroupIds = new Set(currentGroupIds);
  
  const handleToggleGroup = (groupId: string) => {
    setSelectedGroupIds(prev => 
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };
  
  const handleRecommend = async () => {
    if (selectedGroupIds.length === 0) {
      toast.error('Veuillez sélectionner au moins un groupe');
      return;
    }
    
    // Vérification de sécurité : s'assurer que selectedGroupIds est un tableau
    if (!Array.isArray(selectedGroupIds)) {
      console.error('❌ [RecommendToGroupDialog] selectedGroupIds n\'est pas un tableau:', selectedGroupIds);
      toast.error('Erreur interne: sélection invalide');
      return;
    }
    
    console.log('🎯 [RecommendToGroupDialog] Recommandation vers:', {
      contentId,
      contentType,
      selectedGroupIds,
      isArray: Array.isArray(selectedGroupIds)
    });
    
    try {
      await recommendContentToGroups(contentId, contentType, selectedGroupIds);
      toast.success(`${contentType === 'idea' ? 'Projet' : 'Post'} recommandé dans ${selectedGroupIds.length} groupe${selectedGroupIds.length > 1 ? 's' : ''}`);
      setIsOpen(false);
      setSelectedGroupIds([]);
      setSearchQuery('');
    } catch (error) {
      console.error('❌ [RecommendToGroupDialog] Erreur:', error);
      toast.error('Erreur lors de la recommandation');
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Users className="w-4 h-4 mr-2" />
            Recommander dans un groupe
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Recommander dans un groupe</DialogTitle>
          <DialogDescription>
            Recommandez "{contentTitle}" aux membres d'un ou plusieurs groupes dont vous faites partie
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {/* Recherche */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Rechercher un groupe..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          {/* Liste des groupes */}
          {currentUser ? (
            filteredGroups.length > 0 ? (
              <div className="space-y-2">
                {filteredGroups.map(group => {
                  const isSelected = selectedGroupIds.includes(group.id);
                  const isAlreadyAssociated = alreadyAssociatedGroupIds.has(group.id);
                  
                  return (
                    <div
                      key={group.id}
                      onClick={() => !isAlreadyAssociated && handleToggleGroup(group.id)}
                      className={`
                        p-3 border rounded-lg transition-all cursor-pointer
                        ${isAlreadyAssociated 
                          ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
                          : isSelected
                            ? 'bg-blue-50 border-blue-300'
                            : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/30'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                          {group.avatar || '📁'}
                        </div>
                        
                        {/* Infos */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-gray-900">{group.name}</span>
                            {isAlreadyAssociated && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                Déjà associé
                              </Badge>
                            )}
                          </div>
                          {group.shortDescription && (
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {group.shortDescription}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {group.memberCount} membres
                          </p>
                        </div>
                        
                        {/* Checkmark */}
                        {!isAlreadyAssociated && (
                          <div className={`
                            w-5 h-5 rounded border flex items-center justify-center flex-shrink-0
                            ${isSelected 
                              ? 'bg-blue-600 border-blue-600' 
                              : 'border-gray-300'
                            }
                          `}>
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-600 mb-1">
                  {searchQuery ? 'Aucun groupe trouvé' : 'Vous n\'êtes membre d\'aucun groupe'}
                </p>
                <p className="text-sm text-gray-500">
                  {searchQuery ? 'Essayez une autre recherche' : 'Rejoignez des groupes pour pouvoir recommander du contenu'}
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Connectez-vous pour recommander ce contenu</p>
            </div>
          )}
        </div>
        
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleRecommend}
            disabled={selectedGroupIds.length === 0 || !currentUser}
          >
            Recommander ({selectedGroupIds.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}