import { Idea, User } from '../types';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Heart, MessageSquare, MoreHorizontal, ExternalLink, Quote, Eye, MapPin, Flag, Share2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { UserLink } from './UserLink';
import { ContentActionDialogs } from './ContentActionDialogs';
import { ShareIdeaDialog } from './ShareIdeaDialog';
import { useState } from 'react';

interface IdeaCardProps {
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

export function IdeaCard({ 
  idea, 
  onIdeaClick, 
  onSupport, 
  currentUser, 
  showInteractions = true,
  onIgnore,
  onReport
}: IdeaCardProps) {
  // États pour les dialogues de confirmation
  const [isIgnoreDialogOpen, setIsIgnoreDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Utiliser l'Entity Store pour les actions optimisées et récupérer les données les plus récentes
  const { actions, getCurrentUser, getIdeaById } = useEntityStoreSimple();
  
  // Utiliser le currentUser du store si pas fourni en props
  const user = currentUser || getCurrentUser();
  
  // Récupérer l'idée la plus récente depuis le store
  const latestIdea = getIdeaById(idea.id) || idea;
  
  const isSupported = user && (latestIdea.supporters?.some(s => s.id === user.id) || false);
  const supportCount = latestIdea.supporters?.length || 0;
  const timeAgo = formatTimeAgo(latestIdea.createdAt);

  const handleSupportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Utiliser le prop onSupport passé par le parent
    onSupport(latestIdea.id);
  };

  const handleIdeaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Utiliser le prop onIdeaClick passé par le parent
    onIdeaClick(latestIdea.id);
  };

  // Handlers pour les dialogues de confirmation
  const handleIgnoreClick = () => {
    setIsIgnoreDialogOpen(true);
  };

  const handleReportClick = () => {
    setIsReportDialogOpen(true);
  };

  const handleIgnoreConfirm = () => {
    setIsIgnoreDialogOpen(false);
    if (onIgnore) {
      onIgnore(latestIdea.id);
    }
  };

  const handleReportConfirm = () => {
    setIsReportDialogOpen(false);
    if (onReport) {
      onReport(latestIdea.id);
    }
  };

  const handleIgnoreCancel = () => {
    setIsIgnoreDialogOpen(false);
  };

  const handleReportCancel = () => {
    setIsReportDialogOpen(false);
  };

  // Détermine la catégorie principale basée sur les tags
  const getPrimaryCategory = () => {
    if (!latestIdea.tags || latestIdea.tags.length === 0) return 'Projet';
    
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
    
    return latestIdea.tags[0] || 'Projet';
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50/50 transition-colors shadow-sm group"
    >
      {/* Titre et actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Titre */}
          <h3 
            className="line-clamp-1 mb-3 group-hover:text-primary transition-colors cursor-pointer hover:underline"
            onClick={handleIdeaClick}
          >
            {latestIdea.title}
          </h3>
          
          {/* Localisation avec badge Projet */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            {latestIdea.creators.length > 0 && latestIdea.creators[0].location && (
              <>
                <MapPin className="w-4 h-4" />
                <span>{latestIdea.creators[0].location}</span>
                <span>•</span>
              </>
            )}
            <Badge variant="secondary" className="text-xs bg-primary/5 text-primary border-primary/20">
              Projet
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
                handleIgnoreClick();
              }}>
                Masquer ce projet
              </DropdownMenuItem>
            )}
            {onReport && (
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleReportClick();
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

      {/* Contenu du projet */}
      <div className="space-y-3 mb-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
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

      {/* Auteur - après la description */}
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
                  className="text-xs text-muted-foreground hover:text-gray-600 h-8 px-3 sm:h-6 sm:px-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  Ignorer/Signaler
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {onIgnore && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleIgnoreClick();
                  }}>
                    Masquer ce projet
                  </DropdownMenuItem>
                )}
                {onReport && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReportClick();
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
              className="flex items-center space-x-1 h-10 px-4 sm:h-9 sm:px-3"
            >
              <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Voir détails</span>
            </Button>
            
            <ShareIdeaDialog ideaId={latestIdea.id} ideaTitle={latestIdea.title}>
              <Button 
                variant="outline"
                size="sm"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center space-x-1 h-10 px-4 sm:h-9 sm:px-3"
              >
                <Share2 className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Partager</span>
              </Button>
            </ShareIdeaDialog>
            
            <Button 
              size="sm"
              className={`flex items-center space-x-1 h-10 px-4 sm:h-9 sm:px-3 ${
                isSupported 
                  ? 'bg-[#4f75ff] hover:bg-[#3b5ce6] text-white' 
                  : 'bg-[#4f75ff] hover:bg-[#3b5ce6] text-white'
              }`}
              onClick={handleSupportClick}
            >
              <Heart className={`w-5 h-5 sm:w-4 sm:h-4 ${isSupported ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Soutenir</span>
              {isSupported && (
                <Badge variant="secondary" className="ml-1 bg-white/20 text-white">
                  {supportCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Dialogues de confirmation */}
      <ContentActionDialogs
        isIgnoreDialogOpen={isIgnoreDialogOpen}
        isReportDialogOpen={isReportDialogOpen}
        contentType="projet"
        contentId={latestIdea.id}
        onIgnoreCancel={handleIgnoreCancel}
        onIgnoreConfirm={handleIgnoreConfirm}
        onReportCancel={handleReportCancel}
        onReportConfirm={handleReportConfirm}
      />
    </div>
  );
}