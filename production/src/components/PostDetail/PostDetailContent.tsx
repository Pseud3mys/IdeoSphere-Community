import { useState } from 'react';
import { Post, User, Idea } from '../../types';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { UserLink } from '../UserLink';
import { 
  Heart, 
  MessageSquare, 
  Lightbulb,
  ExternalLink,
  Quote,
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
  sourcePosts: (Post | undefined)[];
  derivedIdeas: (Idea | undefined)[];
  isSupporting: boolean;
  supportCount: number;
  getUserById: (userId: string) => User | undefined;
  onToggleLike: () => void;
  onPromoteToIdea: () => void;
  onIdeaClick: (ideaId: string) => void;
  onPostClick: (postId: string) => void;
  onReportClick: () => void;
  onPostUpdated: (post: Post) => void;
}

export function PostDetailContent({
  post,
  currentUser,
  postAuthor,
  sourcePosts,
  derivedIdeas,
  isSupporting,
  supportCount,
  getUserById,
  onToggleLike,
  onPromoteToIdea,
  onIdeaClick,
  onPostClick,
  onReportClick,
  onPostUpdated
}: PostDetailContentProps) {
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      {/* Posts sources - L'inspiration */}
      {sourcePosts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Quote className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700">
              {sourcePosts.length > 1 ? 'En réponse à plusieurs messages' : 'En réponse à'}
            </h3>
          </div>
          <div className="space-y-2">
            {sourcePosts.map((sourcePost, index) => {
              const sourceAuthor = sourcePost?.authorId ? getUserById(sourcePost.authorId) : undefined;
              // Afficher quand même si l'auteur n'est pas trouvé, mais avec un nom par défaut
              const displayAuthor = sourceAuthor || { id: 'unknown', name: 'Utilisateur inconnu', email: '', avatar: undefined };
              
              return (
                <div 
                  key={sourcePost?.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  onClick={() => sourcePost && onPostClick(sourcePost.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={getValidAvatar(displayAuthor.name, displayAuthor.avatar || undefined)} alt={displayAuthor.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                        {displayAuthor.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{displayAuthor.name}</span>
                        <span className="text-xs text-gray-500">• {sourcePost && formatTimeAgo(sourcePost.createdAt)}</span>
                      </div>
                      {sourcePost?.title && (
                        <p className="text-sm font-medium text-gray-900 mb-1">{sourcePost.title}</p>
                      )}
                      <p className="text-sm text-gray-700 line-clamp-2">{sourcePost?.content}</p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Post principal - Style Reddit/Twitter */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
                    <p className="text-sm text-gray-500">{postAuthor.location?.label || 'Localisation non renseigné'}</p>
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

        {/* Statistiques */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <span>{supportCount} soutiens</span>
            <span>{post.replies.length} discussions</span>
            {derivedIdeas.length > 0 && (
              <span>{derivedIdeas.length} {derivedIdeas.length > 1 ? 'projets' : 'projet'}</span>
            )}
          </div>
        </div>

        {/* Actions principales - CONTRIBUER AU FIL */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Structurer en projet</h4>
            <p className="text-xs text-gray-600">Transformez cette discussion en idée aboutie</p>
          </div>
          
          {/* Action principale: Structurer en projet */}
          <div className="mb-3">
            {/* Projet complet */}
            <button
              className="w-full p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition-colors text-left group"
              onClick={onPromoteToIdea}
            >
              <div className="flex items-center gap-3">
                <Lightbulb className="w-4 h-4 text-gray-500 group-hover:text-purple-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-0.5">Structurer en projet complet</p>
                  <p className="text-xs text-gray-600">
                    Transformer en idée aboutie avec description détaillée et évaluations
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Actions secondaires */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
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
                  <span className="text-xs text-gray-500">({supportCount})</span>
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
            
            <button
              onClick={() => setShowCreateOptions(!showCreateOptions)}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              {showCreateOptions ? 'Masquer' : 'En savoir plus'}
            </button>
          </div>

          {/* Explications détaillées (optionnel) */}
          {showCreateOptions && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200 text-xs text-gray-600 space-y-1">
              <p>
                <strong>Projet :</strong> Transforme cette discussion en idée structurée avec évaluation détaillée sur plusieurs critères.
              </p>
              <p className="pt-1 border-t border-gray-200 text-gray-500">
                💬 Pour participer à la discussion, utilisez la section "Discussion" ci-dessous. Cliquez sur "Répondre" pour approfondir une idée.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenu dérivé - Projets mis en avant */}
      {derivedIdeas.length > 0 && (
        <div className="mt-6">
          {/* Projets dérivés - Section importante */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-gray-500" />
              <h3 className="text-base font-medium text-gray-900">
                Projets issus de cette discussion ({derivedIdeas.length})
              </h3>
            </div>
            
            <div className="space-y-3">
              {derivedIdeas.map(idea => {
                const firstCreator = idea?.creatorIds?.[0] ? getUserById(idea.creatorIds[0]) : null;
                
                return (
                  <Card 
                    key={idea?.id}
                    className="border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 cursor-pointer transition-all"
                    onClick={() => idea && onIdeaClick(idea.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Lightbulb className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                              Projet
                            </Badge>
                            <span className="text-xs text-gray-500">
                              par <UserLink user={firstCreator || undefined} className="text-gray-700 hover:text-purple-600 font-medium" />
                            </span>
                            <span className="text-xs text-gray-400">• {idea && formatTimeAgo(idea.createdAt)}</span>
                          </div>
                          <h4 className="font-medium text-gray-900 mb-1">{idea?.title}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{idea?.summary}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                            <span>{idea?.supporters?.length || 0} soutiens</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
