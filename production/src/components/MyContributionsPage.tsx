import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { AppNotification } from '../api/notificationService';
import { notificationTarget } from '../utils/notificationText';
import { NotificationItem } from './NotificationItem';
import { Idea, Post } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useAuth } from '../context/authContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { IdeaCard } from './IdeaCard';
import { PostCard } from './PostCard';
import { 
  Search,
  FileText,
  Bell,
  Filter,
  Plus,
  Lightbulb,
  Loader2,
  CheckCheck,
  LogIn,
  UserPlus,
  Lock,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface MyContributionsPageProps {
  onIdeaClick: (ideaId: string) => void;
  onPostClick: (postId: string) => void;
  onGroupClick?: (groupId: string) => void;
  onLike: (postId: string) => void;
  onSupport: (ideaId: string) => void;
  onIgnoreIdea?: (ideaId: string) => void;
  onReportIdea?: (ideaId: string) => void;
  onIgnorePost?: (postId: string) => void;
  onReportPost?: (postId: string) => void;
  onCreateContent?: () => void;
}

// Types de filtres
type ContentTypeFilter = 'all' | 'posts' | 'ideas';
type RelationFilter = 'all' | 'created' | 'participated' | 'supported';
type GroupFilter = 'all' | string; // 'all' ou un groupId

export function MyContributionsPage({
  onIdeaClick,
  onPostClick,
  onGroupClick,
  onLike,
  onSupport,
  onIgnoreIdea,
  onReportIdea,
  onIgnorePost,
  onReportPost,
  onCreateContent
}: MyContributionsPageProps) {
  const {
    getCurrentUser,
    getAllPosts,
    getAllIdeas,
    getAllGroups,
  } = useEntityStoreSimple();

  const { login, register } = useAuth();

  const currentUser = getCurrentUser();
  const allPosts = getAllPosts();
  const allIdeas = getAllIdeas();
  const allGroups = getAllGroups();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'contributions' | 'notifications'>(
    searchParams.get('tab') === 'notifications' ? 'notifications' : 'contributions'
  );
  const notificationsState = useNotifications();
  const navigate = useNavigate();

  // Lien de la cloche alors qu'on est déjà sur la page : on bascule sur l'onglet
  useEffect(() => {
    if (searchParams.get('tab') === 'notifications') setActiveTab('notifications');
  }, [searchParams]);

  // Ouverture de l'onglet : liste à jour
  const { refresh: refreshNotifications } = notificationsState;
  useEffect(() => {
    if (activeTab === 'notifications') refreshNotifications();
  }, [activeTab, refreshNotifications]);

  const changeTab = (tab: 'contributions' | 'notifications') => {
    setActiveTab(tab);
    setSearchParams(tab === 'notifications' ? { tab } : {}, { replace: true });
  };

  const openNotification = (n: AppNotification) => {
    notificationsState.markRead([n.key]);
    navigate(notificationTarget(n));
  };
  
  // Filtres
  const [contentTypeFilter, setContentTypeFilter] = useState<ContentTypeFilter>('all');
  const [relationFilter, setRelationFilter] = useState<RelationFilter>('all');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');

  // ============================================================================
  // CALCUL DE TOUS MES CONTENUS
  // ============================================================================

  const allMyContent = useMemo(() => {
    if (!currentUser) return [];
    
    const content: Array<{ item: Post | Idea; type: 'post' | 'idea'; relation: 'created' | 'participated' | 'supported' }> = [];

    // Posts créés
    allPosts.forEach(post => {
      if (post.authorId === currentUser.id) {
        content.push({ item: post, type: 'post', relation: 'created' });
      }
    });

    // Idées créées
    allIdeas.forEach(idea => {
      if (idea.creatorIds?.includes(currentUser.id)) {
        content.push({ item: idea, type: 'idea', relation: 'created' });
      }
    });

    // Posts participés (commentés)
    allPosts.forEach(post => {
      const hasCommented = post.replies?.some(reply => reply.authorId === currentUser.id) || false;
      const notCreated = post.authorId !== currentUser.id;
      if (hasCommented && notCreated) {
        content.push({ item: post, type: 'post', relation: 'participated' });
      }
    });

    // Idées participées (évaluées)
    allIdeas.forEach(idea => {
      const hasRated = idea.ratings?.some(rating => rating.userId === currentUser.id) || false;
      const notCreated = !idea.creatorIds?.includes(currentUser.id);
      if (hasRated && notCreated) {
        content.push({ item: idea, type: 'idea', relation: 'participated' });
      }
    });

    // Posts supportés (sans participation)
    allPosts.forEach(post => {
      const hasSupported = post.supporters?.includes(currentUser.id) || false;
      const notCreated = post.authorId !== currentUser.id;
      const notParticipated = !post.replies?.some(reply => reply.authorId === currentUser.id);
      if (hasSupported && notCreated && notParticipated) {
        content.push({ item: post, type: 'post', relation: 'supported' });
      }
    });

    // Idées supportées (sans participation)
    allIdeas.forEach(idea => {
      const hasSupported = idea.supporters?.includes(currentUser.id) || false;
      const notCreated = !idea.creatorIds?.includes(currentUser.id);
      const notParticipated = !idea.ratings?.some(rating => rating.userId === currentUser.id);
      if (hasSupported && notCreated && notParticipated) {
        content.push({ item: idea, type: 'idea', relation: 'supported' });
      }
    });

    return content;
  }, [allPosts, allIdeas, currentUser]);

  // ============================================================================
  // FILTRAGE DU CONTENU
  // ============================================================================

  const filteredContent = useMemo(() => {
    let filtered = [...allMyContent];

    // Filtre par type de contenu
    if (contentTypeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === contentTypeFilter.slice(0, -1)); // 'posts' -> 'post'
    }

    // Filtre par relation
    if (relationFilter !== 'all') {
      filtered = filtered.filter(item => item.relation === relationFilter);
    }

    // Filtre par groupe
    if (groupFilter !== 'all') {
      filtered = filtered.filter(item => {
        const groupIds = item.item.groupIds || [];
        return groupIds.includes(groupFilter);
      });
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        if (item.type === 'post') {
          const post = item.item as Post;
          return (
            post.content.toLowerCase().includes(query) ||
            post.title?.toLowerCase().includes(query) ||
            post.tags?.some(tag => tag.toLowerCase().includes(query))
          );
        } else {
          const idea = item.item as Idea;
          return (
            idea.title.toLowerCase().includes(query) ||
            idea.summary.toLowerCase().includes(query) ||
            idea.tags?.some(tag => tag.toLowerCase().includes(query))
          );
        }
      });
    }

    // Tri par date (plus récent d'abord)
    filtered.sort((a, b) => {
      const dateA = new Date(a.item.createdAt).getTime();
      const dateB = new Date(b.item.createdAt).getTime();
      return dateB - dateA;
    });

    return filtered;
  }, [allMyContent, contentTypeFilter, relationFilter, groupFilter, searchQuery]);

  // ============================================================================
  // STATISTIQUES
  // ============================================================================

  const stats = useMemo(() => {
    const created = allMyContent.filter(item => item.relation === 'created').length;
    const participated = allMyContent.filter(item => item.relation === 'participated').length;
    const supported = allMyContent.filter(item => item.relation === 'supported').length;
    const posts = allMyContent.filter(item => item.type === 'post').length;
    const ideas = allMyContent.filter(item => item.type === 'idea').length;

    return { created, participated, supported, posts, ideas, total: allMyContent.length };
  }, [allMyContent]);

  // Groupes uniques dans mes contenus
  const groupsInContent = useMemo(() => {
    const groupIds = new Set<string>();
    allMyContent.forEach(({ item }) => {
      (item.groupIds || []).forEach(id => groupIds.add(id));
    });
    return Array.from(groupIds)
      .map(id => allGroups.find(g => g.id === id))
      .filter(Boolean);
  }, [allMyContent, allGroups]);

  // ============================================================================
  // HELPERS
  // ============================================================================

  const getRelationLabel = (relation: string) => {
    switch (relation) {
      case 'created': return 'Créé';
      case 'participated': return 'Participé';
      case 'supported': return 'Supporté';
      default: return relation;
    }
  };

  const getRelationColor = (relation: string) => {
    switch (relation) {
      case 'created': return 'bg-blue-100 text-blue-700';
      case 'participated': return 'bg-purple-100 text-purple-700';
      case 'supported': return 'bg-pink-100 text-pink-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Si l'utilisateur n'est pas connecté ou n'a pas de compte finalisé
  if (!currentUser || !currentUser.isRegistered) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Card className="border-2">
          <CardContent className="p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-[#e8f0ff] rounded-full flex items-center justify-center">
                <Lock className="w-8 h-8 text-[#4f75ff]" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Connectez-vous pour voir vos contributions
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Suivez vos idées, vos participations et vos soutiens en créant un compte ou en vous connectant.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={login}
                size="lg"
                className="bg-[#4f75ff] hover:bg-[#3d5fd9] text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Se connecter
              </Button>
              
              <Button
                onClick={register}
                size="lg"
                variant="outline"
                className="border-[#4f75ff] text-[#4f75ff] hover:bg-[#e8f0ff]"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Créer un compte
              </Button>
            </div>
            
            <p className="text-sm text-gray-500 mt-6">
              En créant un compte, vous pourrez gérer et suivre toute votre activité sur la plateforme.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">Mes contributions</h1>
            <p className="text-gray-600">
              Gérez et suivez votre activité sur la plateforme
            </p>
          </div>
          {onCreateContent && (
            <Button onClick={onCreateContent}>
              <Plus className="h-4 w-4 mr-2" />
              Créer
            </Button>
          )}
        </div>
      </div>

      {/* Tabs principales */}
      <Tabs value={activeTab} onValueChange={(v) => changeTab(v as 'contributions' | 'notifications')} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contributions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Mes contributions
            <Badge variant="secondary" className="ml-2">{stats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {notificationsState.unread > 0 && (
              <Badge variant="destructive" className="ml-2">{notificationsState.unread}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab: Contributions */}
        <TabsContent value="contributions" className="space-y-6">
          {/* Filtres et recherche */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Rechercher dans mes contributions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtres à plusieurs niveaux */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Filtre: Type de contenu */}
              <div>
                <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Type de contenu
                </label>
                <Select value={contentTypeFilter} onValueChange={(v) => setContentTypeFilter(v as ContentTypeFilter)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tout ({stats.total})</SelectItem>
                    <SelectItem value="posts">Posts ({stats.posts})</SelectItem>
                    <SelectItem value="ideas">Projets ({stats.ideas})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre: Relation */}
              <div>
                <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Ma relation
                </label>
                <Select value={relationFilter} onValueChange={(v) => setRelationFilter(v as RelationFilter)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes ({stats.total})</SelectItem>
                    <SelectItem value="created">Créé ({stats.created})</SelectItem>
                    <SelectItem value="participated">Participé ({stats.participated})</SelectItem>
                    <SelectItem value="supported">Supporté ({stats.supported})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre: Groupe */}
              <div>
                <label className="text-sm text-gray-600 mb-2 flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Groupe
                </label>
                <Select value={groupFilter} onValueChange={(v) => setGroupFilter(v as GroupFilter)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les groupes</SelectItem>
                    {groupsInContent.map((group: any) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.avatar} {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Résumé des filtres actifs */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{filteredContent.length} résultat{filteredContent.length > 1 ? 's' : ''}</span>
              {(contentTypeFilter !== 'all' || relationFilter !== 'all' || groupFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setContentTypeFilter('all');
                    setRelationFilter('all');
                    setGroupFilter('all');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              )}
            </div>
          </div>

          {/* Liste des contenus */}
          {filteredContent.length === 0 ? (
            <Alert>
              <AlertDescription>
                {searchQuery || contentTypeFilter !== 'all' || relationFilter !== 'all' || groupFilter !== 'all'
                  ? 'Aucun contenu ne correspond à vos critères de recherche.'
                  : 'Vous n\'avez pas encore de contributions. Commencez par créer un post ou un projet !'}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {filteredContent.map(({ item, type, relation }) => (
                <div key={`${type}-${item.id}`} className="relative">
                  {/* Badge de relation */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className={getRelationColor(relation)}>
                      {getRelationLabel(relation)}
                    </Badge>
                  </div>

                  {type === 'idea' ? (
                    <IdeaCard
                      idea={item as Idea}
                      onSupport={() => onSupport(item.id)}
                      onViewDetails={() => onIdeaClick(item.id)}
                      onIgnore={onIgnoreIdea ? () => onIgnoreIdea(item.id) : undefined}
                      onReport={onReportIdea ? () => onReportIdea(item.id) : undefined}
                      currentUserId={currentUser.id}
                    />
                  ) : (
                    <PostCard
                      post={item as Post}
                      onLike={() => onLike(item.id)}
                      onViewDetails={() => onPostClick(item.id)}
                      onIgnore={onIgnorePost ? () => onIgnorePost(item.id) : undefined}
                      onReport={onReportPost ? () => onReportPost(item.id) : undefined}
                      currentUserId={currentUser.id}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab: Notifications (regroupées côté serveur, voir NotificationContext) */}
        <TabsContent value="notifications" className="space-y-4">
          {notificationsState.unread > 0 && (
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={notificationsState.markAllRead}>
                <CheckCheck className="h-4 w-4" />
                Tout marquer comme lu
              </Button>
            </div>
          )}

          {notificationsState.isLoading && notificationsState.notifications.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : notificationsState.notifications.length === 0 ? (
            <Alert>
              <AlertDescription>
                Aucune activité pour le moment. Vous serez prévenu ici quand la communauté réagira à vos contenus,
                ou quand un contenu que vous soutenez deviendra populaire.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-1">
              {notificationsState.notifications.map((n) => (
                <NotificationItem key={n.key} notification={n} onClick={openNotification} />
              ))}
              {notificationsState.hasMore && (
                <div className="flex justify-center pt-2">
                  <Button variant="ghost" size="sm" onClick={notificationsState.loadMore}>
                    Voir plus
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}