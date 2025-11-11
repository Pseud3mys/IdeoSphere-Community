import { useState, useMemo } from 'react';
import { Idea, Post } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
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
  MessageCircle,
  Heart,
  TrendingUp,
  Lightbulb,
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

// Interface pour les notifications
interface Notification {
  id: string;
  type: 'new_support' | 'new_comment' | 'new_rating' | 'new_discussion' | 'new_version' | 'new_reply' | 'idea_from_post';
  contentId: string;
  contentType: 'idea' | 'post';
  contentTitle: string;
  actors: Array<{ name: string; avatar: string }>; // Plusieurs acteurs pour les notifications groupées
  timestamp: Date; // Date de la plus récente activité
  count: number; // Nombre d'activités groupées
  metadata?: any; // Données supplémentaires (ex: version number, discussion title)
}

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
    getUserById,
  } = useEntityStoreSimple();

  const currentUser = getCurrentUser();
  const allPosts = getAllPosts();
  const allIdeas = getAllIdeas();
  const allGroups = getAllGroups();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'contributions' | 'notifications'>('contributions');
  
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
      if (idea.creatorIds.includes(currentUser.id)) {
        content.push({ item: idea, type: 'idea', relation: 'created' });
      }
    });

    // Posts participés (commentés)
    allPosts.forEach(post => {
      const hasCommented = post.replies.some(reply => reply.authorId === currentUser.id);
      const notCreated = post.authorId !== currentUser.id;
      if (hasCommented && notCreated) {
        content.push({ item: post, type: 'post', relation: 'participated' });
      }
    });

    // Idées participées (évaluées)
    allIdeas.forEach(idea => {
      const hasRated = idea.ratings?.some(rating => rating.userId === currentUser.id);
      const notCreated = !idea.creatorIds.includes(currentUser.id);
      if (hasRated && notCreated) {
        content.push({ item: idea, type: 'idea', relation: 'participated' });
      }
    });

    // Posts supportés (sans participation)
    allPosts.forEach(post => {
      const hasSupported = post.supporters.includes(currentUser.id);
      const notCreated = post.authorId !== currentUser.id;
      const notParticipated = !post.replies.some(reply => reply.authorId === currentUser.id);
      if (hasSupported && notCreated && notParticipated) {
        content.push({ item: post, type: 'post', relation: 'supported' });
      }
    });

    // Idées supportées (sans participation)
    allIdeas.forEach(idea => {
      const hasSupported = idea.supporters.includes(currentUser.id);
      const notCreated = !idea.creatorIds.includes(currentUser.id);
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
  // CALCUL DES NOTIFICATIONS (GROUPÉES)
  // ============================================================================

  const notifications = useMemo(() => {
    if (!currentUser) return [];
    
    // Map temporaire pour grouper: clé = type-contentId
    const groupedMap = new Map<string, Notification>();

    // Parcourir tout mon contenu pour détecter les activités
    allMyContent.forEach(({ item, type }) => {
      if (type === 'post') {
        const post = item as Post;
        
        // Grouper les soutiens sur ce post
        const supportKey = `support-post-${post.id}`;
        const supporters = post.supporters
          .filter(id => id !== currentUser.id)
          .map(id => getUserById(id))
          .filter(Boolean) as any[];
        
        if (supporters.length > 0) {
          groupedMap.set(supportKey, {
            id: supportKey,
            type: 'new_support',
            contentId: post.id,
            contentType: 'post',
            contentTitle: post.title || post.content.substring(0, 50) + '...',
            actors: supporters.map(s => ({ name: s.name, avatar: s.avatar })),
            timestamp: post.createdAt,
            count: supporters.length,
          });
        }

        // Grouper les réponses (replies) sur ce post
        const replyKey = `reply-post-${post.id}`;
        const repliers = post.replies
          .filter(reply => reply.authorId !== currentUser.id)
          .map(reply => ({
            user: getUserById(reply.authorId),
            date: reply.createdAt
          }))
          .filter(item => item.user);
        
        if (repliers.length > 0) {
          // Trouver la date de la réponse la plus récente
          const mostRecentDate = repliers.reduce((latest, item) => 
            item.date > latest ? item.date : latest, 
            repliers[0].date
          );

          groupedMap.set(replyKey, {
            id: replyKey,
            type: 'new_reply',
            contentId: post.id,
            contentType: 'post',
            contentTitle: post.title || post.content.substring(0, 50) + '...',
            actors: repliers.map(c => ({ name: c.user!.name, avatar: c.user!.avatar })),
            timestamp: mostRecentDate,
            count: repliers.length,
          });
        }
      } else {
        const idea = item as Idea;
        
        // Grouper les soutiens sur cette idée
        const supportKey = `support-idea-${idea.id}`;
        const supporters = idea.supporters
          .filter(id => id !== currentUser.id)
          .map(id => getUserById(id))
          .filter(Boolean) as any[];
        
        if (supporters.length > 0) {
          groupedMap.set(supportKey, {
            id: supportKey,
            type: 'new_support',
            contentId: idea.id,
            contentType: 'idea',
            contentTitle: idea.title,
            actors: supporters.map(s => ({ name: s.name, avatar: s.avatar })),
            timestamp: idea.createdAt,
            count: supporters.length,
          });
        }

        // Grouper les évaluations sur cette idée
        const ratingKey = `rating-idea-${idea.id}`;
        const raters = (idea.ratings || [])
          .filter(rating => rating.userId !== currentUser.id)
          .map(rating => getUserById(rating.userId))
          .filter(Boolean) as any[];
        
        if (raters.length > 0) {
          groupedMap.set(ratingKey, {
            id: ratingKey,
            type: 'new_rating',
            contentId: idea.id,
            contentType: 'idea',
            contentTitle: idea.title,
            actors: raters.map(r => ({ name: r.name, avatar: r.avatar })),
            timestamp: idea.createdAt,
            count: raters.length,
          });
        }

        // Nouvelles discussions dans ce projet
        if (idea.discussionThreads && idea.discussionThreads.length > 0) {
          const discussionKey = `discussion-idea-${idea.id}`;
          const discussionCreators = idea.discussionThreads
            .filter(thread => thread.createdBy !== currentUser.id)
            .map(thread => ({
              user: getUserById(thread.createdBy),
              date: thread.createdAt,
              title: thread.title
            }))
            .filter(item => item.user);

          if (discussionCreators.length > 0) {
            const mostRecentDate = discussionCreators.reduce((latest, item) => 
              item.date > latest ? item.date : latest, 
              discussionCreators[0].date
            );

            groupedMap.set(discussionKey, {
              id: discussionKey,
              type: 'new_discussion',
              contentId: idea.id,
              contentType: 'idea',
              contentTitle: idea.title,
              actors: discussionCreators.map(d => ({ name: d.user!.name, avatar: d.user!.avatar })),
              timestamp: mostRecentDate,
              count: discussionCreators.length,
              metadata: { discussionTitle: discussionCreators[0].title }
            });
          }
        }

        // Nouvelles versions de ce projet
        if (idea.versionHistory && idea.versionHistory.length > 1) {
          const versionKey = `version-idea-${idea.id}`;
          // Exclure la version initiale (version 1)
          const versions = idea.versionHistory
            .filter(v => v.version > 1)
            .map(v => ({
              user: getUserById(v.createdBy),
              date: v.createdAt,
              version: v.version,
              description: v.description
            }))
            .filter(item => item.user);

          if (versions.length > 0) {
            const mostRecentVersion = versions.reduce((latest, item) => 
              item.date > latest.date ? item : latest, 
              versions[0]
            );

            groupedMap.set(versionKey, {
              id: versionKey,
              type: 'new_version',
              contentId: idea.id,
              contentType: 'idea',
              contentTitle: idea.title,
              actors: versions.map(v => ({ name: v.user!.name, avatar: v.user!.avatar })),
              timestamp: mostRecentVersion.date,
              count: versions.length,
              metadata: { versionNumber: mostRecentVersion.version, description: mostRecentVersion.description }
            });
          }
        }
      }
    });

    // Détecter les projets créés à partir de mes posts
    const myPostIds = allPosts
      .filter(post => post.authorId === currentUser.id)
      .map(post => post.id);

    allIdeas.forEach(idea => {
      if (idea.sourcePostId && myPostIds.includes(idea.sourcePostId)) {
        const ideaKey = `idea-from-post-${idea.id}`;
        const creators = idea.creatorIds
          .filter(id => id !== currentUser.id)
          .map(id => getUserById(id))
          .filter(Boolean) as any[];

        if (creators.length > 0) {
          const sourcePost = allPosts.find(p => p.id === idea.sourcePostId);
          groupedMap.set(ideaKey, {
            id: ideaKey,
            type: 'idea_from_post',
            contentId: idea.id,
            contentType: 'idea',
            contentTitle: idea.title,
            actors: creators.map(c => ({ name: c.name, avatar: c.avatar })),
            timestamp: idea.createdAt,
            count: creators.length,
            metadata: { sourcePostTitle: sourcePost?.title || sourcePost?.content.substring(0, 50) + '...' }
          });
        }
      }
    });

    // Convertir en array et trier par date décroissante (plus récent d'abord)
    return Array.from(groupedMap.values()).sort((a, b) => {
      // Sécurité : vérifier que les timestamps existent et sont valides
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
      return timeB - timeA;
    });
  }, [allMyContent, currentUser, getUserById, allPosts, allIdeas]);

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_support': return <Heart className="h-4 w-4 text-red-500" />;
      case 'new_reply': return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'new_rating': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'new_discussion': return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case 'new_version': return <FileText className="h-4 w-4 text-orange-500" />;
      case 'idea_from_post': return <Lightbulb className="h-4 w-4 text-yellow-500" />;
      default: return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationText = (notification: Notification) => {
    const { count, type, contentType } = notification;
    
    if (count === 1) {
      // Une seule personne
      switch (type) {
        case 'new_support': return `a soutenu votre ${contentType === 'idea' ? 'projet' : 'post'}`;
        case 'new_reply': return 'a répondu à votre post';
        case 'new_rating': return 'a évalué votre projet';
        case 'new_discussion': return 'a créé une discussion sur votre projet';
        case 'new_version': return `a publié une nouvelle version de votre projet (v${notification.metadata?.versionNumber})`;
        case 'idea_from_post': return 'a créé un projet à partir de votre post';
        default: return 'a interagi avec votre contenu';
      }
    } else {
      // Plusieurs personnes
      switch (type) {
        case 'new_support': return `ont soutenu votre ${contentType === 'idea' ? 'projet' : 'post'}`;
        case 'new_reply': return 'ont répondu à votre post';
        case 'new_rating': return 'ont évalué votre projet';
        case 'new_discussion': return 'ont créé des discussions sur votre projet';
        case 'new_version': return `ont publié des nouvelles versions de votre projet`;
        case 'idea_from_post': return 'ont créé des projets à partir de votre post';
        default: return 'ont interagi avec votre contenu';
      }
    }
  };

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

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Alert>
          <AlertDescription>
            Veuillez vous connecter pour voir vos contributions
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="contributions" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Mes contributions
            <Badge variant="secondary" className="ml-2">{stats.total}</Badge>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
            {notifications.length > 0 && (
              <Badge variant="destructive" className="ml-2">{notifications.length}</Badge>
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

        {/* Tab: Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl text-gray-900">Activité sur vos contenus</h2>
              <p className="text-sm text-gray-600">
                Soutiens, commentaires et évaluations par ordre chronologique
              </p>
            </div>
            <Badge variant="secondary">{notifications.length} notification{notifications.length > 1 ? 's' : ''}</Badge>
          </div>

          {notifications.length === 0 ? (
            <Alert>
              <AlertDescription>
                Aucune activité pour le moment. Créez du contenu et attendez que la communauté interagisse !
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (notification.contentType === 'idea') {
                      onIdeaClick(notification.contentId);
                    } else {
                      onPostClick(notification.contentId);
                    }
                  }}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors border border-gray-100"
                >
                  <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    {notification.count === 1 ? (
                      // Une seule personne
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                          {notification.actors[0].avatar && (
                            <img src={notification.actors[0].avatar} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <span className="font-medium text-sm">{notification.actors[0].name}</span>
                        <span className="text-sm text-gray-600">
                          {getNotificationText(notification)}
                        </span>
                      </div>
                    ) : (
                      // Plusieurs personnes
                      <div className="mb-1">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Afficher jusqu'à 3 avatars */}
                          <div className="flex -space-x-2">
                            {notification.actors.slice(0, 3).map((actor, idx) => (
                              <div
                                key={idx}
                                className="h-6 w-6 rounded-full bg-gray-200 overflow-hidden border-2 border-white flex-shrink-0"
                              >
                                {actor.avatar && (
                                  <img src={actor.avatar} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                            ))}
                          </div>
                          <span className="font-medium text-sm">
                            {notification.count === 2 
                              ? `${notification.actors[0].name} et ${notification.actors[1].name}`
                              : `${notification.actors[0].name} et ${notification.count - 1} autres`
                            }
                          </span>
                          <span className="text-sm text-gray-600">
                            {getNotificationText(notification)}
                          </span>
                        </div>
                      </div>
                    )}
                    <p className="text-sm text-gray-700 truncate">"{notification.contentTitle}"</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.timestamp).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}