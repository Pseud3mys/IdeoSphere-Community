import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEntityStoreSimple, useGroupActions, useNavigationActions } from "../hooks";
import { GroupHeader } from "./group/GroupHeader";
import { GroupMembersList } from "./group/GroupMembersList";
import { GroupLinksModule } from "./group/GroupLinksModule";
import { IdeaCard } from "./IdeaCard";
import { PostCard } from "./PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Lightbulb, MessageSquare, Info, ArrowLeft, Plus, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { ensureGroupPrefix } from "../utils/idUtils";

export function GroupHubPage() {
  const { groupId: urlGroupId } = useParams<{ groupId: string }>();
  // Ajouter le préfixe "groups/" si nécessaire
  const groupId = urlGroupId ? ensureGroupPrefix(urlGroupId) : undefined;
  const navigate = useNavigate();
  const {
    getGroupById,
    getGroupFeed,
    getGroupAnimators,
    getGroupMembers,
    isUserMemberOfGroup,
    isUserAnimatorOfGroup,
    getCurrentUser,
    getPostsByGroup,
    getIdeasByGroup,
  } = useEntityStoreSimple();
  
  const { goToIdea, goToPost, goToGroupManage, goToCreateWithGroups } = useNavigationActions();
  const currentUser = getCurrentUser();

  const groupActions = useGroupActions();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("projets");

  // Charger les données du groupe
  useEffect(() => {
    if (!groupId) return;

    const loadGroupData = async () => {
      setIsLoading(true);
      try {
        await groupActions.loadGroupDetails(groupId);
        await groupActions.loadGroupFeed(groupId);
      } catch (error) {
        console.error("Erreur lors du chargement du groupe:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadGroupData();
  }, [groupId]);

  const group = groupId ? getGroupById(groupId) : null;
  const { ideas, posts } = groupId ? getGroupFeed(groupId) : { ideas: [], posts: [] };
  const animators = groupId ? getGroupAnimators(groupId) : [];
  const members = groupId ? getGroupMembers(groupId) : [];

  // Séparer les posts par type pour l'onglet discussions
  const groupPosts = groupId ? getPostsByGroup(groupId) : [];
  const groupIdeas = groupId ? getIdeasByGroup(groupId) : [];

  const isMember = currentUser && groupId ? isUserMemberOfGroup(currentUser.id, groupId) : false;
  const isAnimator = currentUser && groupId ? isUserAnimatorOfGroup(currentUser.id, groupId) : false;

  const handleJoinGroup = async () => {
    if (!currentUser || !currentUser.isRegistered || !groupId) {
      console.log("Veuillez vous enregistrer pour rejoindre un groupe");
      return;
    }

    try {
      await groupActions.joinGroup(groupId);
    } catch (error) {
      console.error("Erreur lors de l'adhésion au groupe:", error);
    }
  };

  const handleLeaveGroup = async () => {
    if (!currentUser || !currentUser.isRegistered || !groupId) return;

    try {
      await groupActions.leaveGroup(groupId);
    } catch (error) {
      console.error("Erreur lors de la sortie du groupe:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Chargement du groupe...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center">
          <h2>Groupe introuvable</h2>
          <p className="text-muted-foreground mt-2">
            Le groupe que vous recherchez n'existe pas ou a été supprimé.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête du groupe */}
      <GroupHeader
        group={group}
        isMember={isMember}
        isAnimator={isAnimator}
        onJoin={handleJoinGroup}
        onLeave={handleLeaveGroup}
        onManage={() => goToGroupManage(group.id)}
      />

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Bouton retour */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 md:mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        {/* Boutons de création (si membre) */}
        {isMember && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 mb-1">Contribuer au groupe</h3>
                <p className="text-sm text-gray-600">
                  Partagez vos idées et lancez des discussions avec les membres
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none bg-white hover:bg-blue-50 border-blue-300"
                  onClick={() => groupId && goToCreateWithGroups([groupId], 'post')}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Discussion
                </Button>
                <Button
                  className="flex-1 md:flex-none bg-purple-600 hover:bg-purple-700"
                  onClick={() => groupId && goToCreateWithGroups([groupId], 'idea')}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Projet
                </Button>
              </div>
            </div>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Conteneur avec scroll horizontal sur mobile */}
          <div className="w-full overflow-x-auto pb-2 mb-6">
            <TabsList className="w-full md:w-auto inline-flex">
              <TabsTrigger value="projets" className="whitespace-nowrap">
                <Lightbulb className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Projets ({groupIdeas.length})</span>
                <span className="md:hidden">Projets</span>
              </TabsTrigger>
              <TabsTrigger value="discussions" className="whitespace-nowrap">
                <MessageSquare className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Discussions ({groupPosts.length})</span>
                <span className="md:hidden">Disc.</span>
              </TabsTrigger>
              <TabsTrigger value="network" className="whitespace-nowrap">
                <Info className="w-4 h-4 mr-2" />
                <span className="hidden md:inline">Réseau</span>
                <span className="md:hidden">Réseau</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Onglet Projets */}
          <TabsContent value="projets">
            {groupIdeas.length === 0 ? (
              <Card className="p-12 text-center">
                <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="font-medium text-gray-900 mb-2">Aucun projet pour le moment</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Soyez le premier à proposer un projet structuré pour ce groupe
                </p>
                {isMember && (
                  <Button onClick={() => groupId && goToCreateWithGroups([groupId], 'idea')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Créer un projet
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {groupIdeas
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      idea={idea}
                      onClick={() => goToIdea(idea.id)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Onglet Discussions */}
          <TabsContent value="discussions">
            {groupPosts.length === 0 ? (
              <Card className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h4 className="font-medium text-gray-900 mb-2">Aucune discussion pour le moment</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Lancez une discussion pour échanger avec les membres du groupe
                </p>
                {isMember && groupId && (
                  <Button variant="outline" onClick={() => goToCreateWithGroups([groupId], 'post')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Lancer une discussion
                  </Button>
                )}
              </Card>
            ) : (
              <div className="space-y-4">
                {groupPosts
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onClick={() => goToPost(post.id)}
                    />
                  ))}
              </div>
            )}
          </TabsContent>

          {/* Onglet Réseau (Liens + Membres fusionnés) */}
          <TabsContent value="network">
            <div className="space-y-8">
              {/* Section Liens */}
              <div>
                <GroupLinksModule groupId={group.id} isAnimator={isAnimator} />
              </div>

              {/* Section Membres */}
              <div>
                <h3 className="text-lg font-medium mb-4">Membres du groupe</h3>
                <GroupMembersList
                  groupId={group.id}
                  animators={animators}
                  members={members}
                  showAll={true}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
