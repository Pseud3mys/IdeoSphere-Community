import { Post, User } from '../types';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Heart, Eye, MapPin, Flag } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { UserLink } from './UserLink';
import { ContentActionDialogs } from './ContentActionDialogs';
import { ChainBadge } from './ChainBadge';
import { ItemChainContext } from '../utils/feedChainUtils';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getValidAvatar } from '../api/avatarService';
import { GroupBadgeList } from './group/GroupBadgeList';

interface PostCardProps {
  post: Post;
  onPostClick: (postId: string) => void;
  onLike: (postId: string) => void;
  currentUser?: User;
  showInteractions?: boolean;
  onIgnore?: (postId: string) => void;
  onReport?: (postId: string) => void;
  chainContext?: ItemChainContext;
  onIdeaClick?: (ideaId: string) => void;
  onSupport?: (ideaId: string) => void;
}

// Simple function to format time distance
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

export function PostCard({ 
  post, 
  onPostClick, 
  onLike, 
  currentUser, 
  showInteractions = true,
  onIgnore,
  onReport,
  chainContext,
  onIdeaClick,
  onSupport
}: PostCardProps) {
  const [isIgnoreDialogOpen, setIsIgnoreDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const { getCurrentUser, getPostById, getUserById } = useEntityStoreSimple();
  
  const user = currentUser || getCurrentUser();
  const latestPost = getPostById(post.id) || post;
  const postAuthor = getUserById(latestPost.authorId);
  
  const isSupporting = user && (latestPost.supporters?.includes(user.id) || false);
  const supportCount = latestPost.supporters?.length || 0;
  const timeAgo = formatTimeAgo(latestPost.createdAt);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(latestPost.id);
  };

  const handlePostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPostClick(latestPost.id);
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
      onIgnore(latestPost.id);
    }
  };

  const handleReportConfirm = () => {
    setIsReportDialogOpen(false);
    if (onReport) {
      onReport(latestPost.id);
    }
  };

  const handleIgnoreCancel = () => {
    setIsIgnoreDialogOpen(false);
  };

  const handleReportCancel = () => {
    setIsReportDialogOpen(false);
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50/50 transition-colors shadow-sm group"
    >
      {/* Titre */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Link to={`/content/${latestPost.id}`}>
            <h3 
              className="line-clamp-1 mb-3 group-hover:text-primary transition-colors cursor-pointer hover:underline"
            >
              {latestPost.title || (latestPost.content.split('\n')[0].slice(0, 60) + (latestPost.content.length > 60 ? '...' : ''))}
            </h3>
          </Link>
          
          {/* Localisation et badges */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 flex-wrap">
            {latestPost.location && (
              <>
                <MapPin className="w-4 h-4" />
                <span>{latestPost.location.label}</span>
                <span>•</span>
              </>
            )}
            <Badge variant="secondary" className="text-xs bg-primary/5 text-primary border-primary/20">
              Post
            </Badge>
            {chainContext && chainContext.isInChain && (
              <>
                <span>•</span>
                <ChainBadge 
                  context={chainContext} 
                  itemType="post"
                />
              </>
            )}
            {latestPost.groupIds && latestPost.groupIds.length > 0 && (
              <>
                <span>•</span>
                <GroupBadgeList groupIds={latestPost.groupIds} maxDisplay={2} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenu du post */}
      <div className="space-y-3 mb-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {latestPost.content}
        </p>
        
        {/* Tags */}
        {latestPost.tags && latestPost.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {latestPost.tags.slice(0, 4).map(tag => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs text-blue-600 border-blue-200 bg-blue-50"
              >
                #{tag}
              </Badge>
            ))}
            {latestPost.tags.length > 4 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{latestPost.tags.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Auteur */}
      {postAuthor && (
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
          <Avatar className="w-5 h-5">
            <AvatarImage src={getValidAvatar(postAuthor.name, postAuthor.avatar)} alt={postAuthor.name} />
            <AvatarFallback className="text-xs">{postAuthor.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <UserLink userId={postAuthor.id} className="hover:underline">
            {postAuthor.name}
          </UserLink>
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
                  title="Ignorer ou Signaler"
                >
                  {/* Mobile: flag only, desktop: text only */}
                  <span className="sm:hidden"><Flag className="w-4 h-4" /></span>
                  <span className="hidden sm:inline">Ignorer/Signaler</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {onIgnore && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleIgnoreClick();
                  }}>
                    Masquer ce post
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
            <Link to={`/content/${latestPost.id}`}>
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
                isSupporting 
                  ? 'bg-[#4f75ff] hover:bg-[#3b5ce6] text-white' 
                  : 'bg-[#4f75ff] hover:bg-[#3b5ce6] text-white'
              }`}
              onClick={handleLikeClick}
            >
              <Heart className={`w-5 h-5 sm:w-4 sm:h-4 ${isSupporting ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Soutenir</span>
              {isSupporting && (
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
        contentType="post"
        contentId={latestPost.id}
        onIgnoreCancel={handleIgnoreCancel}
        onIgnoreConfirm={handleIgnoreConfirm}
        onReportCancel={handleReportCancel}
        onReportConfirm={handleReportConfirm}
      />
    </div>
  );
}
