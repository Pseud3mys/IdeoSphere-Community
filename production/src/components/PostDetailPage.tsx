import { useState, useEffect, useRef } from 'react';
import { Post } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Button } from './ui/button';
import { ArrowLeft } from 'lucide-react';
import { PostDetailContent } from './PostDetail/PostDetailContent';
import { PostDetailReplies } from './PostDetail/PostDetailReplies';
import { ContentActionDialogs } from './ContentActionDialogs';

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
  
  // Trouver les posts dérivés de ce post (utiliser derivedPosts du post)
  const derivedPosts = latestPost.derivedPosts
    ?.map(postId => posts.find(p => p.id === postId))
    .filter(Boolean) || [];

  const handlePostUpdated = (updatedPost: Post) => {
    // Utiliser addPost pour une fusion intelligente des données
    actions.addPost(updatedPost);
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

      {/* Contenu principal du post */}
      <PostDetailContent
        post={latestPost}
        currentUser={currentUser}
        postAuthor={postAuthor}
        sourcePosts={sourcePosts}
        derivedIdeas={derivedIdeas}
        derivedPosts={derivedPosts}
        isSupporting={isSupporting}
        supportCount={supportCount}
        getUserById={getUserById}
        onToggleLike={() => actions.togglePostLike(latestPost.id)}
        onCreateResponsePost={() => actions.createResponsePost(latestPost.id)}
        onPromoteToIdea={() => actions.promotePostToIdea(latestPost.id)}
        onIdeaClick={onIdeaClick}
        onPostClick={onPostClick}
        onReportClick={handleReportClick}
        onPostUpdated={handlePostUpdated}
      />

      {/* Section commentaires */}
      <PostDetailReplies
        post={latestPost}
        currentUser={currentUser}
        getUserById={getUserById}
        onAddReply={actions.addPostReply}
        onLikeReply={actions.likePostReply}
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
