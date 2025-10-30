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
 */
export function PostDetailPageWrapper() {
  const { postId } = useParams<{ postId: string }>();
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
        // 1. Vérifier si le post est déjà dans le store
        let postData = getPostById(postId);

        // 2. Si pas dans le store, charger depuis l'API
        if (!postData) {
          const { fetchPostDetails } = await import('../api/contentService');
          const apiPostDetails = await fetchPostDetails(postId);

          if (!apiPostDetails) {
            console.error(`❌ Post ${postId} non trouvé`);
            navigate('/discovery');
            return;
          }

          // Ajouter au store
          actions.addPost(apiPostDetails);

          // Récupérer le post depuis le store
          postData = getPostById(postId);
        }

        setPost(postData || null);
      } catch (error) {
        console.error(`❌ Erreur lors du chargement du post ${postId}:`, error);
        navigate('/discovery');
      } finally {
        setIsLoading(false);
      }
    };

    loadPost();
  }, [postId, navigate, getPostById, actions]);

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
