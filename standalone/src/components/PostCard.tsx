import { Link } from 'react-router-dom';
import { Post, User } from '../types';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Heart, MessageSquare, MoreHorizontal, ExternalLink, Quote, Eye, MapPin, Flag } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { UserLink } from './UserLink';
import { ContentActionDialogs } from './ContentActionDialogs';
import { ChainBadge } from './ChainBadge';
import { ItemChainContext } from '../utils/feedChainUtils';
import { useState } from 'react';
import { getValidAvatar } from '../api/avatarService';

interface PostCardProps {
  post: Post;
  onPostClick: (postId: string) => void;
  onLike: (postId: string) => void;
  currentUser?: User;
  showInteractions?: boolean;
  onIgnore?: (postId: string) => void;
  onReport?: (postId: string) => void;
  chainContext?: ItemChainContext; // Nouveau : contexte de chaîne
  onIdeaClick?: (ideaId: string) => void; // Pour naviguer vers les idées dans la chaîne
  onSupport?: (ideaId: string) => void; // Pour supporter les idées dans la chaîne
}

// Simple function to format time distance
function formatTimeAgo(date: Date | undefined): string {
  if (!date) return 'Date inconnue';
  
  // S'assurer que date est bien un objet Date
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
  // États pour les dialogues de confirmation
  const [isIgnoreDialogOpen, setIsIgnoreDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  // Utiliser l'Entity Store pour les actions optimisées et récupérer les données les plus récentes
  const { actions, getCurrentUser, getPostById, getUserById } = useEntityStoreSimple();
  
  // Utiliser le currentUser du store si pas fourni en props
  const user = currentUser || getCurrentUser();
  
  // Récupérer le post le plus récent depuis le store
  const latestPost = getPostById(post.id) || post;
  
  // ✅ Résoudre l'auteur du post
  const postAuthor = getUserById(latestPost.authorId);
  
  const isSupporting = user && (latestPost.supporters?.includes(user.id) || false);
  const supportCount = latestPost.supporters?.length || 0;
  const timeAgo = formatTimeAgo(latestPost.createdAt);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Utiliser le prop onLike passé par le parent
    onLike(latestPost.id);
  };

  const handlePostClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Utiliser le prop onPostClick passé par le parent
    onPostClick(latestPost.id);
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

  // Détermine la catégorie principale basée sur les tags
  const getPrimaryCategory = () => {
    if (!latestPost.tags || latestPost.tags.length === 0) return 'Post';
    
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

    for (const tag of latestPost.tags) {
      const normalized = tag.toLowerCase();
      for (const [key, category] of Object.entries(categoryMap)) {
        if (normalized.includes(key)) {
          return category;
        }
      }
    }
    
    return latestPost.tags[0] || 'Post';
  };

  return (
    <div 
      className="bg-white border border-gray-200 rounded-xl p-4 hover:bg-gray-50/50 transition-colors shadow-sm group"
    >
      {/* Titre et actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {/* Titre du post (optionnel) ou généré à partir du contenu */}
          <Link to={`/content/${latestPost.id}`}>
            <h3 
              className="line-clamp-1 mb-3 group-hover:text-primary transition-colors cursor-pointer hover:underline"
            >
              {latestPost.title || (latestPost.content.split('\n')[0].slice(0, 60) + (latestPost.content.length > 60 ? '...' : ''))}
            </h3>
          </Link>
          
          {/* Localisation avec badge Post et badge de chaîne */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 flex-wrap">
            {postAuthor?.location && (
              <>
                <MapPin className="w-4 h-4" />
                <span>{postAuthor.location}</span>
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

      {/* Contenu du post */}
      <div className="space-y-3 mb-3">
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {latestPost.content}
        </p>
        
        {/* Tags extraits des hashtags */}
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

      {/* Auteur - après la description */}
      {postAuthor && (
        <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-3">
          <Avatar className="w-5 h-5">
            <AvatarImage src={getValidAvatar(postAuthor.name, postAuthor.avatar)} alt={postAuthor.name} />
            <AvatarFallback className="text-xs">{postAuthor.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <span>{postAuthor.name}</span>
          <span>•</span>
          <span>{timeAgo}</span>
        </div>
      )}

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

      {/* Dialogues de confirmation */}
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