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

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)}min`;
  if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;
  
  return date.toLocaleDateString('fr-FR', { 
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

  // Si currentUser est null, ne pas afficher le composant
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const [newReply, setNewReply] = useState('');
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const isSupporting = latestPost.supporters?.includes(currentUser.id) || false;
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

      {/* Posts sources si ce post en cite d'autres */}
      {sourcePosts.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
            <Quote className="w-4 h-4" />
            <span>En réponse à {sourcePosts.length > 1 ? `${sourcePosts.length} posts` : 'ce post'}</span>
          </div>
          <div className="space-y-2">
            {sourcePosts.map((sourcePost, index) => {
              const sourceAuthor = getUserById(sourcePost?.authorId);
              // Ne pas afficher si l'utilisateur n'est pas trouvé (unknownUser)
              if (!sourceAuthor || sourceAuthor.id === 'unknown') return null;
              
              return (
                <div 
                  key={sourcePost?.id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => sourcePost && onPostClick(sourcePost.id)}
                >
                  <div className="flex items-start space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={getValidAvatar(sourceAuthor.name, sourceAuthor.avatar)} alt={sourceAuthor.name} />
                      <AvatarFallback className="bg-gray-300 text-gray-600 text-xs">
                        {sourceAuthor.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900">{sourceAuthor.name}</span>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{sourcePost?.content}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
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
        {postAuthor && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-start space-x-3">
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
            </div>
          </div>
        )}

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

        {/* Actions principales */}
        <div className="px-4 py-3 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 h-9 px-4 rounded-full hover:bg-blue-50 ${
                  isSupporting ? 'text-primary bg-blue-50' : 'text-gray-500'
                }`}
                onClick={() => actions.togglePostLike(latestPost.id)}
              >
                <Heart className={`w-4 h-4 ${isSupporting ? 'fill-current' : ''}`} />
                <span className="hidden sm:inline">Soutenir</span>
              </Button>
              
              <ShareDialog contentId={latestPost.id} contentTitle={latestPost.content} contentType="post">
                <Button 
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 h-9 px-4 rounded-full hover:bg-blue-50 text-gray-500"
                >
                  <Share className="w-4 h-4" />
                  <span className="hidden sm:inline">Partager</span>
                </Button>
              </ShareDialog>
            </div>

            <Button 
              className="h-9 px-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              onClick={() => setShowCreateOptions(!showCreateOptions)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer
            </Button>
          </div>

          {/* Options de création */}
          {showCreateOptions && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600 mb-4">Que voulez-vous créer à partir de ce post ?</p>
              
              {/* Post de réponse - avec explication */}
              <div className="space-y-3 mb-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900 mb-1">Post de réponse</h4>
                      <p className="text-sm text-blue-700 mb-2">
                        Créez un nouveau post public qui cite ce message. Il apparaîtra dans le fil de la communauté et sera visible par tous.
                      </p>
                      <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block">
                        💬 Publié comme un nouveau post dans le fil
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    className="w-full h-9 rounded-full border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => actions.createResponsePost(latestPost.id)}
                  >
                    Créer un post de réponse
                  </Button>
                </div>

                {/* Idée complète */}
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start space-x-3 mb-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <Lightbulb className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-purple-900 mb-1">Idée complète</h4>
                      <p className="text-sm text-purple-700 mb-2">
                        Développez une idée structurée avec titre, résumé et description détaillée, inspirée de ce post.
                      </p>
                      <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded inline-block">
                        💡 Création d'une idée avec évaluations
                      </div>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="w-full h-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => actions.promotePostToIdea(latestPost.id)}
                  >
                    Créer une idée complète
                  </Button>
                </div>
              </div>

              {/* Différence avec les commentaires */}
              <div className="pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  <strong>Rappel :</strong> Les commentaires ci-dessous restent attachés à ce post. 
                  Un post de réponse devient un nouveau contenu indépendant.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenu dérivé */}
      {(derivedIdeas.length > 0 || derivedPosts.length > 0) && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Réactions à ce post ({derivedIdeas.length + derivedPosts.length})
          </h3>
          
          <div className="space-y-4">
            {/* Projets dérivés */}
            {derivedIdeas.map(idea => {
              // ✅ Résoudre le créateur depuis le store pour avoir les données complètes
              const firstCreator = idea?.creators?.[0] ? getUserById(idea.creators[0].id) : null;
              
              return (
              <Card 
                key={idea?.id}
                className="border-purple-200 bg-purple-50/30 cursor-pointer hover:bg-purple-50/50 transition-colors"
                onClick={() => idea && onIdeaClick(idea.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 text-xs">
                          💡 Idée créée
                        </Badge>
                        <span className="text-xs text-gray-500">par <UserLink user={firstCreator} className="text-gray-700 hover:text-primary" /></span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{idea?.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{idea?.summary}</p>
                      <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                        <span>{idea?.supporters?.length || 0} soutiens</span>
                        <span>{idea && formatTimeAgo(idea.createdAt)}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
              );
            })}

            {/* Posts dérivés */}
            {derivedPosts.map(derivedPost => {
              const derivedAuthor = getUserById(derivedPost?.authorId);
              // Ne pas afficher si l'utilisateur n'est pas trouvé (unknownUser)
              if (!derivedAuthor || derivedAuthor.id === 'unknown') return null;
              
              return (
                <Card 
                  key={derivedPost?.id}
                  className="border-blue-200 bg-blue-50/30 cursor-pointer hover:bg-blue-50/50 transition-colors"
                  onClick={() => derivedPost && onPostClick(derivedPost.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={getValidAvatar(derivedAuthor.name, derivedAuthor.avatar)} alt={derivedAuthor.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                          {derivedAuthor.name.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            💬 Post de réponse
                          </Badge>
                          <span className="text-xs text-gray-500">par <UserLink user={derivedAuthor} className="text-gray-700 hover:text-primary" /></span>
                          <span className="text-xs text-gray-500">{derivedPost && formatTimeAgo(derivedPost.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-800 line-clamp-3">{derivedPost?.content}</p>
                        <div className="flex items-center space-x-3 text-xs text-gray-500 mt-2">
                          <span>{derivedPost?.supporters?.length || 0} soutiens</span>
                          <span>{derivedPost?.replies.length} réponses</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Section commentaires style Reddit */}
      <div className="mt-8">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Header commentaires */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-900">
              Commentaires ({latestPost.replies.length})
            </h3>
          </div>

          {/* Formulaire nouveau commentaire */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarImage src={getValidAvatar(currentUser.name, currentUser.avatar)} alt={currentUser.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                  {currentUser.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-3">
                <Textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  rows={3}
                  className="resize-none border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleReply}
                    disabled={!newReply.trim()}
                    size="sm"
                    className="rounded-full"
                  >
                    <Send className="w-3 h-3 mr-2" />
                    Commenter
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
                <p>Aucun commentaire pour le moment</p>
                <p className="text-sm">Soyez le premier à réagir !</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}