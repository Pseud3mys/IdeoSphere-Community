import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEntityStoreSimple, useGroupActions, useNavigationActions } from "../hooks";
import { GroupCard } from "./group/GroupCard";
import { GroupTypeFilter } from "./group/GroupTypeFilter";
import { GroupParticipationFilter, ParticipationFilter } from "./group/GroupParticipationFilter";
import { PendingGroupCard } from "./PendingGroupCard";
import { CreateGroupFlow } from "./CreateGroupFlow";
import { Input } from "./ui/input";
import { Search, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { GroupType } from "../types";
import { toast } from "sonner@2.0.3";

export function GroupsExplorerPage() {
  const navigate = useNavigate();
  const {
    getAllGroups,
    getUserGroups,
    getGroupsByType,
    searchGroups,
    isUserMemberOfGroup,
    getCurrentUser,
    getUserPendingGroupCreations,
    store
  } = useEntityStoreSimple();

  const currentUser = getCurrentUser();
  const groupActions = useGroupActions();
  const { goToGroup, goToPendingGroup } = useNavigationActions();

  const [participationFilter, setParticipationFilter] = useState<ParticipationFilter>("all");
  const [selectedType, setSelectedType] = useState<GroupType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Charger les groupes au montage
  useEffect(() => {
    const loadGroups = async () => {
      setIsLoading(true);
      try {
        await groupActions.loadAllGroups();
        if (currentUser) {
          await groupActions.loadMyMemberships();
          await groupActions.loadMyGroups();
        }
      } catch (error) {
        console.error("Erreur lors du chargement des groupes:", error);
        toast.error("Erreur lors du chargement des groupes");
      } finally {
        setIsLoading(false);
      }
    };

    loadGroups();
  }, []);

  // Filtrer les groupes selon le type sélectionné et la recherche
  const getFilteredGroups = () => {
    let filtered = getAllGroups();

    // Filtrer par participation (tous/mes groupes)
    if (participationFilter === "my") {
      filtered = currentUser ? getUserGroups(currentUser.id) : [];
    }
    // "pending" est géré séparément car ce ne sont pas des groupes actifs

    // Filtrer par type
    if (selectedType !== "all") {
      filtered = filtered.filter(group => group.type === selectedType);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(query) ||
          group.description.toLowerCase().includes(query) ||
          group.shortDescription.toLowerCase().includes(query) ||
          group.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredGroups = getFilteredGroups();
  
  // ✅ Lire le store.pendingGroupCreations pour forcer le re-render quand il change
  const _ = store.pendingGroupCreations;
  
  // ✅ Appeler le sélecteur directement - il lit toujours la dernière valeur du store
  const myPendingGroups = currentUser ? getUserPendingGroupCreations(currentUser.id) : [];
  
  console.log('🔍 [GroupsExplorerPage] Render:', {
    pendingCount: myPendingGroups.length,
    storeHasPending: Object.keys(store.pendingGroupCreations).length,
    currentUserId: currentUser?.id
  });
  
  // Filtrer les pending selon la recherche
  const filteredPendingGroups = searchQuery.trim()
    ? myPendingGroups.filter((pg) =>
        pg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pg.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : myPendingGroups;

  const handleJoinGroup = async (groupId: string) => {
    if (!currentUser || !currentUser.isRegistered) {
      toast.error("Veuillez vous enregistrer pour rejoindre un groupe");
      return;
    }

    try {
      await groupActions.joinGroup(groupId);
      toast.success("Vous avez rejoint le groupe !");
    } catch (error) {
      console.error("Erreur lors de l'adhésion au groupe:", error);
      toast.error("Erreur lors de l'adhésion au groupe");
    }
  };

  const handleConfirmPending = async (pendingId: string) => {
    if (!currentUser || !currentUser.isRegistered) {
      toast.error("Vous devez être connecté");
      return;
    }

    try {
      await groupActions.confirmGroupFounder(pendingId);
      toast.success("Confirmation enregistrée !");
    } catch (error) {
      console.error("Erreur lors de la confirmation:", error);
      toast.error("Erreur lors de la confirmation");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement des groupes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
      {/* En-tête */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="mb-2">Groupes</h1>
            <p className="text-muted-foreground">
              Découvrez et rejoignez les groupes de la plateforme
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden md:inline">Créer un groupe</span>
            <span className="md:hidden">Créer</span>
          </Button>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Rechercher un groupe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtres */}
        <div className="space-y-4">
          {/* Filtre de participation */}
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Participation</label>
            <GroupParticipationFilter
              selectedFilter={participationFilter}
              onFilterChange={setParticipationFilter}
              myGroupsCount={currentUser ? getUserGroups(currentUser.id).length : 0}
              pendingCount={myPendingGroups.length}
            />
          </div>

          {/* Filtres par type (seulement si pas en mode "pending") */}
          {participationFilter !== "pending" && (
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Type de groupe</label>
              <GroupTypeFilter
                selectedType={selectedType}
                onFilterChange={setSelectedType}
              />
            </div>
          )}
        </div>
      </div>

      {/* Liste des groupes actifs */}
      {participationFilter !== "pending" && (
        <>
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery || selectedType !== "all" || participationFilter === "my"
                  ? "Aucun groupe ne correspond à vos critères de recherche"
                  : "Aucun groupe disponible pour le moment"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGroups.map((group) => (
                <GroupCard
                  key={group.id}
                  group={group}
                  isMember={currentUser ? isUserMemberOfGroup(currentUser.id, group.id) : false}
                  onJoin={() => handleJoinGroup(group.id)}
                  onClick={() => goToGroup(group.id)}
                />
              ))}
            </div>
          )}

          {/* Statistiques */}
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              {filteredGroups.length} groupe{filteredGroups.length > 1 ? "s" : ""}{" "}
              {participationFilter === "my" && "actif" + (filteredGroups.length > 1 ? "s" : "")}
            </p>
          </div>
        </>
      )}

      {/* Liste des groupes en attente */}
      {participationFilter === "pending" && (
        <>
          {filteredPendingGroups.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? "Aucun groupe en attente ne correspond à votre recherche"
                  : "Aucun groupe en attente"}
              </p>
              {!currentUser?.isRegistered && (
                <p className="text-sm text-muted-foreground">
                  Connectez-vous pour créer un groupe
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPendingGroups.map((pendingGroup) => (
                <PendingGroupCard
                  key={pendingGroup.id}
                  pendingGroup={pendingGroup}
                  onConfirm={() => handleConfirmPending(pendingGroup.id)}
                  onViewDetails={() => goToPendingGroup && goToPendingGroup(pendingGroup.id)}
                />
              ))}
            </div>
          )}

          {/* Statistiques */}
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>
              {filteredPendingGroups.length} groupe{filteredPendingGroups.length > 1 ? "s" : ""} en attente
            </p>
          </div>
        </>
      )}

      {/* Dialog de création de groupe */}
      <CreateGroupFlow
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}