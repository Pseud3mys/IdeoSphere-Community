import { useState } from 'react';
import { Post, PostReply, User } from '../../types';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { UserLink } from '../UserLink';
import { 
  MessageSquare, 
  Send,
  ArrowUp,
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
  onLikeReply: (postId: string, replyId: string) => void;
  onPromoteReplyToPost: (postId: string, replyId: string, newReplyContent: string) => Promise<string | null>;
  onAddReplyToPost: (postId: string, content: string) => Promise<string | null>;
  onPostClick: (postId: string) => void;
  onTogglePostLike: (postId: string) => void;
}

export function DiscussionThread({ 
  post, 
  derivedPosts,
  currentUser,
  getUserById,
  onLikeReply,
  onPromoteReplyToPost,
  onAddReplyToPost,
  onPostClick,
  onTogglePostLike
}: DiscussionThreadProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [replyingToPost, setReplyingToPost] = useState<string | null>(null);
  const [postReplyContent, setPostReplyContent] = useState<Record<string, string>>({});
  
  // États pour empêcher les clics multiples
  const [likingReply, setLikingReply] = useState<Set<string>>(new Set());
  const [likingPost, setLikingPost] = useState<Set<string>>(new Set());

  // Gérer le like d'une reply avec protection contre les clics multiples
  const handleLikeReply = async (postId: string, replyId: string) => {
    if (!currentUser) return;
    
    const key = `${postId}-${replyId}`;
    if (likingReply.has(key)) return; // Déjà en cours
    
    setLikingReply(prev => new Set(prev).add(key));
    try {
      await onLikeReply(postId, replyId);
    } finally {
      // Retirer après un court délai pour éviter les clics trop rapides
      setTimeout(() => {
        setLikingReply(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 300);
    }
  };

  // Gérer le like d'un post avec protection contre les clics multiples
  const handleLikePost = async (postId: string) => {
    if (!currentUser) return;
    
    if (likingPost.has(postId)) return; // Déjà en cours
    
    setLikingPost(prev => new Set(prev).add(postId));
    try {
      await onTogglePostLike(postId);
    } finally {
      // Retirer après un court délai pour éviter les clics trop rapides
      setTimeout(() => {
        setLikingPost(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }, 300);
    }
  };

  // Créer une liste unifiée de tous les éléments de discussion (replies + posts dérivés)
  type DiscussionItem = 
    | { type: 'reply'; data: PostReply }
    | { type: 'post'; data: Post };
  
  const discussionItems: DiscussionItem[] = [
    // Les replies promues sont supprimées par le backend, pas besoin de filtrer
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
        // Ne pas naviguer - rester sur le post actuel
      } else {
        toast.error('Erreur lors de la création de la discussion');
      }
    } catch (error) {
      console.error('Erreur lors de la réponse:', error);
      toast.error('Impossible de créer la discussion. Vérifiez votre connexion.');
    }
  };

  // Répondre directement à un post dérivé
  const handleReplyToPost = async (postId: string) => {
    const content = postReplyContent[postId]?.trim();
    if (!content) {
      toast.error('Veuillez écrire une réponse');
      return;
    }

    try {
      const replyId = await onAddReplyToPost(postId, content);
      if (replyId) {
        toast.success('Réponse ajoutée ! 💬');
        setReplyingToPost(null);
        setPostReplyContent(prev => {
          const newState = { ...prev };
          delete newState[postId];
          return newState;
        });
      } else {
        toast.error('Erreur lors de l\'ajout de la réponse');
      }
    } catch (error) {
      console.error('Erreur lors de la réponse au post:', error);
      toast.error('Impossible d\'envoyer la réponse. Vérifiez votre connexion.');
    }
  };

  return (
    <div className="divide-y divide-gray-100">
      {discussionItems.map(item => {
            // Rendu d'une reply
            if (item.type === 'reply') {
              const reply = item.data;
              const replyAuthor = getUserById(reply.authorId);
              if (!replyAuthor) return null;
              
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
                          className={`h-6 w-6 p-0 hover:bg-orange-100 transition-colors ${
                            reply.upvotes?.includes(currentUser?.id || '') 
                              ? 'text-orange-600' 
                              : 'text-gray-400 hover:text-orange-600'
                          }`}
                          onClick={() => handleLikeReply(post.id, reply.id)}
                          disabled={!currentUser || likingReply.has(`${post.id}-${reply.id}`)}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <span className="text-xs font-medium text-gray-600">
                          {reply.upvotes?.length || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <UserLink user={replyAuthor} className="text-gray-600 text-sm hover:text-gray-800" />
                        <span className="text-xs text-gray-500">{formatTimeAgo(reply.createdAt)}</span>
                      </div>
                      
                      <p className="text-gray-900 leading-relaxed text-sm mb-2">{reply.content}</p>
                      
                      {/* Actions */}
                      {currentUser && (
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
            
            // Rendu d'un post dérivé (affiché exactement comme une reply)
            if (item.type === 'post') {
              const derivedPost = item.data;
              const postAuthor = getUserById(derivedPost.authorId);
              if (!postAuthor) return null;
              
              return (
                <div key={`post-${derivedPost.id}`} className="p-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex space-x-3">
                    {/* Colonne gauche: Avatar + votes (identique aux replies) */}
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
                          className={`h-6 w-6 p-0 hover:bg-orange-100 transition-colors ${
                            derivedPost.supporters?.includes(currentUser?.id || '') 
                              ? 'text-orange-600' 
                              : 'text-gray-400 hover:text-orange-600'
                          }`}
                          onClick={() => handleLikePost(derivedPost.id)}
                          disabled={!currentUser || likingPost.has(derivedPost.id)}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <span className="text-xs font-medium text-gray-600">
                          {derivedPost.supporters?.length || 0}
                        </span>
                      </div>
                    </div>
                    
                    {/* Contenu principal */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <UserLink user={postAuthor} className="text-gray-600 text-sm hover:text-gray-800" />
                        <span className="text-xs text-gray-500">{formatTimeAgo(derivedPost.createdAt)}</span>
                      </div>
                      
                      <p className="text-gray-900 leading-relaxed text-sm mb-2">{derivedPost.content}</p>
                      
                      {/* Sub-replies affichées ici (entre contenu et boutons) */}
                      {derivedPost.replies && derivedPost.replies.length > 0 && (
                        <div className="ml-4 pl-4 border-l-2 border-gray-200 mt-3 mb-3 space-y-3">
                          {derivedPost.replies.map(subReply => {
                            const subReplyAuthor = getUserById(subReply.authorId);
                            if (!subReplyAuthor) return null;
                            
                            return (
                              <div key={`subreply-${subReply.id}`} className="text-sm">
                                <div className="flex items-center space-x-2 mb-1">
                                  <UserLink user={subReplyAuthor} className="text-gray-500 text-xs hover:text-gray-700" />
                                  <span className="text-xs text-gray-400">{formatTimeAgo(subReply.createdAt)}</span>
                                  <button
                                    className={`ml-auto flex items-center space-x-1 transition-colors ${
                                      subReply.upvotes?.includes(currentUser?.id || '')
                                        ? 'text-orange-600'
                                        : 'text-gray-400 hover:text-orange-600'
                                    }`}
                                    onClick={() => handleLikeReply(derivedPost.id, subReply.id)}
                                    disabled={!currentUser || likingReply.has(`${derivedPost.id}-${subReply.id}`)}
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                    <span className="text-xs">{subReply.upvotes?.length || 0}</span>
                                  </button>
                                </div>
                                <p className="text-gray-900 text-sm leading-relaxed font-normal">{subReply.content}</p>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Actions (identiques aux replies) */}
                      {currentUser && (
                        <div className="flex items-center space-x-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                            onClick={() => setReplyingToPost(replyingToPost === derivedPost.id ? null : derivedPost.id)}
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {replyingToPost === derivedPost.id ? 'Annuler' : 'Répondre'}
                          </Button>
                          <button
                            className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                            onClick={() => onPostClick(derivedPost.id)}
                          >
                            Voir plus
                          </button>
                        </div>
                      )}
                      
                      {/* Zone de réponse inline pour post dérivé */}
                      {replyingToPost === derivedPost.id && (
                        <div className="mt-3 ml-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Textarea
                            value={postReplyContent[derivedPost.id] || ''}
                            onChange={(e) => setPostReplyContent(prev => ({ ...prev, [derivedPost.id]: e.target.value }))}
                            placeholder="Votre réponse..."
                            rows={2}
                            className="resize-none text-sm mb-2"
                          />
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setReplyingToPost(null)}
                            >
                              Annuler
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleReplyToPost(derivedPost.id)}
                              disabled={!postReplyContent[derivedPost.id]?.trim()}
                            >
                              <Send className="w-3 h-3 mr-2" />
                              Répondre
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }
            
            return null;
          })}
      </div>
  );
}
