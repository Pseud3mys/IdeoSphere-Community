import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IdeaDetailPage } from '../components/IdeaDetailPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { Idea } from '../types';

/**
 * IdeaDetailPageWrapper
 * Wrapper pour IdeaDetailPage qui utilise useParams() pour récupérer l'ID depuis l'URL
 * et charge les données de l'idée depuis le store/API
 * 
 * Note : Supporte plusieurs formats pour la transition :
 * - /content/ideas/123 (format unifié avec splat *)
 * - /idea/ideas/123 (ancien format avec contentId)
 */
export function IdeaDetailPageWrapper() {
  // Récupérer l'ID depuis * (splat), contentId ou ideaId (pour supporter tous les formats)
  const params = useParams<{ ideaId?: string; contentId?: string; '*'?: string }>();
  const ideaId = params['*'] || params.contentId || params.ideaId;
  const navigate = useNavigate();
  const navigation = useNavigationActions();
  const { getIdeaById, actions } = useEntityStoreSimple();
  const [isLoading, setIsLoading] = useState(true);
  const [idea, setIdea] = useState<Idea | null>(null);

  // Charger l'idée au montage du composant
  useEffect(() => {
    const loadIdea = async () => {
      if (!ideaId) {
        navigate('/discovery');
        return;
      }

      setIsLoading(true);

      try {
        const { fetchIdeaDetails } = await import('../api/contentService');
        const { fetchDiscussions } = await import('../api/detailsService');
        const { getIdeaRatingsOnApi } = await import('../api/interactionService');
        
        // 1. Vérifier si l'idée est déjà dans le store
        let ideaData = getIdeaById(ideaId);

        // 2. Si pas dans le store, charger l'idée depuis l'API
        if (!ideaData) {
          const apiIdeaDetails = await fetchIdeaDetails(ideaId);

          if (!apiIdeaDetails) {
            console.error(`❌ Idée ${ideaId} non trouvée`);
            navigate('/discovery');
            return;
          }

          // Ajouter au store
          actions.addIdea(apiIdeaDetails);
          ideaData = getIdeaById(ideaId);
        }

        // 3. Charger les ratings (toujours, pour avoir les plus récents)
        const ratings = await getIdeaRatingsOnApi(ideaId);
        if (ratings) {
          actions.updateIdea(ideaId, { ratings });
        }

        // 4. Charger les discussions (toujours, pour avoir les plus récentes)
        const { discussions, users } = await fetchDiscussions(ideaId, 'idea');

        if (users && users.length > 0) {
          users.forEach(user => actions.addUser(user));
        }

        if (discussions && discussions.length > 0) {
          discussions.forEach(discussion => actions.addDiscussionTopic(discussion));

          const currentIdea = getIdeaById(ideaId);
          if (currentIdea) {
            const discussionIds = discussions.map(d => d.id);
            const newDiscussionIds = [
              ...(currentIdea.discussionIds || []),
              ...discussionIds.filter(id => !currentIdea.discussionIds?.includes(id))
            ];
            actions.updateIdea(ideaId, { discussionIds: newDiscussionIds });
          }
        }

        // 5. Charger les idées et posts référencés (versions, sources)
        const currentIdea = getIdeaById(ideaId);
        if (currentIdea) {
          // Charger les sourceIdeas
          if (currentIdea.sourceIdeas && currentIdea.sourceIdeas.length > 0) {
            for (const sourceIdeaId of currentIdea.sourceIdeas) {
              const sourceIdea = await fetchIdeaDetails(sourceIdeaId);
              if (sourceIdea) {
                actions.addIdea(sourceIdea);
              }
            }
          }

          // Charger les sourcePosts
          if (currentIdea.sourcePosts && currentIdea.sourcePosts.length > 0) {
            const { fetchPostDetails } = await import('../api/contentService');
            for (const sourcePostId of currentIdea.sourcePosts) {
              const sourcePost = await fetchPostDetails(sourcePostId);
              if (sourcePost) {
                actions.addPost(sourcePost);
              }
            }
          }
        }

        // 6. Récupérer l'idée finale mise à jour depuis le store
        ideaData = getIdeaById(ideaId);
        setIdea(ideaData || null);
      } catch (error) {
        console.error(`❌ Erreur lors du chargement de l'idée ${ideaId}:`, error);
        navigate('/discovery');
      } finally {
        setIsLoading(false);
      }
    };

    loadIdea();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ideaId]); // Uniquement ideaId pour éviter les boucles infinies

  // Handler pour retourner en arrière
  const handleBack = () => {
    navigate(-1); // Retour à la page précédente
  };

  // Affichage pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de l'idée...</p>
        </div>
      </div>
    );
  }

  // Si l'idée n'existe pas, rediriger (déjà fait dans useEffect, mais garde pour sécurité)
  if (!idea) {
    return null;
  }

  return <IdeaDetailPage idea={idea} onBack={handleBack} onPostClick={navigation.goToPost} />;
}
