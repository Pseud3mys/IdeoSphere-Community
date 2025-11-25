/**
 * MyGroupsPage - Affiche les groupes de l'utilisateur (actifs + pending)
 * 
 * Deux sections :
 * - Mes Groupes Actifs (groupes où je suis membre)
 * - Groupes en Attente (pending où je suis fondateur)
 */

import { useState, useEffect, useMemo } from 'react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useGroupActions } from '../hooks/useGroupActions';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Loader2, Users, Clock, Plus, RefreshCw } from 'lucide-react';
import { GroupCard } from './group/GroupCard';
import { PendingGroupCard } from './PendingGroupCard';
import { CreateGroupFlow } from './CreateGroupFlow';
import { toast } from 'sonner@2.0.3';

export function MyGroupsPage() {
  const { getUserGroups, getUserPendingGroupCreations, currentUser, isUserMemberOfGroup, store, actions, getUserById } = useEntityStoreSimple();
  const { loadMyGroups, joinGroup, leaveGroup, confirmGroupFounder } = useGroupActions();
  const { goToGroup, goToPendingGroup } = useNavigationActions();

  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Charger les groupes de l'utilisateur au montage
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        return;
      }
      
      setIsLoading(true);
      try {
        await loadMyGroups();
      } catch (error) {
        console.error('❌ [MyGroupsPage] Erreur chargement:', error);
        toast.error('Erreur lors du chargement de vos groupes');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentUser?.id]);

  // ✅ Lire le store.pendingGroupCreations pour forcer le re-render quand il change
  // Cette ligne force React à re-rendre le composant quand pendingGroupCreations change
  const _ = store.pendingGroupCreations;
  
  // ✅ Appeler les sélecteurs directement - ils lisent toujours la dernière valeur du store
  const myActiveGroups = currentUser ? getUserGroups(currentUser.id) : [];
  const myPendingGroups = currentUser ? getUserPendingGroupCreations(currentUser.id) : [];
  
  console.log('🔍 [MyGroupsPage] Render:', {
    pendingCount: myPendingGroups.length,
    activeCount: myActiveGroups.length,
    storeHasPending: Object.keys(store.pendingGroupCreations).length
  });

  const handleJoinGroup = async (groupId: string) => {
    try {
      await joinGroup(groupId);
      toast.success('Vous avez rejoint le groupe !');
    } catch (error) {
      console.error('❌ [MyGroupsPage] Erreur joinGroup:', error);
      toast.error('Erreur lors de l\'adhésion au groupe');
    }
  };

  const handleViewGroup = (groupId: string) => {
    if (goToGroup) {
      goToGroup(groupId);
    }
  };

  const handleConfirmPending = async (pendingId: string) => {
    try {
      await confirmGroupFounder(pendingId);
      toast.success('Confirmation enregistrée !');
    } catch (error) {
      console.error('❌ [MyGroupsPage] Erreur confirmGroupFounder:', error);
      toast.error('Erreur lors de la confirmation');
    }
  };

  const handleViewPendingDetails = (pendingId: string) => {
    if (goToPendingGroup) {
      goToPendingGroup(pendingId);
    }
  };

  // 🔧 FONCTION DE DEBUG : Connexion rapide pour les tests
  const handleQuickLogin = (userId: string) => {
    const user = getUserById(userId);
    if (user) {
      actions.setCurrentUserId(userId);
      toast.success(`Connecté en tant que ${user.name}`);
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 🔧 DEBUG : Boutons de connexion rapide */}
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-2xl mx-auto">
          <p className="text-sm mb-3 text-center">🔧 <strong>Mode Debug</strong> - Connectez-vous pour tester :</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button size="sm" variant="outline" onClick={() => handleQuickLogin('1')}>
              Marie Dubois (fondatrice pg1, pg3)
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleQuickLogin('4')}>
              Thomas Bernard (fondateur pg2)
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleQuickLogin('5')}>
              Emma Rousseau (fondatrice pg2, pg3)
            </Button>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-600">Vous devez être connecté pour voir vos groupes.</p>
          <p className="text-sm text-muted-foreground mt-2">Utilisez les boutons ci-dessus pour vous connecter en mode test.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6 md:mb-8">
        <div className="flex-1">
          <h1 className="flex items-center gap-2 mb-2">
            <Users className="w-6 h-6" />
            Mes Groupes
          </h1>
          <p className="text-gray-600">
            Gérez vos groupes actifs et suivez vos créations en attente de confirmation
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={async () => {
              setIsLoading(true);
              try {
                await loadMyGroups();
                toast.success('Groupes rechargés');
              } catch (error) {
                toast.error('Erreur lors du rechargement');
              } finally {
                setIsLoading(false);
              }
            }}
            className="flex-1 md:flex-none"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Rafraîchir</span>
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="flex-1 md:flex-none shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Créer un groupe</span>
            <span className="md:hidden">Créer</span>
          </Button>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="active" className="w-full">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="w-full md:w-auto inline-flex">
            <TabsTrigger value="active" className="flex-1 md:flex-none whitespace-nowrap">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Groupes actifs ({myActiveGroups.length})</span>
              <span className="md:hidden">Actifs ({myActiveGroups.length})</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 md:flex-none whitespace-nowrap">
              <Clock className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">En attente ({myPendingGroups.length})</span>
              <span className="md:hidden">Attente ({myPendingGroups.length})</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Groupes actifs */}
        <TabsContent value="active" className="mt-6">
          {myActiveGroups.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">Aucun groupe actif</h3>
              <p className="text-gray-600 mb-4">
                Rejoignez des groupes ou créez-en un nouveau !
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un groupe
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myActiveGroups.map(group => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={isUserMemberOfGroup(currentUser.id, group.id)}
                  onJoin={() => handleJoinGroup(group.id)}
                  onClick={() => handleViewGroup(group.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Groupes en attente */}
        <TabsContent value="pending" className="mt-6">
          {myPendingGroups.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg mb-2">Aucun groupe en attente</h3>
              <p className="text-gray-600 mb-4">
                Les groupes que vous créez apparaîtront ici en attendant la confirmation des co-fondateurs.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Créer un groupe
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {myPendingGroups.map(pendingGroup => (
                <PendingGroupCard
                  key={pendingGroup.id}
                  pendingGroup={pendingGroup}
                  onConfirm={() => handleConfirmPending(pendingGroup.id)}
                  onViewDetails={() => handleViewPendingDetails(pendingGroup.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog de création */}
      <CreateGroupFlow
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}