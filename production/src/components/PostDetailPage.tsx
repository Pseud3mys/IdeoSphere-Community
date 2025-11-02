import { useState, useEffect, useRef } from 'react';
import { Post, User, Idea } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { UserLink } from './UserLink';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  TrendingUp,
  Send,
  Lightbulb,
  ExternalLink,
  Quote,
  Plus,
  ArrowUp,
  Reply,
  Share
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ShareDialog } from './ShareDialog';
import { getValidAvatar } from '../api/avatarService';

interface PostDetailPageProps {
  post: Post;
  onBack: () => void;
  onPromoteToIdea: (postId: string) => void;
  onCreateResponsePost: (postId: string) => void;
  onIdeaClick: (ideaId: string) => void;
  onPostClick: (postId: string) => void;
}

function formatTimeAgo(date: Date | undefined): string {
  if (!date) return 'Date inconnue';
  
  // S'assurer que date est bien un objet Date
  const dateObj = date instanceof Date ? date : new Date(date);
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
  
  return dateObj.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short'
  });
}

export function PostDetailPage({ 
  post, 
  onBack, 
  onPromoteToIdea,
  onCreateResponsePost,
  onIdeaClick,
  onPostClick
}: PostDetailPageProps) {
  // Récupération des données depuis l'Entity Store
  const {
    getCurrentUser,
    getUserById,
    getAllIdeas,
    getAllPosts,
    getPostById,
    actions
  } = useEntityStoreSimple();

  const currentUser = getCurrentUser();
  const ideas = getAllIdeas();
  const posts = getAllPosts();
  
  // Récupérer le post le plus récent depuis le store
  const latestPost = getPostById(post.id) || post;
  
  // ✅ Résoudre l'auteur du post
  const postAuthor = getUserById(latestPost.authorId);

  // ✅ Utiliser unknownUser comme fallback pour les invités
  const effectiveUser = currentUser || { id: 'unknown', name: 'Invité', email: '' } as any;

  const [newReply, setNewReply] = useState('');
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const isSupporting = latestPost.supporters?.includes(effectiveUser.id) || false;
  const supportCount = latestPost.supporters?.length || 0;

  // Tracker les chargements déjà effectués pour éviter les boucles infinies
  const loadedLineageRef = useRef(new Set<string>());

  // Chargement progressif des données supplémentaires
  useEffect(() => {
    const loadAdditionalData = async () => {
      // Ne charger le lineage qu'une seule fois par post
      if (loadedLineageRef.current.has(post.id)) {
        return;
      }
      
      // Charger le lineage (parents/enfants)
      try {
        await actions.loadLineage(post.id, 'post');
        loadedLineageRef.current.add(post.id);
      } catch (error) {
        console.error('❌ Erreur lors du chargement du lineage:', error);
      }
      
      // Note: Les réponses (postReply) sont déjà incluses dans le post, pas besoin de loadDiscussions
    };

    // Déclencher le chargement après un court délai pour éviter de bloquer le rendu initial
    const timeoutId = setTimeout(loadAdditionalData, 100);
    
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.id]); // Seulement post.id (prop initiale), pas latestPost
  
  // Trouver les posts sources de ce post
  const sourcePosts = latestPost.sourcePosts
    ?.map(sourceId => posts.find(p => p.id === sourceId))
    .filter(Boolean) || [];
  
  // Debug: Afficher les infos sur les posts sources
  console.log(`📍 [PostDetailPage] Post ${latestPost.id}:`, {
    sourcePostIds: latestPost.sourcePosts,
    sourcePostsFound: sourcePosts.length,
    allPostsCount: posts.length,
    sourcePosts: sourcePosts.map(p => ({ id: p?.id, authorId: p?.authorId }))
  });
  
  // Trouver les idées dérivées de ce post (utiliser derivedIdeas du post)
  const derivedIdeas = latestPost.derivedIdeas
    ?.map(ideaId => ideas.find(i => i.id === ideaId))
    .filter(Boolean) || [];
  
  // Trouver les posts dérivés de ce post (utiliser derivedPosts du post)
  const derivedPosts = latestPost.derivedPosts
    ?.map(postId => posts.find(p => p.id === postId))
    .filter(Boolean) || [];

  const handleReply = () => {
    if (!newReply.trim()) {
      toast.error('Veuillez écrire une réponse');
      return;
    }

    const replyId = actions.addPostReply(latestPost.id, newReply);
    if (replyId) {
      toast.success('Réponse ajoutée ! 💬');
      setNewReply('');
    } else {
      toast.error('Erreur lors de l\'ajout de la réponse');
    }
  };

  const handleLikeReply = (replyId: string) => {
    actions.likePostReply(latestPost.id, replyId);
    // Pas de toast pour les likes, c'est plus fluide
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header avec retour */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Post</h1>
          <p className="text-sm text-gray-500">Discussion de la communauté</p>
        </div>
      </div>

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
              const sourceAuthor = getUserById(sourcePost?.authorId);
              // Afficher quand même si l'auteur n'est pas trouvé, mais avec un nom par défaut
              const displayAuthor = sourceAuthor || { id: 'unknown', name: 'Utilisateur inconnu', email: '' };
              
              return (
                <div 
                  key={sourcePost?.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  onClick={() => sourcePost && onPostClick(sourcePost.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={getValidAvatar(displayAuthor.name, displayAuthor.avatar)} alt={displayAuthor.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                        {displayAuthor.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">{displayAuthor.name}</span>
                        <span className="text-xs text-gray-500">• {sourcePost && formatTimeAgo(sourcePost.createdAt)}</span>
                      </div>
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
          <div className="flex items-start space-x-3">
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
                    <span className="text-sm text-gray-500">{formatTimeAgo(latestPost.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-500">{postAuthor.location || 'Membre de la communauté'}</p>
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
                    <span className="text-sm text-gray-500">{formatTimeAgo(latestPost.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-500">Chargement...</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Contenu */}
        <div className="p-4">
          <p className="text-lg text-gray-900 leading-relaxed whitespace-pre-line mb-4">
            {latestPost.content}
          </p>

          {/* Tags */}
          {latestPost.tags && latestPost.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {latestPost.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-100">
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
            <span>{latestPost.replies.length} réponses</span>
            {(derivedIdeas.length > 0 || derivedPosts.length > 0) && (
              <span>{derivedIdeas.length + derivedPosts.length} réactions</span>
            )}
          </div>
        </div>

        {/* Actions principales - CONTRIBUER AU FIL */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-gray-900 mb-1">Apporter votre pierre à l'édifice</h4>
            <p className="text-xs text-gray-600">Développez la discussion ou structurez un projet</p>
          </div>
          
          {/* Actions principales de contribution */}
          <div className="space-y-2 mb-3">
            {/* Post de réponse */}
            <button
              className="w-full p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/30 transition-colors text-left group"
              onClick={() => actions.createResponsePost(latestPost.id)}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-gray-500 group-hover:text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-0.5">Ajouter un élément à la discussion</p>
                  <p className="text-xs text-gray-600">
                    Développer un argument, partager une suggestion, apporter une nuance...
                  </p>
                </div>
              </div>
            </button>

            {/* Projet complet */}
            <button
              className="w-full p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50/30 transition-colors text-left group"
              onClick={() => actions.promotePostToIdea(latestPost.id)}
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
                onClick={() => actions.togglePostLike(latestPost.id)}
              >
                <Heart className={`w-4 h-4 ${isSupporting ? 'fill-current' : ''}`} />
                <span className="text-sm">{isSupporting ? 'Soutenu' : 'Soutenir'}</span>
                {supportCount > 0 && (
                  <span className="text-xs text-gray-500">({supportCount})</span>
                )}
              </Button>
              
              <ShareDialog contentId={latestPost.id} contentTitle={latestPost.content} contentType="post">
                <Button 
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-gray-600 hover:bg-gray-50"
                >
                  <Share className="w-4 h-4" />
                  <span className="text-sm">Partager</span>
                </Button>
              </ShareDialog>
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
                <strong>Discussion :</strong> Les posts de réponse alimentent le fil de manière fluide et permettent un échange d'arguments.
              </p>
              <p>
                <strong>Projet :</strong> Pour les idées mûres qui nécessitent une évaluation structurée sur plusieurs critères.
              </p>
              <p className="pt-1 border-t border-gray-200 text-gray-500">
                💬 Les commentaires ci-dessous sont pour les réactions courtes et spontanées.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contenu dérivé - Projets mis en avant */}
      {(derivedIdeas.length > 0 || derivedPosts.length > 0) && (
        <div className="mt-6 space-y-4">
          {/* Projets dérivés - Section importante */}
          {derivedIdeas.length > 0 && (
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
                                par <UserLink user={firstCreator} className="text-gray-700 hover:text-purple-600 font-medium" />
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
          )}

          {/* Posts dérivés - Style discussion */}
          {derivedPosts.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-gray-500" />
                <h3 className="text-base font-medium text-gray-900">
                  Suite de la discussion ({derivedPosts.length})
                </h3>
              </div>
              
              <div className="space-y-2">
                {derivedPosts.map(derivedPost => {
                  const derivedAuthor = getUserById(derivedPost?.authorId);
                  if (!derivedAuthor || derivedAuthor.id === 'unknown') return null;
                  
                  return (
                    <div
                      key={derivedPost?.id}
                      className="border-l-2 border-gray-300 bg-gray-50 rounded-r-lg p-3 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-colors"
                      onClick={() => derivedPost && onPostClick(derivedPost.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage src={getValidAvatar(derivedAuthor.name, derivedAuthor.avatar)} alt={derivedAuthor.name} />
                          <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                            {derivedAuthor.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <UserLink user={derivedAuthor} className="font-medium text-gray-900 text-sm" />
                            <span className="text-xs text-gray-500">• {derivedPost && formatTimeAgo(derivedPost.createdAt)}</span>
                          </div>
                          <p className="text-sm text-gray-700 line-clamp-2">{derivedPost?.content}</p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5">
                            <span>{derivedPost?.supporters?.length || 0} soutiens</span>
                            <span>{derivedPost?.replies.length} réponses</span>
                          </div>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Section commentaires - clairement secondaire */}
      <div className="mt-8">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header commentaires avec clarification */}
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Réactions rapides ({latestPost.replies.length})
                </h3>
                <p className="text-xs text-gray-500">
                  💬 Commentaires simples • Pour développer une idée, créez un post de réponse ou un projet ci-dessus
                </p>
              </div>
            </div>
          </div>

          {/* Formulaire nouveau commentaire - simplifié */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/30">
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={getValidAvatar(currentUser.name, currentUser.avatar)} alt={currentUser.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {currentUser.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Une réaction rapide, un mot d'encouragement..."
                  rows={2}
                  className="resize-none border-gray-200 focus:border-gray-300 focus:ring-gray-200 text-sm"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Pour un argument construit, utilisez "Post de réponse" ↑
                  </p>
                  <Button 
                    onClick={handleReply}
                    disabled={!newReply.trim()}
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                  >
                    <Send className="w-3 h-3 mr-2" />
                    Réagir
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des commentaires */}
          <div className="divide-y divide-gray-100">
            {latestPost.replies.map(reply => {
              // ✅ Résoudre l'authorId en objet User
              const replyAuthor = getUserById(reply.authorId);
              if (!replyAuthor) return null; // Skip si l'utilisateur n'existe pas
              
              return (
                <div key={reply.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex space-x-3">
                    <div className="flex flex-col items-center space-y-1">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={getValidAvatar(replyAuthor.name, replyAuthor.avatar)} alt={replyAuthor.name} />
                        <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                          {replyAuthor.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-center space-y-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 hover:bg-orange-100 text-gray-400 hover:text-orange-600"
                          onClick={() => handleLikeReply(reply.id)}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <span className="text-xs font-medium text-gray-600">
                          {reply.likes?.length || 0}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <UserLink user={replyAuthor} className="font-medium text-gray-900 text-sm" />
                        <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      <p className="text-gray-800 leading-relaxed text-sm">{reply.content}</p>
                      
                      <div className="flex items-center space-x-3 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          Répondre
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {latestPost.replies.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune réaction rapide pour le moment</p>
                <p className="text-xs text-gray-400 mt-1">Les commentaires sont pour les réactions courtes • Pour développer, créez un post de réponse ↑</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}