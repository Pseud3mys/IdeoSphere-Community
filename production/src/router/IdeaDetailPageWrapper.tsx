import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { IdeaDetailPage } from '../components/IdeaDetailPage';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Idea } from '../types';

/**
 * IdeaDetailPageWrapper
 * Wrapper pour IdeaDetailPage qui utilise useParams() pour récupérer l'ID depuis l'URL
 * et charge les données de l'idée depuis le store/API
 */
export function IdeaDetailPageWrapper() {
  const { ideaId } = useParams<{ ideaId: string }>();
  const navigate = useNavigate();
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
        // 1. Vérifier si l'idée est déjà dans le store
        let ideaData = getIdeaById(ideaId);

        // 2. Si pas dans le store, charger depuis l'API
        if (!ideaData) {
          const { fetchIdeaDetails } = await import('../api/contentService');
          const { fetchDiscussions } = await import('../api/detailsService');
          const { getIdeaRatingsOnApi } = await import('../api/interactionService');

          const apiIdeaDetails = await fetchIdeaDetails(ideaId);

          if (!apiIdeaDetails) {
            console.error(`❌ Idée ${ideaId} non trouvée`);
            navigate('/discovery');
            return;
          }

          // Ajouter au store
          actions.addIdea(apiIdeaDetails);

          // Charger les ratings
          const ratings = await getIdeaRatingsOnApi(ideaId);
          if (ratings) {
            actions.updateIdea(ideaId, { ratings });
          }

          // Charger les discussions
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

          // Récupérer l'idée mise à jour depuis le store
          ideaData = getIdeaById(ideaId);
        }

        setIdea(ideaData || null);
      } catch (error) {
        console.error(`❌ Erreur lors du chargement de l'idée ${ideaId}:`, error);
        navigate('/discovery');
      } finally {
        setIsLoading(false);
      }
    };

    loadIdea();
  }, [ideaId, navigate, getIdeaById, actions]);

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

  return <IdeaDetailPage idea={idea} onBack={handleBack} />;
}
