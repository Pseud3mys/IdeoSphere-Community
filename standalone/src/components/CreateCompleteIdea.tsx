import { useState, useEffect } from 'react';
import { User, Idea, Post } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Button } from './ui/button';
import { SourceIndicatorBanner } from './create-idea/SourceIndicatorBanner';
import { BasicIdeaForm } from './create-idea/BasicIdeaForm';
import { CollaborationForm } from './create-idea/CollaborationForm';
import { PublishConfirmationDialog } from './create-idea/PublishConfirmationDialog';
import { Quote, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CreateCompleteIdeaProps {
  sourcePost?: Post;
  prefilledSourceIdea?: string | null;
  prefilledLinkedContent?: string[];
  prefilledSelectedDiscussions?: string[];
  onClearPrefilled?: () => void;
  onSaveDraft?: (title: string, summary: string, description?: string) => void;
  loadedDraft?: {
    id: string;
    title: string;
    summary: string;
    description?: string;
    type: 'post' | 'idea';
    createdAt: Date | string;
    sourcePostIds?: string[];
  } | null;
  onDraftLoaded?: () => void;
}

export function CreateCompleteIdea({ 
  sourcePost, 
  prefilledSourceIdea,
  prefilledLinkedContent,
  prefilledSelectedDiscussions,
  onClearPrefilled,
  onSaveDraft,
  loadedDraft,
  onDraftLoaded
}: CreateCompleteIdeaProps) {
  // Récupération des données depuis l'Entity Store
  const {
    store,
    getCurrentUser,
    getAllUsers,
    getAllIdeas,
    getAllPosts,
    getDiscussionTopicById,
    actions
  } = useEntityStoreSimple();

  const currentUser = getCurrentUser();
  const users = getAllUsers();
  const ideas = getAllIdeas();
  const posts = getAllPosts();

  // Les utilisateurs sont déjà chargés au démarrage de l'app via loadInitialData

  // Si currentUser est null, ne pas afficher le composant
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  // Obtenir l'idée source si elle existe
  const sourceIdea = prefilledSourceIdea ? ideas.find(i => i.id === prefilledSourceIdea) : null;
  
  // Obtenir le post source depuis les props ou depuis le store
  const derivedSourcePost = sourcePost || 
    (store.prefilledSourcePostId ? posts.find(p => p.id === store.prefilledSourcePostId) : null);
  
  // États pour le formulaire
  const [title, setTitle] = useState(() => {
    if (loadedDraft) {
      return loadedDraft.title;
    }
    if (sourceIdea) {
      return `[À modifier] ${sourceIdea.title}`;
    }
    return derivedSourcePost ? '' : ''; // Laisser vide pour que l'utilisateur complète
  });
  
  const [summary, setSummary] = useState(() => {
    if (loadedDraft) {
      return loadedDraft.summary;
    }
    if (sourceIdea) {
      return `[À modifier] ${sourceIdea.summary}`;
    }
    return derivedSourcePost ? `Inspiré par le post de ${derivedSourcePost.author.name}...` : '';
  });
  
  const [description, setDescription] = useState(() => {
    if (loadedDraft) {
      return loadedDraft.description || '';
    }
    if (sourceIdea) {
      return `[À modifier] ${sourceIdea.description}

---

## 💡 Pistes d'amélioration à intégrer :
- Intégrer les retours des discussions sélectionnées
- Préciser certains aspects techniques ou pratiques  
- Améliorer la faisabilité ou réduire les coûts
- Adapter aux contraintes locales mentionnées
- Enrichir avec de nouvelles fonctionnalités suggérées

*Modifiez le contenu ci-dessus pour refléter vos améliorations et l'évolution par rapport à l'idée originale de ${sourceIdea.creators[0]?.name || 'l\'équipe'}.*`;
    }
    return derivedSourcePost ? `En me basant sur le post de ${derivedSourcePost.author.name}:

"${derivedSourcePost.content}"

Je propose de développer cette idée...` : '';
  });

  const [location, setLocation] = useState(() => {
    // Pré-remplir avec la localisation du store, de l'idée source ou du post source
    return store.prefilledLocation || sourceIdea?.location || derivedSourcePost?.location || '';
  });
  const [selectedCoCreators, setSelectedCoCreators] = useState<User[]>([]);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>(() => {
    const initialIds = prefilledLinkedContent || [];
    // Ajouter automatiquement l'idée source si elle existe et n'est pas déjà présente
    if (prefilledSourceIdea && !initialIds.includes(prefilledSourceIdea)) {
      initialIds.push(prefilledSourceIdea);
    }
    return initialIds;
  });
  const [showNoLinksDialog, setShowNoLinksDialog] = useState(false);

  // Effet pour ajouter automatiquement le post source aux contenus liés
  useEffect(() => {
    if (derivedSourcePost && !selectedParentIds.includes(derivedSourcePost.id)) {
      setSelectedParentIds(prev => [...prev, derivedSourcePost.id]);
    }
  }, [derivedSourcePost, selectedParentIds]);

  // Effet pour charger les données du brouillon
  useEffect(() => {
    if (loadedDraft) {
      setTitle(loadedDraft.title);
      setSummary(loadedDraft.summary);
      setDescription(loadedDraft.description || '');
      // Marquer le brouillon comme chargé
      onDraftLoaded?.();
    }
  }, [loadedDraft, onDraftLoaded]);

  // Gestion des actions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si l'utilisateur peut créer des idées
    if (!actions.canCreateIdea()) {
      toast.error('Vous devez créer un compte pour publier une idée');
      actions.goToSignup();
      return;
    }
    
    // Validation avec messages d'erreur explicites
    if (!title.trim()) {
      toast.error('Veuillez renseigner un titre pour votre idée');
      return;
    }
    
    if (!summary.trim()) {
      toast.error('Veuillez renseigner un résumé pour votre idée');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Veuillez renseigner une description détaillée pour votre idée');
      return;
    }
    
    // Vérifier s'il y a des contenus liés
    const hasLinkedContent = selectedParentIds.length > 0 || 
                            (prefilledSelectedDiscussions && prefilledSelectedDiscussions.length > 0);
    
    if (!hasLinkedContent) {
      // Afficher le dialogue de confirmation
      setShowNoLinksDialog(true);
      return;
    }
    
    // Publier directement si il y a des liens
    publishIdea();
  };

  const publishIdea = () => {
    // Séparer les sourceIdeas et sourcePosts depuis selectedParentIds
    const sourceIdeas: string[] = [];
    const sourcePosts: string[] = [];
    
    selectedParentIds.forEach(id => {
      const idea = ideas.find(i => i.id === id);
      const post = posts.find(p => p.id === id);
      
      if (idea) {
        sourceIdeas.push(id);
      } else if (post) {
        sourcePosts.push(id);
      }
    });
    
    // CORRECTION : Ajouter automatiquement l'idée source aux sourceIdeas si c'est une version
    if (prefilledSourceIdea && !sourceIdeas.includes(prefilledSourceIdea)) {
      sourceIdeas.push(prefilledSourceIdea);
    }

    actions.publishIdea({
      title: title.trim(),
      summary: summary.trim(),
      description: description.trim(),
      location: location.trim() || undefined,
      creators: selectedCoCreators,
      sourceIdeas: sourceIdeas,
      sourcePosts: sourcePosts,
      sourceDiscussions: prefilledSelectedDiscussions || [], // Ajouter les discussions sources
      discussionIds: [] // Ne pas copier les discussions
    });
    
    // Reset form
    setTitle('');
    setSummary('');
    setDescription('');
    setLocation('');
    setSelectedCoCreators([]);
    setSelectedParentIds([]);
  };

  const handleConfirmPublishWithoutLinks = () => {
    setShowNoLinksDialog(false);
    publishIdea();
  };

  const handleCancelNoLinksDialog = () => {
    setShowNoLinksDialog(false);
  };

  const handleStartFromScratch = () => {
    // Réinitialiser tous les champs et données préremplies
    setTitle('');
    setSummary('');
    setDescription('');
    setLocation('');
    setSelectedParentIds([]);
    setSelectedCoCreators([]);
    
    // Appeler onClearPrefilled si disponible pour nettoyer l'état parent
    if (onClearPrefilled) {
      onClearPrefilled();
    }
    
    toast.success('Formulaire réinitialisé pour une création depuis zéro');
  };

  return (
    <div className="space-y-6">
      {/* Bandeau d'indication de source */}
      <SourceIndicatorBanner
        sourcePost={derivedSourcePost}
        prefilledSourceIdea={prefilledSourceIdea}
        prefilledLinkedContent={prefilledLinkedContent}
        prefilledSelectedDiscussions={prefilledSelectedDiscussions}
        onClearPrefilled={onClearPrefilled}
        onStartFromScratch={handleStartFromScratch}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Formulaire de base */}
        <BasicIdeaForm
          title={title}
          setTitle={setTitle}
          summary={summary}
          setSummary={setSummary}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          sourcePost={derivedSourcePost}
        />

        {/* Section collaboration */}
        <CollaborationForm
          selectedCoCreators={selectedCoCreators}
          setSelectedCoCreators={setSelectedCoCreators}
          selectedParentIds={selectedParentIds}
          setSelectedParentIds={setSelectedParentIds}
          prefilledSelectedDiscussions={prefilledSelectedDiscussions}
          users={users}
          ideas={ideas}
          posts={posts}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          {onSaveDraft && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onSaveDraft(title, summary, description)}
              className="flex items-center space-x-2"
            >
              <Quote className="w-4 h-4" />
              <span>Enregistrer brouillon</span>
            </Button>
          )}
          <Button type="submit" className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Publier l'idée</span>
          </Button>
        </div>
      </form>

      {/* Dialogue de confirmation pour publication sans liens */}
      <PublishConfirmationDialog
        isOpen={showNoLinksDialog}
        onConfirm={handleConfirmPublishWithoutLinks}
        onCancel={handleCancelNoLinksDialog}
      />
    </div>
  );
}