import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEntityStoreSimple, useGroupActions, useNavigationActions } from "../../hooks";
import { GroupTypeBadge } from "./GroupTypeBadge";
import { GroupInfoDialog } from "./GroupInfoDialog";
import { ShareGroupDialog } from "../ShareGroupDialog";
import { IdeaCard } from "../IdeaCard";
import { PostCard } from "../PostCard";
import { Button } from "../ui/button";
import { ArrowLeft, Check, Heart, Info, Plus, Settings, Share, Users } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { ensureGroupPrefix } from "../../utils/idUtils";
import { fetchGroupShowcase } from "../../api/groupService";
import { registerWithSSO } from "../../api/authService";
import { Idea, Post, User } from "../../types";
import "./GroupHubPage.css";

type FeedFilter = "all" | "posts" | "ideas";
type FeedItem = (Idea | Post) & { itemType: 'idea' | 'post'; isPopular?: boolean };

// Nombre de contenus "les plus soutenus" intercalés dans le fil
const POPULAR_COUNT = 3;
// Nombre de contenus récents entre deux contenus "les plus soutenus"
const RECENT_BETWEEN_POPULAR = 3;

const isIdea = (item: Idea | Post) => item.id.startsWith('ideas/') || (item as Idea).summary !== undefined;

/**
 * Page d'un groupe : en-tête compact, bouton pour publier, puis le fil du groupe.
 * Les contenus les plus soutenus sont placés en tête du fil.
 * On participe sans compte : un compte invité est créé à la première action.
 */
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
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [showcaseItems, setShowcaseItems] = useState<(Idea | Post)[]>([]);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isOpeningComposer, setIsOpeningComposer] = useState(false);

  useEffect(() => {
    if (!groupId) return;
    const loadGroupData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          groupActions.loadGroupDetails(groupId),
          groupActions.loadGroupFeed(groupId),
          // Un de plus que nécessaire : le plus récent n'est pas répété s'il en fait partie
          fetchGroupShowcase(groupId, POPULAR_COUNT + 1).then(items => setShowcaseItems(items))
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

  // Fil : le plus récent en tête, puis les plus soutenus intercalés dans le reste
  // (un après le plus récent, puis un tous les RECENT_BETWEEN_POPULAR contenus)
  const feed = useMemo<FeedItem[]>(() => {
    const recent: FeedItem[] = [
      ...ideas.map(i => ({ ...i, itemType: 'idea' as const })),
      ...posts.map(p => ({ ...p, itemType: 'post' as const }))
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const [latest, ...older] = recent;
    const popular: FeedItem[] = showcaseItems
      .filter(item => item.id !== latest?.id)
      .slice(0, POPULAR_COUNT)
      .map(item => ({ ...item, itemType: isIdea(item) ? 'idea' : 'post', isPopular: true }));
    const popularIds = new Set(popular.map(item => item.id));
    const rest = older.filter(item => !popularIds.has(item.id));

    const combined: FeedItem[] = latest ? [latest] : [];
    popular.forEach((item, index) => {
      combined.push(item, ...rest.slice(index * RECENT_BETWEEN_POPULAR, (index + 1) * RECENT_BETWEEN_POPULAR));
    });
    combined.push(...rest.slice(popular.length * RECENT_BETWEEN_POPULAR));
    if (feedFilter === "ideas") return combined.filter(item => item.itemType === 'idea');
    if (feedFilter === "posts") return combined.filter(item => item.itemType === 'post');
    return combined;
  }, [ideas, posts, showcaseItems, feedFilter]);

  const showFilters = ideas.length > 0 && posts.length > 0;
  const isMember = currentUser && groupId ? isUserMemberOfGroup(currentUser.id, groupId) : false;
  const isAnimator = currentUser && groupId ? isUserAnimatorOfGroup(currentUser.id, groupId) : false;

  // Retour : page précédente de l'app, sinon la liste des groupes (arrivée directe par lien ou QR code)
  const handleBack = () => {
    if ((window.history.state?.idx ?? 0) > 0) navigate(-1);
    else navigate('/groups');
  };

  // Participer sans compte : un compte invité est créé à la première action
  const ensureParticipant = async (): Promise<User | null> => {
    if (currentUser) return currentUser;
    const guest = await actions.createTemporaryGuest();
    if (!guest) {
      toast.error("Impossible de participer pour le moment. Réessayez dans un instant.");
      return null;
    }
    actions.enterPlatform();
    return guest;
  };

  const handlePublish = async () => {
    if (!groupId || isOpeningComposer) return;
    setIsOpeningComposer(true);
    try {
      if (await ensureParticipant()) goToCreateWithGroups([groupId], 'post');
    } finally {
      setIsOpeningComposer(false);
    }
  };

  const handlePostLike = async (postId: string) => {
    if (await ensureParticipant()) actions.togglePostLike(postId);
  };

  const handleIdeaSupport = async (ideaId: string) => {
    if (await ensureParticipant()) actions.toggleIdeaSupport(ideaId);
  };

  const handleJoin = async () => {
    if (!groupId) return;
    if (!currentUser?.isRegistered) {
      toast.info("Créez un compte pour rejoindre ce groupe. Pas besoin de compte pour publier ou soutenir.", {
        // Création directe chez Keycloak (/signup sert seulement à compléter le profil d'un membre connecté)
        action: { label: "Créer un compte", onClick: () => registerWithSSO() }
      });
      return;
    }
    try {
      await groupActions.joinGroup(groupId);
      toast.success("Vous avez rejoint le groupe.");
    } catch {
      toast.error("Impossible de rejoindre le groupe pour le moment.");
    }
  };

  const handleLeave = async () => {
    if (!groupId || !window.confirm("Quitter ce groupe ?")) return;
    try {
      await groupActions.leaveGroup(groupId);
      toast.success("Vous avez quitté le groupe.");
    } catch {
      toast.error("Impossible de quitter le groupe pour le moment.");
    }
  };

  // Le chargement plein écran ne concerne que la première ouverture
  if (isLoading && !group) return <div className="max-w-5xl mx-auto px-6 py-12 text-center text-muted-foreground">Chargement...</div>;
  if (!group) return <div className="max-w-5xl mx-auto px-6 py-12 text-center"><h2>Groupe introuvable</h2></div>;

  const description = group.shortDescription || group.description;

  return (
    <div className="gh">
      {/* En-tête */}
      <div className="gh-top">
        <div className="gh-container">
          <button type="button" className="gh-back" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="gh-head">
            <div className="gh-head-main">
              {group.avatar && <span className="gh-emoji" aria-hidden="true">{group.avatar}</span>}
              <div>
                <h1 className="gh-title">{group.name}</h1>
                <div className="gh-meta">
                  <GroupTypeBadge type={group.type} size="sm" />
                  <span className="gh-meta-item">
                    <Users className="w-3 h-3" />
                    {group.memberCount} membre{group.memberCount > 1 ? 's' : ''}
                  </span>
                </div>
                {description && <p className="gh-desc">{description}</p>}
              </div>
            </div>

            <div className="gh-actions">
              <Button variant="outline" size="sm" onClick={() => setIsInfoOpen(true)}>
                <Info className="w-4 h-4 mr-1" />
                Infos
              </Button>
              <ShareGroupDialog groupId={group.id} groupName={group.name}>
                <Button variant="outline" size="sm" aria-label="Partager le groupe">
                  <Share className="w-4 h-4" />
                </Button>
              </ShareGroupDialog>
              {isAnimator && (
                <Button variant="outline" size="sm" onClick={() => goToGroupManage(group.id)}>
                  <Settings className="w-4 h-4 mr-1" />
                  Gérer
                </Button>
              )}
              {isMember ? (
                <Button variant="outline" size="sm" onClick={handleLeave} title="Quitter le groupe">
                  <Check className="w-4 h-4 mr-1" />
                  Membre
                </Button>
              ) : (
                <Button size="sm" onClick={handleJoin}>
                  Rejoindre
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fil du groupe */}
      <div className="gh-container gh-body">
        <div className="gh-toolbar">
          <button type="button" className="gh-publish" onClick={handlePublish} disabled={isOpeningComposer}>
            <Plus className="w-4 h-4" />
            Publier dans ce groupe
          </button>
          {showFilters && (
            <div className="gh-filters" role="tablist">
              {([['all', 'Tout'], ['posts', 'Posts'], ['ideas', 'Idées']] as [FeedFilter, string][]).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={feedFilter === value}
                  className={`gh-filter${feedFilter === value ? ' is-active' : ''}`}
                  onClick={() => setFeedFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="gh-feed">
          {feed.length > 0 ? feed.map(item => (
            <div key={item.id}>
              {item.isPopular && (
                <span className="gh-popular">
                  <Heart className="w-3 h-3" />
                  Parmi les plus soutenus
                </span>
              )}
              {item.itemType === 'idea' ? (
                <IdeaCard idea={item as Idea} onIdeaClick={() => navigate(`/content/${item.id}`)} onSupport={handleIdeaSupport} contextGroupId={group.id} />
              ) : (
                <PostCard post={item as Post} onPostClick={() => navigate(`/content/${item.id}`)} onLike={handlePostLike} contextGroupId={group.id} />
              )}
            </div>
          )) : (
            <p className="gh-empty">Aucune publication pour l'instant. Lancez la discussion !</p>
          )}
        </div>
      </div>

      <GroupInfoDialog
        group={group}
        animators={animators}
        members={members}
        isAnimator={isAnimator}
        open={isInfoOpen}
        onOpenChange={setIsInfoOpen}
      />
    </div>
  );
}
