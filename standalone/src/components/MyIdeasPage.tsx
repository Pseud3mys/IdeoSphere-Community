import { useState, useMemo } from 'react';
import { Idea, User, Post, FeedItem } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { IdeaCard } from './IdeaCard';
import { PostCard } from './PostCard';
import { 
  Search,
  ChevronDown,
  Target,
  ArrowUpDown,
  MessageSquare,
  Heart,
  Lightbulb,
  Globe,
  TrendingUp,
  Calendar,
  ArrowUpAZ
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface MyIdeasPageProps {
  onIdeaClick: (ideaId: string) => void;
  onPostClick: (postId: string) => void;
  onLike: (postId: string) => void;
  onSupport: (ideaId: string) => void;
  onIgnoreIdea?: (ideaId: string) => void;
  onReportIdea?: (ideaId: string) => void;
  onIgnorePost?: (postId: string) => void;
  onReportPost?: (postId: string) => void;
  onCreateContent?: () => void;
}

// Types simplifiés
type ContributionSection = 'participations' | 'supports';
type ContentFilter = 'all' | 'posts' | 'ideas';
type SortOrder = 'recent' | 'popular' | 'alphabetical' | 'oldest';

const contributionSections = [
  { value: 'participations', label: 'Mes participations', icon: Target },
  { value: 'supports', label: 'Mes soutiens', icon: Heart },
] as const;

const contentFilters = [
  { value: 'all', label: 'Tout', icon: Globe },
  { value: 'posts', label: 'Posts', icon: MessageSquare },
  { value: 'ideas', label: 'Projets', icon: Lightbulb },
] as const;

const sortOptions = [
  { value: 'recent', label: 'Plus récent', icon: Calendar },
  { value: 'popular', label: 'Plus populaire', icon: TrendingUp },
  { value: 'alphabetical', label: 'Alphabétique', icon: ArrowUpAZ },
  { value: 'oldest', label: 'Plus ancien', icon: Calendar },
] as const;



export function MyIdeasPage({ 
  onIdeaClick, 
  onPostClick,
  onLike,
  onSupport,
  onIgnoreIdea,
  onReportIdea,
  onIgnorePost,
  onReportPost,
  onCreateContent
}: MyIdeasPageProps) {
  // Récupération des données depuis l'Entity Store
  const {
    getCurrentUser,
    getMyContributions
  } = useEntityStoreSimple();

  const currentUser = getCurrentUser();
  const myContributions = getMyContributions();

  // Si currentUser est null ou pas de contributions, ne pas afficher le composant
  if (!currentUser || !myContributions) {
    return <div>Chargement de vos contributions...</div>;
  }

  // Vérifier que myContributions a la structure attendue
  if (!myContributions.participationPosts || !myContributions.participationIdeas || 
      !myContributions.supportPosts || !myContributions.supportIdeas) {
    return <div>Chargement de vos contributions...</div>;
  }

  const [contributionSection, setContributionSection] = useState<ContributionSection>('participations');
  const [contentFilter, setContentFilter] = useState<ContentFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');
  const [searchQuery, setSearchQuery] = useState('');

  // Utiliser les contributions récupérées du store avec protections
  const userContent = useMemo(() => {
    return {
      // Participations actives (récupérées depuis le store)
      participationPosts: myContributions?.participationPosts || [],
      participationIdeas: myContributions?.participationIdeas || [],
      
      // Soutiens uniquement (récupérées depuis le store)
      supportPosts: myContributions?.supportPosts || [],
      supportIdeas: myContributions?.supportIdeas || [],
      
      // Pour les stats (récupérées depuis le store)
      myPosts: myContributions?.myPosts || [],
      myIdeas: myContributions?.myIdeas || [],
      commentedPosts: myContributions?.commentedPosts || [],
      ratedIdeas: myContributions?.ratedIdeas || [],
      likedPosts: myContributions?.likedPosts || [],
      supportedIdeas: myContributions?.supportedIdeas || []
    };
  }, [myContributions]);

  // Créer le feed filtré et trié
  const filteredContent = useMemo(() => {
    let feedItems: (FeedItem & { type: 'post' | 'idea' })[] = [];

    // Choisir la section d'abord avec protections
    const postsToShow = contributionSection === 'participations' 
      ? (userContent.participationPosts || [])
      : (userContent.supportPosts || []);
    const ideasToShow = contributionSection === 'participations' 
      ? (userContent.participationIdeas || [])
      : (userContent.supportIdeas || []);

    // Filtrer par type de contenu
    switch (contentFilter) {
      case 'all':
        feedItems.push(...postsToShow.map(post => ({ ...post, type: 'post' as const })));
        feedItems.push(...ideasToShow.map(idea => ({ ...idea, type: 'idea' as const })));
        break;
      case 'posts':
        feedItems.push(...postsToShow.map(post => ({ ...post, type: 'post' as const })));
        break;
      case 'ideas':
        feedItems.push(...ideasToShow.map(idea => ({ ...idea, type: 'idea' as const })));
        break;
    }

    // Filtrer par recherche
    if (searchQuery) {
      feedItems = feedItems.filter(item => {
        const content = item.type === 'post' ? item.content : `${item.title} ${item.summary}`;
        const tags = item.tags?.join(' ') || '';
        const author = item.type === 'post' ? item.author?.name || '' : item.creators?.[0]?.name || '';
        return (content + tags + author).toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Trier
    switch (sortOrder) {
      case 'recent':
        feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'oldest':
        feedItems.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'popular':
        feedItems.sort((a, b) => {
          const aSupports = a.type === 'post' ? (a.supporters?.length || 0) : (a.supporters?.length || 0);
          const aPopularity = a.type === 'post' ? aSupports + (a.replies?.length || 0) : aSupports;
          const bSupports = b.type === 'post' ? (b.supporters?.length || 0) : (b.supporters?.length || 0);
          const bPopularity = b.type === 'post' ? bSupports + (b.replies?.length || 0) : bSupports;
          return bPopularity - aPopularity;
        });
        break;
      case 'alphabetical':
        feedItems.sort((a, b) => {
          const aTitle = a.type === 'post' ? a.content.substring(0, 50) : a.title;
          const bTitle = b.type === 'post' ? b.content.substring(0, 50) : b.title;
          return aTitle.localeCompare(bTitle);
        });
        break;
    }

    return feedItems;
  }, [userContent, contributionSection, contentFilter, sortOrder, searchQuery]);

  // Statistiques
  const stats = {
    participations: (userContent.participationPosts?.length || 0) + (userContent.participationIdeas?.length || 0),
    supports: (userContent.supportPosts?.length || 0) + (userContent.supportIdeas?.length || 0),
    myCreations: (userContent.myPosts?.length || 0) + (userContent.myIdeas?.length || 0)
  };

  const selectedContentFilter = contentFilters.find(f => f.value === contentFilter);
  const selectedSortOption = sortOptions.find(s => s.value === sortOrder);
  const selectedSection = contributionSections.find(s => s.value === contributionSection);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header personnel */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Avatar className="w-12 h-12 ring-3 ring-blue-100">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback className="bg-gradient-to-br from-[#4f75ff] to-purple-600 text-white">
              {currentUser.name.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl text-gray-900">Mes contributions</h1>
            <p className="text-gray-600">Votre activité sur IdeoSphere</p>
          </div>
        </div>
        
        {/* Statistiques simples */}
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1 text-[#4f75ff]">
              <Target className="w-4 h-4" />
              <span>{stats.participations}</span>
            </div>
            <span className="text-xs text-gray-500">Participations</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1 text-green-600">
              <Heart className="w-4 h-4" />
              <span>{stats.supports}</span>
            </div>
            <span className="text-xs text-gray-500">Soutiens</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center space-x-1 text-purple-600">
              <Lightbulb className="w-4 h-4" />
              <span>{stats.myCreations}</span>
            </div>
            <span className="text-xs text-gray-500">Créations</span>
          </div>
        </div>
      </div>

      {/* Sélecteur de section */}
      <div className="mb-6">
        <div className="flex rounded-lg border border-gray-200 p-1 bg-white max-w-sm mx-auto">
          {contributionSections.map((section) => (
            <button
              key={section.value}
              onClick={() => setContributionSection(section.value)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm transition-colors ${
                contributionSection === section.value
                  ? 'bg-[#4f75ff] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <section.icon className="w-4 h-4" />
              <span>{section.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Rechercher dans vos contributions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full border-gray-200"
          />
        </div>
      </div>

      {/* Filtres et tri */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        {/* Filtre de contenu */}
        <div className="flex-1">
          <div className="flex rounded-lg border border-gray-200 p-1 bg-white">
            {contentFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setContentFilter(filter.value)}
                className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  contentFilter === filter.value
                    ? 'bg-[#4f75ff] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <filter.icon className="w-4 h-4" />
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu de tri */}
        <div className="sm:w-48">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="w-4 h-4" />
                  <span>{selectedSortOption?.label || 'Trier par'}</span>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSortOrder(option.value)}
                  className={`cursor-pointer ${
                    sortOrder === option.value ? 'bg-[#e8f0ff] text-[#4f75ff]' : ''
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <option.icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Résumé du filtre actuel */}
      <div className="mb-6 flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
        <div className="flex items-center space-x-2">
          {selectedSection && <selectedSection.icon className="w-4 h-4" />}
          <span>
            {selectedSection?.label} • {filteredContent.length} {selectedContentFilter?.label.toLowerCase()}
            {searchQuery && ` trouvé${filteredContent.length > 1 ? 's' : ''} pour "${searchQuery}"`}
          </span>
        </div>
        <div className="flex items-center space-x-1 text-xs">
          {selectedSortOption && <selectedSortOption.icon className="w-3 h-3" />}
          <span>{selectedSortOption?.label}</span>
        </div>
      </div>

      {/* Feed de contenu */}
      <div className="space-y-4">
        {filteredContent.length > 0 ? (
          filteredContent.map(item => (
            <div key={`${item.type}-${item.id}`} className="relative">
              {/* Badge de type pour clarifier */}
              <div className="absolute top-3 right-3 z-10">
                {item.type === 'post' ? (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 text-xs">
                    Post
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700 text-xs">
                    Projet
                  </Badge>
                )}
              </div>

              {item.type === 'post' ? (
                <PostCard
                  post={item}
                  onPostClick={onPostClick}
                  onLike={onLike}
                  currentUser={currentUser}
                  onIgnore={onIgnorePost}
                  onReport={onReportPost}
                />
              ) : (
                <IdeaCard
                  idea={item}
                  onIdeaClick={onIdeaClick}
                  onSupport={onSupport}
                  currentUser={currentUser}
                  onIgnore={onIgnoreIdea}
                  onReport={onReportIdea}
                />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {selectedSection && <selectedSection.icon className="w-8 h-8 text-gray-400" />}
            </div>
            <h3 className="text-gray-900 mb-2">
              {contributionSection === 'participations' ? 'Aucune participation' : 'Aucun soutien'}
            </h3>
            <p className="text-gray-600 text-sm max-w-sm mx-auto">
              {searchQuery 
                ? `Aucun contenu trouvé pour "${searchQuery}"`
                : contributionSection === 'participations'
                ? 'Vous n\'avez pas encore créé ou commenté de contenu.'
                : 'Vous n\'avez pas encore soutenu de contenu.'}
            </p>
            
            {!searchQuery && contributionSection === 'participations' && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={onCreateContent}
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Créer du contenu
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Fin de liste */}
      {filteredContent.length > 5 && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-400">
            <div className="w-8 h-px bg-gray-200"></div>
            <span>Fin des résultats</span>
            <div className="w-8 h-px bg-gray-200"></div>
          </div>
        </div>
      )}
    </div>
  );
}