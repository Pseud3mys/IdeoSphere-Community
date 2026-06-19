import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Ajout de Link pour le lien login/signup
import { useEntityStoreSimple, useGroupActions, useNavigationActions } from "../hooks";
import { GroupHeader } from "./group/GroupHeader";
import { GroupMembersList } from "./group/GroupMembersList";
import { GroupLinksModule } from "./group/GroupLinksModule";
import { IdeaCard } from "./IdeaCard";
import { PostCard } from "./PostCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card } from "./ui/card";
import { Lightbulb, MessageSquare, Info, ArrowLeft, Star, ListFilter } from "lucide-react";
import { Button } from "./ui/button";
import { ensureGroupPrefix } from "../utils/idUtils";
import { Badge } from "./ui/badge";
import { fetchGroupShowcase } from "../api/groupService"; // Import de la nouvelle fonction API
import { Idea, Post } from "../types";

export function GroupHubPage() {
  const { groupId: urlGroupId } = useParams<{ groupId: string }>();
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
    actions
  } = useEntityStoreSimple();
  
  const { goToGroupManage, goToCreateWithGroups } = useNavigationActions();
  const currentUser = getCurrentUser();
  const groupActions = useGroupActions();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("featured");
  const [feedFilter, setFeedFilter] = useState<"all" | "ideas" | "posts">("all");
  
  // NOUVEAU : État pour stocker les données du showcase récupérées via l'API
  const [showcaseItems, setShowcaseItems] = useState<(Idea | Post)[]>([]);

  useEffect(() => {
    if (!groupId) return;
    const loadGroupData = async () => {
      setIsLoading(true);
      try {
        // Exécution en parallèle : détails, feed, et showcase
        await Promise.all([
          groupActions.loadGroupDetails(groupId),
          groupActions.loadGroupFeed(groupId),
          // Appel direct API pour le showcase
          fetchGroupShowcase(groupId).then(items => setShowcaseItems(items))
        ]);
      } catch (error) {
        console.error("Erreur lors du chargement du groupe:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGroupData();
  }, [groupId, currentUser?.id]);

  const group = groupId ? getGroupById(groupId) : null;
  const { ideas, posts } = groupId ? getGroupFeed(groupId) : { ideas: [], posts: [] };
  const animators = groupId ? getGroupAnimators(groupId) : [];
  const members = groupId ? getGroupMembers(groupId) : [];

  // Feed fusionné et filtré pour l'onglet "Participer"
  const participationFeed = useMemo(() => {
    let combined = [
      ...ideas.map(i => ({ ...i, itemType: 'idea' as const })),
      ...posts.map(p => ({ ...p, itemType: 'post' as const }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (feedFilter === "ideas") return combined.filter(item => item.itemType === 'idea');
    if (feedFilter === "posts") return combined.filter(item => item.itemType === 'post');
    return combined;
  }, [ideas, posts, feedFilter]);

  const isMember = currentUser && groupId ? isUserMemberOfGroup(currentUser.id, groupId) : false;
  const isAnimator = currentUser && groupId ? isUserAnimatorOfGroup(currentUser.id, groupId) : false;

  const handleJoin = async () => {
    if (!currentUser) return navigate('/login');
    if (groupId) await groupActions.joinGroup(groupId);
  };

  if (isLoading) return <div className="max-w-5xl mx-auto px-6 py-12 text-center text-muted-foreground">Chargement...</div>;
  if (!group) return <div className="max-w-5xl mx-auto px-6 py-12 text-center"><h2>Groupe introuvable</h2></div>;

  return (
    <div>
      <GroupHeader
        group={group}
        isMember={isMember}
        isAnimator={isAnimator}
        onJoin={handleJoin}
        onLeave={() => groupId && groupActions.leaveGroup(groupId)}
        onManage={() => goToGroupManage(group.id)}
      />

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </Button>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="w-full overflow-x-auto pb-2">
            <TabsList>
              <TabsTrigger value="featured"><Star className="w-4 h-4 mr-2" />À la une</TabsTrigger>
              <TabsTrigger value="participate"><MessageSquare className="w-4 h-4 mr-2" />Participer</TabsTrigger>
              <TabsTrigger value="info"><Info className="w-4 h-4 mr-2" />Infos</TabsTrigger>
            </TabsList>
          </div>

          {/* --- ONGLET À LA UNE --- */}
          {/* Utilise désormais showcaseItems (API) au lieu du calcul local */}
          <TabsContent value="featured" className="space-y-6">
            <p className="text-sm text-muted-foreground">
            Découvrez les initiatives qui rassemblent le plus de soutiens en ce moment au sein du groupe.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">              
              {showcaseItems.length > 0 ? showcaseItems.map((item) => {
                 // Détection du type pour l'affichage (car item est Idea | Post)
                 const isIdea = (item as any).summary !== undefined;
                 return (
                  <Card key={item.id} className="p-4 border-2 border-yellow-100 bg-yellow-50/30 relative overflow-hidden opacity-80 shadow-none">
                    <div className="absolute top-2 right-2"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /></div>
                    <Badge className="mb-2">{isIdea ? 'Projet' : 'Discussion'}</Badge>
                    <h4 className="font-bold mb-2 line-clamp-2 text-gray-800">{item.title || "Sans titre"}</h4>
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {(item as any).summary || (item as any).content}
                    </p>
                    <div className="mt-4 flex items-center text-xs font-medium text-yellow-700">
                      {item.supporters?.length || 0} soutiens dans ce groupe
                    </div>
                  </Card>
                );
              }) : (
                <p className="col-span-3 text-center py-10 text-muted-foreground">Pas encore de contenu à la une.</p>
              )}
            </div>
          </TabsContent>

          {/* --- ONGLET PARTICIPER --- */}
          <TabsContent value="participate" className="space-y-6">

            <div className="flex flex-wrap gap-2 items-center justify-between bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <div className="text-sm font-medium text-blue-800">Publier sur ce groupe :</div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => groupId && goToCreateWithGroups([groupId], 'post')}>+ Poster</Button>
              </div>
            </div>

            <div className="flex items-center gap-2 border-b pb-4">
              <ListFilter className="w-4 h-4 text-muted-foreground" />
              <Button variant={feedFilter === "all" ? "default" : "ghost"} size="sm" onClick={() => setFeedFilter("all")}>Tout</Button>
              <Button variant={feedFilter === "ideas" ? "default" : "ghost"} size="sm" onClick={() => setFeedFilter("ideas")}>Projets</Button>
              <Button variant={feedFilter === "posts" ? "default" : "ghost"} size="sm" onClick={() => setFeedFilter("posts")}>Discussions</Button>
            </div>

            <div className="space-y-4">
              {participationFeed.length > 0 ? participationFeed.map((item) => (
                item.itemType === 'idea' ? (
                  <IdeaCard key={item.id} idea={item as any} onIdeaClick={() => navigate(`/content/${item.id}`)} onSupport={() => actions.toggleIdeaSupport(item.id)} />
                ) : (
                  <PostCard key={item.id} post={item as any} onPostClick={() => navigate(`/content/${item.id}`)} onLike={() => actions.togglePostLike(item.id)} />
                )
              )) : (
                <Card className="p-12 text-center text-muted-foreground">Aucun contenu ne correspond à ce filtre.</Card>
              )}
            </div>
          </TabsContent>

          {/* --- ONGLET INFOS --- */}
          <TabsContent value="info" className="space-y-8">
            <GroupLinksModule groupId={group.id} isAnimator={isAnimator} />
            <div>
              <h3 className="text-lg font-medium mb-4">Membres du groupe</h3>
              <GroupMembersList groupId={group.id} animators={animators} members={members} showAll={true} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}