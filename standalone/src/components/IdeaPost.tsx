import { Idea, User } from '../types';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Heart, MessageSquare, Users, MoreHorizontal, Lightbulb, ExternalLink, Eye, MapPin, Flag } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

interface IdeaPostProps {
  idea: Idea;
  onIdeaClick: (ideaId: string) => void;
  onSupport: (ideaId: string) => void;
  currentUser?: User;
  showInteractions?: boolean;
  onIgnore?: (ideaId: string) => void;
  onReport?: (ideaId: string) => void;
}

// Simple function to format time distance
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jour${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''}`;
  
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short'
  });
}

export function IdeaPost({ idea, onIdeaClick, onSupport, currentUser, showInteractions = true, onIgnore, onReport }: IdeaPostProps) {
  // Utiliser l'Entity Store pour les actions optimisées et récupérer les données les plus récentes
  const { actions, getCurrentUser, getIdeaById } = useEntityStoreSimple();
  
  // Utiliser le currentUser du store si pas fourni en props
  const user = currentUser || getCurrentUser();
  
  // Récupérer l'idée la plus récente depuis le store
  const latestIdea = getIdeaById(idea.id) || idea;
  
  const isSupported = user && latestIdea.supporters.some(s => s.id === user.id);
  const timeAgo = formatTimeAgo(latestIdea.createdAt);

  const handleSupportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Utiliser l'action du store pour support/unsupport automatique
    actions.supportIdea(latestIdea.id);
  };

  const handleIdeaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Utiliser l'action du store pour navigation
    actions.goToIdea(latestIdea.id);
  };

  // Détermine la catégorie principale basée sur les tags
  const getPrimaryCategory = () => {
    if (!latestIdea.tags || latestIdea.tags.length === 0) return 'Idée';
    
    const categoryMap: { [key: string]: string } = {
      'mobilité': 'Mobilité',
      'transport': 'Mobilité',
      'vélo': 'Mobilité',
      'environnement': 'Environnement',
      'écologie': 'Environnement',
      'compost': 'Environnement',
      'social': 'Social',
      'éducation': 'Social',
      'solidarité': 'Social',
      'accessibilité': 'Accessibilité',
      'handicap': 'Accessibilité',
      'économie': 'Économie locale',
      'commerce': 'Économie locale',
      'marché': 'Économie locale'
    };

    for (const tag of latestIdea.tags) {
      const normalized = tag.toLowerCase();
      for (const [key, category] of Object.entries(categoryMap)) {
        if (normalized.includes(key)) {
          return category;
        }
      }
    }
    
    return latestIdea.tags[0] || 'Idée';
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50/50 transition-colors cursor-pointer shadow-sm group"
      onClick={handleIdeaClick}
    >
      {/* Titre et actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="line-clamp-1 mb-3 group-hover:text-primary transition-colors">
            {latestIdea.title}
          </h3>
          
          {/* Localisation avec badge Idée */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            {latestIdea.creators.length > 0 && latestIdea.creators[0].location && (
              <>
                <MapPin className="w-4 h-4" />
                <span>{latestIdea.creators[0].location}</span>
                <span>•</span>
              </>
            )}
            <Badge variant="secondary" className="text-xs bg-primary/5 text-primary border-primary/20">
              Idée
            </Badge>
          </div>
        </div>
        
        {/* Menu d'actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onIgnore && (
              <DropdownMenuItem onClick={(e) => {
                e.stopPropagation();
                onIgnore(latestIdea.id);
              }}>
                Masquer cette idée
              </DropdownMenuItem>
            )}
            {onReport && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onReport(latestIdea.id);
                }}
                className="text-destructive"
              >
                <Flag className="w-4 h-4 mr-2" />
                Signaler
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Description */}
      <div className="space-y-3 mb-3">
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {latestIdea.summary}
        </p>
        
        {/* Tags extraits des hashtags */}
        {latestIdea.tags && latestIdea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {latestIdea.tags.slice(0, 4).map(tag => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs text-blue-600 border-blue-200 bg-blue-50"
              >
                #{tag}
              </Badge>
            ))}
            {latestIdea.tags.length > 4 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{latestIdea.tags.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Créateurs - afficher 1 ou 2 noms */}
      <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
        <Avatar className="w-5 h-5">
          <AvatarImage src={latestIdea.creators[0]?.avatar} alt={latestIdea.creators[0]?.name} />
          <AvatarFallback className="text-xs">{latestIdea.creators[0]?.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <span>
          {latestIdea.creators.length === 1 
            ? latestIdea.creators[0].name
            : latestIdea.creators.length === 2
              ? `${latestIdea.creators[0].name} et ${latestIdea.creators[1].name}`
              : `${latestIdea.creators[0].name} et ${latestIdea.creators.length - 1} autre${latestIdea.creators.length > 2 ? 's' : ''}`
          }
        </span>
        
        <span>•</span>
        <span>{timeAgo}</span>
      </div>

      {/* Actions */}
      {showInteractions && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            {/* Bouton discret ignorer/signaler */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground hover:text-gray-600 h-6 px-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Ignorer/Signaler
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {onIgnore && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onIgnore(latestIdea.id);
                  }}>
                    Masquer cette idée
                  </DropdownMenuItem>
                )}
                {onReport && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onReport(latestIdea.id);
                    }}
                    className="text-destructive"
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Signaler
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="outline"
              size="sm"
              onClick={handleIdeaClick}
              className="flex items-center space-x-1"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Voir détails</span>
            </Button>
            
            <Button 
              size="sm"
              className={`flex items-center space-x-1 ${
                isSupported 
                  ? 'bg-[#4f75ff] hover:bg-[#3b5ce6] text-white' 
                  : 'bg-[#4f75ff] hover:bg-[#3b5ce6] text-white'
              }`}
              onClick={handleSupportClick}
            >
              <Heart className={`w-4 h-4 ${isSupported ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isSupported ? 'Soutenu' : 'Soutenir'}</span>
              {isSupported && (
                <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                  {latestIdea.supportCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}