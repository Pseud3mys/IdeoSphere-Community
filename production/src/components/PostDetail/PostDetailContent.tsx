import { useState } from 'react';
import { Post, User } from '../../types';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { UserLink } from '../UserLink';
import { 
  Heart, 
  MessageSquare, 
  Lightbulb,
  Share,
  Edit,
  Flag,
  Users
} from 'lucide-react';
import { ShareDialog } from '../ShareDialog';
import { getValidAvatar } from '../../api/avatarService';
import { GroupBadgeList } from '../group/GroupBadgeList';
import { RecommendToGroupDialog } from '../group/RecommendToGroupDialog';
import { canEditPost } from '../../utils/contentEditUtils';
import { EditPostDialog } from '../EditPostDialog';
import { formatTimeAgo } from './formatTimeAgo';

interface PostDetailContentProps {
  post: Post;
  currentUser: User | null;
  postAuthor: User | undefined;
  derivedIdeasCount?: number; // Nombre de projets dérivés pour le bandeau
  isSupporting: boolean;
  supportCount: number;
  onToggleLike: () => void;
  onPromoteToIdea: () => void;
  onReportClick: () => void;
  onPostUpdated: (post: Post) => void;
}

export function PostDetailContent({
  post,
  currentUser,
  postAuthor,
  derivedIdeasCount = 0,
  isSupporting,
  supportCount,
  onToggleLike,
  onPromoteToIdea,
  onReportClick,
  onPostUpdated
}: PostDetailContentProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Calculer le nombre de participants uniques dans la discussion
  const uniqueParticipants = new Set<string>();
  uniqueParticipants.add(post.authorId); // L'auteur du post
  post.replies.forEach(reply => uniqueParticipants.add(reply.authorId)); // Les auteurs des replies
  const participantCount = uniqueParticipants.size;

  // Déterminer si on doit afficher le bandeau d'incitation
  const hasProjects = derivedIdeasCount > 0;
  const hasActiveDiscussion = participantCount >= 3;
  const shouldShowBanner = hasProjects || hasActiveDiscussion;

  return (
    <>
      {/* Header utilisateur */}
      <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              {postAuthor ? (
                <>
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={getValidAvatar(postAuthor.name, postAuthor.avatar)} alt={postAuthor.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {postAuthor.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <UserLink user={postAuthor} className="font-semibold text-gray-900" />
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-500">{post.location?.label || 'Localisation non renseigné'}</p>
                  </div>
                </>
              ) : (
                <>
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-gray-300 text-gray-600">
                      ??
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">Utilisateur inconnu</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-500">Chargement...</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Bouton Éditer - visible 5 minutes après création - dans l'en-tête */}
            {canEditPost(post, currentUser) && (
              <EditPostDialog 
                post={post}
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onPostUpdated={onPostUpdated}
              >
                <Button 
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-orange-600 hover:bg-orange-50 border-orange-200 ml-2"
                >
                  <Edit className="w-4 h-4" />
                  <span className="text-sm">Modifier</span>
                </Button>
              </EditPostDialog>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4">
          {/* Titre du post si présent */}
          {post.title && (
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {post.title}
            </h2>
          )}
          <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-line mb-4">
            {post.content}
          </p>

          {/* Tags et Groupes associés */}
          {((post.tags && post.tags.length > 0) || (post.groupIds && post.groupIds.length > 0)) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Groupes associés - Plus visibles */}
              {post.groupIds && post.groupIds.length > 0 && (
                <GroupBadgeList 
                  groupIds={post.groupIds} 
                  maxDisplay={10} 
                  size="sm"
                  showCount={false}
                />
              )}
              
              {/* Tags - Moins visibles */}
              {post.tags && post.tags.length > 0 && post.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Actions principales - Simplifiées */}
        <div className="px-4 py-3 bg-white">
          {/* Actions secondaires */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost"
                size="sm"
                className={`flex items-center gap-2 ${
                  isSupporting ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={onToggleLike}
              >
                <Heart className={`w-4 h-4 ${isSupporting ? 'fill-current' : ''}`} />
                <span className="text-sm">{isSupporting ? 'Soutenu' : 'Soutenir'}</span>
                {supportCount > 0 && (
                  <span className="text-xs font-medium">({supportCount})</span>
                )}
              </Button>
              
              <ShareDialog contentId={post.id} contentTitle={post.content} contentType="post">
                <Button 
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 hover:bg-gray-50"
                >
                  <Share className="w-4 h-4" />
                  <span className="text-sm">Partager</span>
                </Button>
              </ShareDialog>
              
              <RecommendToGroupDialog 
                contentId={post.id} 
                contentTitle={post.title || post.content.substring(0, 50) + '...'} 
                contentType="post"
                currentGroupIds={post.groupIds}
              >
                <Button 
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 hover:bg-gray-50"
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm">Recommander</span>
                </Button>
              </RecommendToGroupDialog>
              
              {/* Bouton Signaler - discret */}
              <Button 
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-gray-400 hover:text-red-600 hover:bg-red-50"
                onClick={onReportClick}
                title="Signaler un contenu inapproprié"
              >
                <Flag className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bandeau d'incitation projet */}
        {shouldShowBanner && (
          <div className={`px-4 py-3 ${hasProjects ? 'bg-purple-50/50 border-t border-purple-100' : 'bg-blue-50/50 border-t border-blue-100'}`}>
            {hasProjects ? (
              // Si des projets existent, inciter à les consulter
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-purple-900">
                      {derivedIdeasCount === 1 ? 'Un projet structuré existe' : `${derivedIdeasCount} projets structurés existent`}
                    </p>
                    <p className="text-xs text-purple-700">
                      Cette discussion a donné naissance à des projets concrets
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-purple-50 border-purple-200 text-purple-700 font-medium"
                  onClick={() => {
                    // Scroll vers la section des projets
                    const projectsSection = document.querySelector('[data-section="derived-projects"]');
                    projectsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Voir {derivedIdeasCount === 1 ? 'le projet' : 'les projets'}
                </Button>
              </div>
            ) : (
              // Si pas de projet mais discussion active, inciter à créer
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">
                      Discussion active ({participantCount} participants)
                    </p>
                    <p className="text-xs text-blue-700">
                      Structurez ces échanges en projet pour mieux organiser les idées
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700 font-medium"
                  onClick={onPromoteToIdea}
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Créer un projet
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Ligne de séparation sous les boutons */}
        <div className="border-t border-gray-100"></div>
      {/* Fin du rectangle blanc principal - les commentaires seront ajoutés après dans PostDetailPage */}
    </>
  );
}
