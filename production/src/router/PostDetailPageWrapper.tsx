import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { PostDetailPage } from '../components/PostDetailPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { Post } from '../types';

/**
 * PostDetailPageWrapper
 * Wrapper pour PostDetailPage qui utilise useParams() pour récupérer l'ID depuis l'URL
 * et charge les données du post depuis le store/API
 * 
 * Note : Supporte plusieurs formats pour la transition :
 * - /content/posts/123 (format unifié avec splat *)
 * - /post/posts/123 (ancien format avec contentId)
 */
export function PostDetailPageWrapper() {
  // Récupérer l'ID depuis * (splat), contentId ou postId (pour supporter tous les formats)
  const params = useParams<{ postId?: string; contentId?: string; '*'?: string }>();
  const postId = params['*'] || params.contentId || params.postId;
  const navigate = useNavigate();
  const { getPostById, actions } = useEntityStoreSimple();
  const navigation = useNavigationActions();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState<Post | null>(null);

  // Charger le post au montage du composant
  useEffect(() => {
    const loadPost = async () => {
      if (!postId) {
        navigate('/discovery');
        return;
      }

      setIsLoading(true);

      try {
        const { fetchPostDetails } = await import('../api/contentService');
        const { fetchUserProfileFromApi } = await import('../api/contentService');
        
        // 1. Vérifier si le post est déjà dans le store
        let postData = getPostById(postId);

        // 2. Si pas dans le store, charger depuis l'API
        if (!postData) {
          const apiPostDetails = await fetchPostDetails(postId);

          if (!apiPostDetails) {
            console.error(`❌ Post ${postId} non trouvé`);
            navigate('/discovery');
            return;
          }

          // Ajouter au store
          actions.addPost(apiPostDetails);
          postData = getPostById(postId);
        }

        // 2b. Charger l'auteur du post - toujours pour assurer qu'il est dans le store
        if (postData && postData.authorId) {
          const author = await fetchUserProfileFromApi(postData.authorId);
          if (author) {
            actions.addUser(author);
          }
        }

        // 3. Charger les posts référencés (sourcePosts) - toujours
        if (postData && postData.sourcePosts && postData.sourcePosts.length > 0) {
          for (const sourcePostId of postData.sourcePosts) {
            const sourcePost = await fetchPostDetails(sourcePostId);
            if (sourcePost) {
              actions.addPost(sourcePost);
              // Charger aussi l'auteur de chaque post source
              if (sourcePost.authorId) {
                const author = await fetchUserProfileFromApi(sourcePost.authorId);
                if (author) {
                  actions.addUser(author);
                }
              }
            }
          }
        }

        // 4. Récupérer le post final depuis le store
        postData = getPostById(postId);
        setPost(postData || null);
      } catch (error) {
        console.error(`❌ Erreur lors du chargement du post ${postId}:`, error);
        navigate('/discovery');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]); // Uniquement postId pour éviter les boucles infinies

  // Handler pour retourner en arrière
  const handleBack = () => {
    navigate(-1);
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement du post...</p>
        </div>
      </div>
    );
  }

  // Si le post n'existe pas
  if (!post) {
    return null;
  }

  return (
    <PostDetailPage
      post={post}
      onBack={handleBack}
      onPromoteToIdea={actions.promotePostToIdea}
      onCreateResponsePost={actions.createResponsePost}
      onIdeaClick={navigation.goToIdea}
      onPostClick={navigation.goToPost}
    />
  );
}
