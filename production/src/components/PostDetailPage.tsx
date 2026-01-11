import { useState, useEffect, useRef } from 'react';
import { Post } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { ArrowLeft, Send, RefreshCw, Quote, ExternalLink } from 'lucide-react';
import { PostDetailContent } from './PostDetail/PostDetailContent';
import { DiscussionThread } from './PostDetail/DiscussionThread';
import { DerivedProjectsSection } from './PostDetail/DerivedProjectsSection';
import { ContentActionDialogs } from './ContentActionDialogs';
import { getDiscussionTreeOnApi } from '../api/replyPromotionService';
import { toast } from 'sonner';
import { getValidAvatar } from '../api/avatarService';
import { formatTimeAgo } from './PostDetail/formatTimeAgo';

interface PostDetailPageProps {
  post: Post;
  onBack: () => void;
  onIdeaClick: (ideaId: string) => void;
  onPostClick: (postId: string) => void;
  onReport?: (postId: string) => void;
}

export function PostDetailPage({ 
  post, 
  onBack, 
  onIdeaClick,
  onPostClick,
  onReport
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

  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const isSupporting = latestPost.supporters?.includes(effectiveUser.id) || false;
  const supportCount = latestPost.supporters?.length || 0;

  // Handlers pour le signalement
  const handleReportClick = () => {
    setIsReportDialogOpen(true);
  };

  const handleReportConfirm = () => {
    setIsReportDialogOpen(false);
    // Appeler le callback parent si fourni
    if (onReport) {
      onReport(latestPost.id);
    }
  };

  const handleReportCancel = () => {
    setIsReportDialogOpen(false);
  };

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

  // Trouver les posts dérivés de ce post (posts de réponse)
  const derivedPosts = (latestPost.derivedPosts
    ?.map(postId => posts.find(p => p.id === postId))
    .filter((p): p is Post => p !== undefined)) || [];

  const handlePostUpdated = (updatedPost: Post) => {
    // Utiliser addPost pour une fusion intelligente des données
    actions.addPost(updatedPost);
  };

  // Calculer si le post a des commentaires (replies + posts dérivés)
  const hasComments = (latestPost.replies?.length || 0) > 0 || derivedPosts.length > 0;

  // Debug: Afficher les infos du post
  console.log('📝 PostDetailPage - latestPost.replies:', latestPost.replies, 'length:', latestPost.replies?.length || 0);
  console.log('📝 PostDetailPage - derivedPosts.length:', derivedPosts.length);
  console.log('📝 PostDetailPage - hasComments:', hasComments);

  // Ajouter une reply principale au post
  const handleAddReply = async () => {
    if (!newReply.trim()) {
      toast.error('Veuillez écrire une réponse');
      return;
    }

    setIsSubmittingReply(true);
    try {
      const replyId = await actions.addPostReply(latestPost.id, newReply);
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

      {/* Section "en réponse à" - en dehors du rectangle blanc */}
      {sourcePosts.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Quote className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700">
              {sourcePosts.length > 1 ? 'En réponse à plusieurs messages' : 'En réponse à'}
            </h3>
          </div>
          <div className="space-y-3">
            {sourcePosts.map((sourcePost) => {
              const sourceAuthor = sourcePost?.authorId ? getUserById(sourcePost.authorId) : undefined;
              const displayAuthor = sourceAuthor || { id: 'unknown', name: 'Utilisateur inconnu', email: '', avatar: undefined };
              
              return (
                <div 
                  key={sourcePost?.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                  onClick={() => sourcePost && onPostClick(sourcePost.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10 flex-shrink-0">
                      <AvatarImage src={getValidAvatar(displayAuthor.name, displayAuthor.avatar || undefined)} alt={displayAuthor.name} />
                      <AvatarFallback className="bg-gray-200 text-gray-600 text-sm">
                        {displayAuthor.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-600">{displayAuthor.name}</span>
                        <span className="text-xs text-gray-500">• {sourcePost && formatTimeAgo(sourcePost.createdAt)}</span>
                      </div>
                      {sourcePost?.title && (
                        <p className="text-base font-medium text-gray-900 mb-2">{sourcePost.title}</p>
                      )}
                      <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">{sourcePost?.content}</p>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contenu principal du post avec discussion intégrée */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <PostDetailContent
          post={latestPost}
          currentUser={currentUser}
          postAuthor={postAuthor}
          derivedIdeasCount={derivedIdeas.length} // Juste le nombre pour le bandeau
          isSupporting={isSupporting}
          supportCount={supportCount}
          onToggleLike={() => actions.togglePostLike(latestPost.id)}
          onPromoteToIdea={() => actions.promotePostToIdea(latestPost.id)}
          onReportClick={handleReportClick}
          onPostUpdated={handlePostUpdated}
        />

        {/* Section discussion unifiée - dans le même rectangle */}
        <DiscussionThread
          post={latestPost}
          derivedPosts={derivedPosts}
          currentUser={currentUser}
          getUserById={getUserById}
          onLikeReply={actions.likePostReply}
          onPromoteReplyToPost={actions.promoteReplyToPost}
          onAddReplyToPost={actions.addPostReply}
          onPostClick={onPostClick}
          onTogglePostLike={actions.togglePostLike}
        />

        {/* Zone de texte pour ajouter une reply - en dessous des commentaires */}
        {currentUser ? (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30">
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
                  placeholder="Partagez votre commentaire..."
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
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/30">
            <p className="text-sm text-muted-foreground text-center">
              Vous devez être connecté pour participer à la discussion
            </p>
          </div>
        )}
      </div>

      {/* Projets dérivés - Section séparée affichée à la fin */}
      <DerivedProjectsSection
        derivedIdeas={derivedIdeas}
        hasComments={hasComments}
        getUserById={getUserById}
        onIdeaClick={onIdeaClick}
        onPromoteToIdea={() => actions.promotePostToIdea(latestPost.id)}
      />
      
      {/* Dialogues de confirmation */}
      <ContentActionDialogs
        isIgnoreDialogOpen={false}
        isReportDialogOpen={isReportDialogOpen}
        contentType="post"
        contentId={latestPost.id}
        onIgnoreCancel={() => {}}
        onIgnoreConfirm={() => {}}
        onReportCancel={handleReportCancel}
        onReportConfirm={handleReportConfirm}
      />
    </div>
  );
}
