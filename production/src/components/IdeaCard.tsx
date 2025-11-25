import { Link } from 'react-router-dom';
import { Idea, User } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Eye, MapPin, Flag } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { ContentActionDialogs } from './ContentActionDialogs';
import { ChainBadge } from './ChainBadge';
import { ItemChainContext } from '../utils/feedChainUtils';
import { useState } from 'react';
import { CreatorAvatar } from './CreatorAvatar';
import { CreatorNames } from './CreatorNames';
import { getFirstCreator } from '../utils/userValidation';
import { GroupBadgeList } from './group/GroupBadgeList';

interface IdeaCardProps {
  idea: Idea;
  onIdeaClick: (ideaId: string) => void;
  onSupport: (ideaId: string) => void;
  currentUser?: User;
  showInteractions?: boolean;
  onIgnore?: (ideaId: string) => void;
  onReport?: (ideaId: string) => void;
  chainContext?: ItemChainContext;
  onPostClick?: (postId: string) => void;
  onLike?: (postId: string) => void;
}

function formatTimeAgo(date: Date | undefined): string {
  if (!date) return 'Date inconnue';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
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
  onReport,
  chainContext,
  onPostClick,
  onLike
}: IdeaCardProps) {
  const [isIgnoreDialogOpen, setIsIgnoreDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const { getCurrentUser, getIdeaById, getUserById } = useEntityStoreSimple();
  
  const user = currentUser || getCurrentUser();
  const latestIdea = getIdeaById(idea.id) || idea;
  
  const isSupported = user && (latestIdea.supporters?.includes(user.id) || false);
  const supportCount = latestIdea.supporters?.length || 0;
  const timeAgo = formatTimeAgo(latestIdea.createdAt);

  const handleSupportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSupport(latestIdea.id);
  };

  const handleIdeaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onIdeaClick(latestIdea.id);
  };

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

  const firstCreator = getFirstCreator(latestIdea.creatorIds, getUserById);

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50/50 transition-colors shadow-sm group"
    >
      {/* Titre */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link to={`/content/${latestIdea.id}`}>
            <h3 
              className="line-clamp-2 mb-3 group-hover:text-primary transition-colors cursor-pointer hover:underline"
            >
              {latestIdea.title}
            </h3>
          </Link>
          
          {/* Localisation et badges */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 flex-wrap">
            {latestIdea.location && (
              <>
                <MapPin className="w-4 h-4" />
                <span>{latestIdea.location}</span>
                <span>•</span>
              </>
            )}
            <Badge variant="secondary" className="text-xs bg-primary/5 text-primary border-primary/20">
              Projet
            </Badge>
            {chainContext && chainContext.isInChain && (
              <>
                <span>•</span>
                <ChainBadge 
                  context={chainContext} 
                  itemType="idea"
                />
              </>
            )}
            {latestIdea.groupIds && latestIdea.groupIds.length > 0 && (
              <>
                <span>•</span>
                <GroupBadgeList groupIds={latestIdea.groupIds} maxDisplay={2} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenu de l'idée */}
      <div className="space-y-3 mb-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {latestIdea.summary || latestIdea.description}
        </p>
        
        {/* Tags */}
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

      {/* Créateurs */}
      {firstCreator && (
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
          <CreatorAvatar 
            creatorIds={latestIdea.creatorIds} 
            getUserById={getUserById}
            className="w-5 h-5"
          />
          <CreatorNames 
            creatorIds={latestIdea.creatorIds}
            getUserById={getUserById}
          />
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      )}

      {/* Actions */}
      {showInteractions && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
            {/* Bouton ignorer/signaler */}
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
                    Masquer cette idée
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
            <Link to={`/content/${latestIdea.id}`}>
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center space-x-1 h-10 px-4 sm:h-9 sm:px-3"
              >
                <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Voir détails</span>
              </Button>
            </Link>
            
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

      {/* Dialogues */}
      <ContentActionDialogs
        isIgnoreDialogOpen={isIgnoreDialogOpen}
        isReportDialogOpen={isReportDialogOpen}
        contentType="idea"
        contentId={latestIdea.id}
        onIgnoreCancel={handleIgnoreCancel}
        onIgnoreConfirm={handleIgnoreConfirm}
        onReportCancel={handleReportCancel}
        onReportConfirm={handleReportConfirm}
      />
    </div>
  );
}