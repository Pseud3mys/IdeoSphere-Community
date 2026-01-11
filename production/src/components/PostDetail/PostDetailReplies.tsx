import { useState } from 'react';
import { Post, User } from '../../types';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Textarea } from '../ui/textarea';
import { UserLink } from '../UserLink';
import { 
  MessageSquare, 
  Send,
  ArrowUp,
  Reply,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { getValidAvatar } from '../../api/avatarService';
import { formatTimeAgo } from './formatTimeAgo';

interface PostDetailRepliesProps {
  post: Post;
  currentUser: User | null;
  getUserById: (userId: string) => User | undefined;
  onAddReply: (postId: string, content: string) => Promise<string | null>;
  onLikeReply: (postId: string, replyId: string) => void;
}

export function PostDetailReplies({ 
  post, 
  currentUser,
  getUserById,
  onAddReply,
  onLikeReply
}: PostDetailRepliesProps) {
  const [newReply, setNewReply] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  const handleReply = async () => {
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

  return (
    <div className="mt-8">
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Header commentaires avec clarification */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Réactions rapides ({post.replies.length})
              </h3>
              <p className="text-xs text-gray-500">
                💬 Commentaires simples • Pour développer une idée, créez un post de réponse ou un projet ci-dessus
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire nouveau commentaire - simplifié */}
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
                        Réagir
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
              Vous devez être connecté pour commenter
            </p>
          </div>
        )}

        {/* Liste des commentaires */}
        <div className="divide-y divide-gray-100">
          {post.replies.map(reply => {
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
                        onClick={() => onLikeReply(post.id, reply.id)}
                      >
                        <ArrowUp className="w-3 h-3" />
                      </Button>
                      <span className="text-xs font-medium text-gray-600">
                        {reply.upvotes?.length || 0}
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

          {post.replies.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Aucune réaction rapide pour le moment</p>
              <p className="text-xs text-gray-400 mt-1">Les commentaires sont pour les réactions courtes • Pour développer, créez un post de réponse ↑</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
