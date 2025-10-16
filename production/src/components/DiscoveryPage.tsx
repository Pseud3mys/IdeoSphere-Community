import { useState, useEffect } from 'react';
import { Idea, User, Post, FeedItem } from '../types';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { IdeaCard } from './IdeaCard';
import { PostCard } from './PostCard';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { 
  Plus,
  Sparkles,
  Users,
  TrendingUp,
  MessageSquare,
  Lightbulb,
  ChevronDown,
  Clock,
  Zap
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface DiscoveryPageProps {
  onIdeaClick: (ideaId: string) => void;
  onPostClick: (postId: string) => void;
  onLike: (postId: string) => void;
  onSupport: (ideaId: string) => void;
  onPromoteToIdea: (postId: string) => void;
  // Removed unused prop: showNewUserTips
  onIgnoreIdea?: (ideaId: string) => void;
  onReportIdea?: (ideaId: string) => void;
  onIgnorePost?: (postId: string) => void;
  onReportPost?: (postId: string) => void;
}

type ContentFilter = 'all' | 'posts' | 'ideas';
type SortOrder = 'default' | 'chronological' | 'trending';

export function DiscoveryPage({ 
  onIdeaClick, 
  onPostClick, 
  onLike,
  onSupport,
  onPromoteToIdea,
  // Removed unused param: showNewUserTips
  onIgnoreIdea,
  onReportIdea,
  onIgnorePost,
  onReportPost
}: DiscoveryPageProps) {
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  // ✅ Stocker l'ordre des items pour éviter le re-tri à chaque interaction
  const [sortedItemsCache, setSortedItemsCache] = useState<(FeedItem & { type: 'post' | 'idea' })[]>([]);
  const [lastSortKey, setLastSortKey] = useState<string>('default-all');
  // Removed unused state: showTips

  // Utiliser l'Entity Store pour les données optimisées
  const { 
    getFeedItems,
    getFeedItemsFlat,
    getHomePageData, 
    getCurrentUser,
    actions
  } = useEntityStoreSimple();

  // Récupérer les données depuis le store avec la structure standardisée
  const feedData = getFeedItems();
  const homeData = getHomePageData();
  const currentUser = getCurrentUser();
  
  // Extraire les idées et posts depuis le feed structuré
  const ideas = feedData.ideas;
  const posts = feedData.posts;

  // Si currentUser est null, ne pas afficher le composant
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Utiliser la fonction flat pour récupérer les items avec discriminants de type
  const createFeedItems = (): (FeedItem & { type: 'post' | 'idea' })[] => {
    return getFeedItemsFlat();
  };

  const getFilteredAndSortedItems = () => {
    let items = createFeedItems();
    
    // Filtrer par type de contenu
    switch (contentFilter) {
      case 'ideas':
        items = items.filter(item => item.type === 'idea');
        break;
      case 'posts':
        items = items.filter(item => item.type === 'post');
        break;
      default:
        // 'all' - garder tous les items
        break;
    }

    // Trier selon l'ordre choisi
    switch (sortOrder) {
      case 'chronological':
        return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      case 'trending':
        return items
          .sort((a, b) => {
            const scoreA = a.type === 'post' 
              ? (a.supporters?.length || 0) + a.replies.length * 2 
              : (a.supporters?.length || 0) + (a.discussionTopics?.length || 0) * 2;
            const scoreB = b.type === 'post' 
              ? (b.supporters?.length || 0) + b.replies.length * 2 
              : (b.supporters?.length || 0) + (b.discussionTopics?.length || 0) * 2;
            return scoreB - scoreA;
          })
          .slice(0, 20);
      
      default: // 'default'
        // Algorithme "par défaut" - mix équilibré récent + engagement
        return items.sort((a, b) => {
          const now = Date.now();
          const ageA = (now - a.createdAt.getTime()) / (1000 * 60 * 60); // en heures
          const ageB = (now - b.createdAt.getTime()) / (1000 * 60 * 60);
          
          const engagementA = a.type === 'post' 
            ? (a.supporters?.length || 0) + a.replies.length * 1.5
            : (a.supporters?.length || 0) + (a.discussionTopics?.length || 0) * 1.5;
          const engagementB = b.type === 'post' 
            ? (b.supporters?.length || 0) + b.replies.length * 1.5
            : (b.supporters?.length || 0) + (b.discussionTopics?.length || 0) * 1.5;
          
          // Score combiné : engagement / âge (plus récent = meilleur)
          const scoreA = engagementA / Math.max(ageA / 24, 0.1); // normaliser par jour
          const scoreB = engagementB / Math.max(ageB / 24, 0.1);
          
          return scoreB - scoreA;
        });
    }
  };

  // Charger les données du feed au montage du composant
  useEffect(() => {
    actions.fetchFeed();
  }, []);

  // ✅ Initialiser le cache lors du premier chargement des données
  useEffect(() => {
    if ((ideas.length > 0 || posts.length > 0) && sortedItemsCache.length === 0) {
      const initialSortedItems = getFilteredAndSortedItems();
      setSortedItemsCache(initialSortedItems);
      console.log('🎯 [DiscoveryPage] Initialisation du cache avec', initialSortedItems.length, 'items');
    }
  }, [ideas.length, posts.length]);

  // ✅ Recalculer le tri uniquement quand le filtre ou l'ordre change
  const currentSortKey = `${sortOrder}-${contentFilter}`;
  useEffect(() => {
    if (currentSortKey !== lastSortKey) {
      const newSortedItems = getFilteredAndSortedItems();
      setSortedItemsCache(newSortedItems);
      setLastSortKey(currentSortKey);
      console.log('🔄 [DiscoveryPage] Tri recalculé:', currentSortKey);
    }
  }, [sortOrder, contentFilter, currentSortKey, lastSortKey]);

  // ✅ Utiliser le cache d'items triés, mais avec les données à jour du store
  // On garde l'ordre mais on met à jour les données (supportCount, etc.)
  const filteredItems = sortedItemsCache.length > 0 ? sortedItemsCache.map(cachedItem => {
    if (cachedItem.type === 'post') {
      const updatedPost = posts.find(p => p.id === cachedItem.id);
      return updatedPost ? { ...updatedPost, type: 'post' as const } : cachedItem;
    } else {
      const updatedIdea = ideas.find(i => i.id === cachedItem.id);
      return updatedIdea ? { ...updatedIdea, type: 'idea' as const } : cachedItem;
    }
  }) : [];
  
  // Statistiques du feed (utiliser les données du store)
  const totalPosts = posts.length;
  const totalIdeas = ideas.length;
  const totalParticipants = homeData.totalContributions; // Utiliser totalContributions depuis homeData

  const getContentFilterLabel = (filter: ContentFilter) => {
    switch (filter) {
      case 'ideas': return 'Projets';
      case 'posts': return 'Posts';
      default: return 'Tout';
    }
  };

  const getSortOrderLabel = (order: SortOrder) => {
    switch (order) {
      case 'chronological': return 'Chronologique';
      case 'trending': return 'Tendances';
      default: return 'Par défaut';
    }
  };

  const getSortOrderIcon = (order: SortOrder) => {
    switch (order) {
      case 'chronological': return Clock;
      case 'trending': return TrendingUp;
      default: return Zap;
    }
  };

  const getContentCount = (filter: ContentFilter) => {
    switch (filter) {
      case 'ideas': return totalIdeas;
      case 'posts': return totalPosts;
      default: return totalPosts + totalIdeas;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header accueillant */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-2 mb-3">
          <Sparkles className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl text-gray-900">Fil de la communauté</h1>
          <Sparkles className="w-6 h-6 text-blue-500" />
        </div>
        <p className="text-gray-600 max-w-md mx-auto">
          Découvrez les conversations et idées de votre communauté
        </p>
        
        {/* Stats rassurantes */}
        <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageSquare className="w-4 h-4" />
            <span>{totalPosts} contributions</span>
          </div>
          <div className="flex items-center space-x-1">
            <Lightbulb className="w-4 h-4" />
            <span>{totalIdeas} projets</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{totalParticipants} soutiens</span>
          </div>
        </div>
      </div>

      {/* Navigation améliorée */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        {/* Filtres de contenu */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
          {(['all', 'posts', 'ideas'] as ContentFilter[]).map((filter) => (
            <Button
              key={filter}
              variant={contentFilter === filter ? "default" : "ghost"}
              size="sm"
              onClick={() => setContentFilter(filter)}
              className={`rounded-full px-4 h-8 transition-all ${
                contentFilter === filter 
                  ? 'bg-white shadow-sm text-gray-900' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filter === 'posts' && <MessageSquare className="w-3 h-3 mr-1" />}
              {filter === 'ideas' && <Lightbulb className="w-3 h-3 mr-1" />}
              {getContentFilterLabel(filter)}
              <span className="ml-1 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                {getContentCount(filter)}
              </span>
            </Button>
          ))}
        </div>

        {/* Sélecteur d'ordre */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-full px-4 h-8">
              {(() => {
                const Icon = getSortOrderIcon(sortOrder);
                return (
                  <>
                    <Icon className="w-3 h-3 mr-2" />
                    {getSortOrderLabel(sortOrder)}
                    <ChevronDown className="w-3 h-3 ml-2" />
                  </>
                );
              })()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {(['default', 'chronological', 'trending'] as SortOrder[]).map((order) => {
              const Icon = getSortOrderIcon(order);
              return (
                <DropdownMenuItem
                  key={order}
                  onClick={() => setSortOrder(order)}
                  className={`flex items-center space-x-2 ${
                    sortOrder === order ? 'bg-blue-50 text-blue-700' : ''
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{getSortOrderLabel(order)}</span>
                  {order === 'default' && (
                    <span className="text-xs text-gray-500 ml-auto">Recommandé</span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Indicateur du filtre actuel */}
      {(contentFilter !== 'all' || sortOrder !== 'default') && (
        <div className="mb-4 text-sm text-gray-600">
          Affichage : {getContentFilterLabel(contentFilter)}
          {sortOrder !== 'default' && ` • ${getSortOrderLabel(sortOrder)}`}
          <span className="ml-2 text-gray-400">({filteredItems.length} résultat{filteredItems.length > 1 ? 's' : ''})</span>
        </div>
      )}

      {/* Feed mixte */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            item.type === 'post' ? (
              <PostCard
                key={`post-${item.id}`}
                post={item}
                onPostClick={onPostClick}
                onLike={onLike}
                currentUser={currentUser}
                onIgnore={onIgnorePost}
                onReport={onReportPost}
              />
            ) : (
              <IdeaCard
                key={`idea-${item.id}`}
                idea={item}
                onIdeaClick={onIdeaClick}
                onSupport={onSupport}
                currentUser={currentUser}
                onIgnore={onIgnoreIdea}
                onReport={onReportIdea}
              />
            )
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">
              {contentFilter === 'posts' ? 'Aucun post pour le moment' :
               contentFilter === 'ideas' ? 'Aucun projet pour le moment' : 'Aucun contenu pour le moment'}
            </h3>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              Soyez le premier à partager avec votre communauté !
            </p>
          </div>
        )}
      </div>

      {/* Encouragement à participer */}
      {filteredItems.length > 0 && contentFilter === 'all' && (
        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-3">
              {/* Avatars de membres actifs */}
              <div className="flex -space-x-2">
                {[...posts, ...ideas].slice(0, 3).map((item, index) => {
                  const author = 'author' in item ? item.author : item.creators[0];
                  return (
                    <Avatar key={index} className="w-8 h-8 ring-2 ring-white">
                      <AvatarImage src={author?.avatar} alt={author?.name} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        {author?.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center ring-2 ring-white">
                  <Plus className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
            <h3 className="text-gray-900 mb-2">Vous aussi, participez !</h3>
            <p className="text-gray-600 text-sm mb-4">
              Partagez un post rapide ou développez une idée complète avec la communauté.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <Button 
                variant="outline"
                className="rounded-full flex items-center space-x-1"
                onClick={() => actions.goToTab('create')}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Poster</span>
              </Button>
              <Button 
                className="rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={() => actions.goToTab('create')}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Créer une idée
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de fin de feed */}
      {filteredItems.length > 5 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-8 h-px bg-gray-200"></div>
            <span>Vous êtes à jour</span>
            <div className="w-8 h-px bg-gray-200"></div>
          </div>
        </div>
      )}
    </div>
  );
}