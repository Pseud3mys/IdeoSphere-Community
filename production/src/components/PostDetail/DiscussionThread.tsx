import { useState } from 'react';
import { Post, PostReply, User } from '../../types';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { UserLink } from '../UserLink';
import { 
  MessageSquare, 
  Send,
  ArrowUp,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { getValidAvatar } from '../../api/avatarService';
import { formatTimeAgo } from './formatTimeAgo';

interface DiscussionThreadProps {
  post: Post;
  derivedPosts: Post[];
  currentUser: User | null;
  getUserById: (userId: string) => User | undefined;
  onAddReply: (postId: string, content: string) => Promise<string | null>;
  onLikeReply: (postId: string, replyId: string) => void;
  onPromoteReplyToPost: (postId: string, replyId: string, newReplyContent: string) => Promise<string | null>;
  onPostClick: (postId: string) => void;
}

export function DiscussionThread({ 
  post, 
  derivedPosts,
  currentUser,
  getUserById,
  onAddReply,
  onLikeReply,
  onPromoteReplyToPost,
  onPostClick
}: DiscussionThreadProps) {
  const [newReply, setNewReply] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  // Créer une liste unifiée de tous les éléments de discussion (replies + posts dérivés)
  type DiscussionItem = 
    | { type: 'reply'; data: PostReply }
    | { type: 'post'; data: Post };
  
  const discussionItems: DiscussionItem[] = [
    ...post.replies.map(reply => ({ type: 'reply' as const, data: reply })),
    ...derivedPosts.map(post => ({ type: 'post' as const, data: post }))
  ].sort((a, b) => {
    const dateA = a.data.createdAt;
    const dateB = b.data.createdAt;
    
    // Vérification de sécurité : si une date est invalide, mettre l'item à la fin
    if (!dateA || !(dateA instanceof Date)) return 1;
    if (!dateB || !(dateB instanceof Date)) return -1;
    
    return dateA.getTime() - dateB.getTime();
  });

  // Ajouter une reply principale au post
  const handleAddReply = async () => {
    if (!newReply.trim()) {
      toast.error('Veuillez écrire une réponse');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const replyId = await onAddReply(post.id, newReply);
      if (replyId) {
        toast.success('Réponse ajoutée ! 💬');
        setNewReply('');
      } else {
        toast.error('Erreur lors de l\'ajout de la réponse');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la réponse:', error);
      toast.error('Impossible d\'envoyer la réponse. Vérifiez votre connexion.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Répondre à une reply (ce qui la promeut en post)
  const handleReplyToReply = async (replyId: string) => {
    const content = replyContent[replyId]?.trim();
    if (!content) {
      toast.error('Veuillez écrire une réponse');
      return;
    }

    try {
      const newPostId = await onPromoteReplyToPost(post.id, replyId, content);
      if (newPostId) {
        toast.success('Discussion créée ! 🎉');
        setReplyingTo(null);
        setReplyContent(prev => {
          const newState = { ...prev };
          delete newState[replyId];
          return newState;
        });
        // Naviguer vers le nouveau post
        onPostClick(newPostId);
      } else {
        toast.error('Erreur lors de la création de la discussion');
      }
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
      toast.error('Impossible de créer la discussion. Vérifiez votre connexion.');
    }
  };

  return (
    <div className="mt-8">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Discussion ({post.replies.length})
              </h3>
              <p className="text-xs text-gray-500">
                💬 Partagez vos réactions • Cliquez sur "Répondre" pour approfondir une idée
              </p>
            </div>
          </div>
        </div>

        {/* Zone de texte principale pour ajouter une reply */}
        {currentUser ? (
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
                  placeholder="Partagez votre réaction..."
                  rows={2}
                  className="resize-none border-gray-200 focus:border-gray-300 focus:ring-gray-200 text-sm"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddReply}
                    disabled={!newReply.trim() || isSubmittingReply}
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                  >
                    {isSubmittingReply ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                        Envoi...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 mr-2" />
                        Publier
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-gray-100 bg-gray-50/30">
            <p className="text-sm text-muted-foreground text-center">
              Vous devez être connecté pour participer à la discussion
            </p>
          </div>
        )}

        {/* Liste unifiée: replies ET posts dérivés */}
        <div className="divide-y divide-gray-100">
          {discussionItems.map(item => {
            // Rendu d'une reply
            if (item.type === 'reply') {
              const reply = item.data;
              const replyAuthor = getUserById(reply.authorId);
              if (!replyAuthor) return null;
              
              const isPromoted = !!reply.promotedToPostId;
              const isReplying = replyingTo === reply.id;
              
              return (
                <div key={`reply-${reply.id}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex space-x-3">
                    {/* Colonne gauche: Avatar + votes */}
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
                          onClick={() => onLikeReply(post.id, reply.id)}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <span className="text-xs font-medium text-gray-600">
                          {reply.likes?.length || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <UserLink user={replyAuthor} className="font-medium text-gray-900 text-sm" />
                        <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                        
                        {/* Badge pour les posts */}
                        {isPromoted && (
                          <Badge 
                            variant="outline" 
                            className="text-xs border-blue-200 bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100"
                            onClick={() => onPostClick(reply.promotedToPostId!)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Voir détail
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-800 leading-relaxed text-sm mb-2">{reply.content}</p>
                      
                      {/* Actions */}
                      {currentUser && !isPromoted && (
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                            onClick={() => setReplyingTo(isReplying ? null : reply.id)}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {isReplying ? 'Annuler' : 'Répondre'}
                          </Button>
                        </div>
                      )}
                      
                      {/* Zone de réponse inline */}
                      {isReplying && (
                        <div className="mt-3 ml-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Textarea
                            value={replyContent[reply.id] || ''}
                            onChange={(e) => setReplyContent(prev => ({ ...prev, [reply.id]: e.target.value }))}
                            placeholder="Votre réponse va créer une discussion dédiée..."
                            rows={2}
                            className="resize-none text-sm mb-2"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingTo(null)}
                            >
                              Annuler
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReplyToReply(reply.id)}
                              disabled={!replyContent[reply.id]?.trim()}
                            >
                              <Send className="w-3 h-3 mr-2" />
                              Créer la discussion
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            
            // Rendu d'un post dérivé (affiché comme une reply avec ses sous-replies)
            if (item.type === 'post') {
              const derivedPost = item.data;
              const postAuthor = getUserById(derivedPost.authorId);
              if (!postAuthor) return null;
              
              return (
                <div key={`post-${derivedPost.id}`}>
                  {/* Post principal (affiché comme une reply) */}
                  <div className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex space-x-3">
                      {/* Colonne gauche: Avatar + votes */}
                      <div className="flex flex-col items-center space-y-1">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={getValidAvatar(postAuthor.name, postAuthor.avatar)} alt={postAuthor.name} />
                          <AvatarFallback className="bg-blue-300 text-blue-700 text-xs">
                            {postAuthor.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-center space-y-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-orange-100 text-gray-400 hover:text-orange-600"
                            onClick={() => {/* Could toggle like on post */}}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <span className="text-xs font-medium text-gray-600">
                            {derivedPost.supporters?.length || 0}
                          </span>
                        </div>
                      </div>
                      
                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <UserLink user={postAuthor} className="font-medium text-gray-900 text-sm" />
                          <span className="text-xs text-gray-500">{formatTimeAgo(derivedPost.createdAt)}</span>
                        </div>
                        
                        <p className="text-gray-800 leading-relaxed text-sm mb-2">{derivedPost.content}</p>
                        
                        {/* Actions avec "Répondre" et "Voir plus" */}
                        <div className="flex items-center space-x-4 text-xs">
                          <span className="text-gray-500">
                            {derivedPost.replies?.length || 0} réponse{(derivedPost.replies?.length || 0) !== 1 ? 's' : ''}
                          </span>
                          <Button
                            variant="link"
                            size="sm"
                            className="h-auto p-0 text-blue-600 hover:text-blue-800"
                            onClick={() => onPostClick(derivedPost.id)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Voir plus
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Replies du post dérivé (format compact sans avatar) */}
                  {derivedPost.replies && derivedPost.replies.length > 0 && (
                    <div className="ml-14 border-l-2 border-gray-200 pl-4">
                      {derivedPost.replies.map(subReply => {
                        const subReplyAuthor = getUserById(subReply.authorId);
                        if (!subReplyAuthor) return null;
                        
                        return (
                          <div key={`subreply-${subReply.id}`} className="py-2 hover:bg-gray-50/30 transition-colors">
                            {/* En-tête compact */}
                            <div className="flex items-center space-x-2 mb-1">
                              <UserLink user={subReplyAuthor} className="font-medium text-gray-800 text-xs" />
                              <span className="text-xs text-gray-400">{formatTimeAgo(subReply.createdAt)}</span>
                              <button
                                className="ml-auto flex items-center space-x-1 text-gray-400 hover:text-orange-600 transition-colors"
                                onClick={() => {/* Like sub-reply via derived post */}}
                              >
                                <ArrowUp className="w-3 h-3" />
                                <span className="text-xs">{subReply.likes?.length || 0}</span>
                              </button>
                            </div>
                            
                            {/* Contenu compact */}
                            <p className="text-gray-700 text-sm leading-snug">{subReply.content}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            return null;
          })}

          {discussionItems.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aucune réaction pour le moment</p>
              <p className="text-xs text-gray-400 mt-1">Soyez le premier à partager votre avis</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
