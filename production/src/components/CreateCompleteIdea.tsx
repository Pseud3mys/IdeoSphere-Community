import { useState, useEffect, useRef } from 'react';
import { User, Idea, Post, Location } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { Button } from './ui/button';
import { SourceIndicatorBanner } from './create-idea/SourceIndicatorBanner';
import { BasicIdeaForm } from './create-idea/BasicIdeaForm';
import { PublishConfirmationDialog } from './create-idea/PublishConfirmationDialog';
import { Quote, Send } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CreateCompleteIdeaProps {
  sourcePost?: Post;
  prefilledParentIds?: string[]; // ✨ TOUS les contenus pré-remplis fusionnés
  prefilledGroupIds?: string[];
  onClearPrefilled?: () => void;
  onSaveDraft?: (
    title: string, 
    summary: string, 
    description?: string, 
    selectedParentIds?: string[],
    location?: string,
    groupIds?: string[]
  ) => void;
  loadedDraft?: {
    id: string;
    title: string;
    summary: string;
    description?: string;
    type: 'post' | 'idea';
    createdAt: Date | string;
    sourcePostIds?: string[];
    selectedParentIds?: string[]; // Liens vers contenus
    location?: string; // Localisation
    groupIds?: string[]; // Groupes associés
  } | null;
  onDraftLoaded?: () => void;
}

export function CreateCompleteIdea({ 
  sourcePost, 
  prefilledParentIds,
  prefilledGroupIds,
  onClearPrefilled,
  onSaveDraft,
  loadedDraft,
  onDraftLoaded
}: CreateCompleteIdeaProps) {
  // Récupération des données depuis l'Entity Store
  const {
    store,
    getCurrentUser,
    getUserById,
    getAllUsers,
    getAllIdeas,
    getAllPosts,
    getAllGroups,
    getDiscussionTopicById,
    actions,
    rawActions
  } = useEntityStoreSimple();
  
  const navigation = useNavigationActions();
  const currentUser = getCurrentUser();
  const users = getAllUsers();
  const ideas = getAllIdeas();
  const posts = getAllPosts();
  const allGroups = getAllGroups();

  // Les utilisateurs sont déjà chargés au démarrage de l'app via loadInitialData

  // ✅ Utiliser unknownUser comme fallback pour les invités
  const effectiveUser = currentUser || { id: 'unknown', name: 'Invité', email: '' } as any;

  // ✨ Plus besoin de sourceIdea séparément, tout est dans prefilledParentIds
  
  // Obtenir le post source depuis les props ou depuis le store
  const derivedSourcePost = sourcePost || 
    (store.prefilledSourcePostId ? posts.find(p => p.id === store.prefilledSourcePostId) : null);
  
  // ✅ Résoudre l'auteur du post source
  const derivedSourcePostAuthor = derivedSourcePost ? getUserById(derivedSourcePost.authorId) : null;
  
  // États pour le formulaire
  const [title, setTitle] = useState(() => {
    // PRIORITÉ 1: Charger depuis le brouillon
    if (loadedDraft) {
      return loadedDraft.title;
    }
    // PRIORITÉ 2: Charger depuis le store (persistance navigation)
    if (store.draftIdeaTitle) {
      console.log('🔄 Restauration du titre depuis le store:', store.draftIdeaTitle);
      return store.draftIdeaTitle;
    }
    // PRIORITÉ 3: Vérifier si un des contenus pré-remplis est une idée source
    const sourceIdeaId = prefilledParentIds?.find(id => ideas.find(i => i.id === id));
    if (sourceIdeaId) {
      const sourceIdea = ideas.find(i => i.id === sourceIdeaId);
      if (sourceIdea) {
        return `[À modifier] ${sourceIdea.title}`;
      }
    }
    // Par défaut: vide
    return derivedSourcePost ? '' : '';
  });
  
  const [summary, setSummary] = useState(() => {
    // PRIORITÉ 1: Charger depuis le brouillon
    if (loadedDraft) {
      return loadedDraft.summary;
    }
    // PRIORITÉ 2: Charger depuis le store (persistance navigation)
    if (store.draftIdeaSummary) {
      console.log('🔄 Restauration du résumé depuis le store');
      return store.draftIdeaSummary;
    }
    // PRIORITÉ 3: Vérifier si un des contenus pré-remplis est une idée source
    const sourceIdeaId = prefilledParentIds?.find(id => ideas.find(i => i.id === id));
    if (sourceIdeaId) {
      const sourceIdea = ideas.find(i => i.id === sourceIdeaId);
      if (sourceIdea) {
        return `[À modifier] ${sourceIdea.summary}`;
      }
    }
    // PRIORITÉ 4: Utiliser le titre ou contenu du post source
    if (derivedSourcePost) {
      // Si le post a un titre, l'utiliser comme résumé de base
      if (derivedSourcePost.title) {
        return derivedSourcePost.title;
      }
      // Sinon, prendre les 200 premiers caractères du post comme résumé
      const postContent = derivedSourcePost.content;
      const truncated = postContent.length > 200 ? postContent.substring(0, 200) + '...' : postContent;
      return truncated;
    }
    return '';
  });
  
  const [description, setDescription] = useState(() => {
    // PRIORIT�� 1: Charger depuis le brouillon
    if (loadedDraft) {
      return loadedDraft.description || '';
    }
    // PRIORITÉ 2: Charger depuis le store (persistance navigation)
    if (store.draftIdeaDescription) {
      console.log('🔄 Restauration de la description depuis le store');
      return store.draftIdeaDescription;
    }
    // PRIORITÉ 3: Vérifier si un des contenus pré-remplis est une idée source
    const sourceIdeaId = prefilledParentIds?.find(id => ideas.find(i => i.id === id));
    if (sourceIdeaId) {
      const sourceIdea = ideas.find(i => i.id === sourceIdeaId);
      if (sourceIdea) {
        const sourceCreatorName = sourceIdea.creatorIds?.[0] 
          ? (getUserById(sourceIdea.creatorIds[0])?.name || 'l\'équipe')
          : 'l\'équipe';
        
        return `[À modifier] ${sourceIdea.description}

---

## 💡 Pistes d'amélioration à intégrer :
- Intégrer les retours des discussions sélectionnées
- Préciser certains aspects techniques ou pratiques  
- Améliorer la faisabilité ou réduire les coûts
- Adapter aux contraintes locales mentionnées
- Enrichir avec de nouvelles fonctionnalités suggérées

*Modifiez le contenu ci-dessus pour refléter vos améliorations et l'évolution par rapport à l'idée originale de ${sourceCreatorName}.*`;
      }
    }
    // PRIORITÉ 4: Préremplir depuis le post source
    if (derivedSourcePost) {
      const authorName = derivedSourcePostAuthor?.name || 'un membre';
      const postIntro = derivedSourcePost.title ? `**${derivedSourcePost.title}**\n\n${derivedSourcePost.content}` : derivedSourcePost.content;
      return `## 💭 Contexte

${postIntro}

*(Post original de ${authorName})*

---

## 📋 Description du projet

[Développez ici votre projet en détaillant les aspects pratiques, les objectifs, et les étapes de mise en œuvre...]

## 🎯 Objectifs

- 
- 

## 📅 Prochaines étapes

1. 
2. 

---

*N'hésitez pas à modifier complètement cette structure pour l'adapter à votre projet !*`;
    }
    return '';
  });

  const [location, setLocation] = useState<Location | string>(() => {
    // Charger depuis le brouillon en priorité
    if (loadedDraft?.location) {
      return loadedDraft.location;
    }
    // Vérifier si un des contenus pré-remplis a une location
    const sourceIdeaId = prefilledParentIds?.find(id => ideas.find(i => i.id === id));
    if (sourceIdeaId) {
      const sourceIdea = ideas.find(i => i.id === sourceIdeaId);
      if (sourceIdea?.location) {
        return sourceIdea.location;
      }
    }
    // Sinon, pré-remplir avec la localisation du store ou du post source
    return store.prefilledLocation || derivedSourcePost?.location || '';
  });
  const [groupIds, setGroupIds] = useState<string[]>(() => {
    // Charger depuis le brouillon en priorité
    if (loadedDraft?.groupIds) {
      return loadedDraft.groupIds;
    }
    // Sinon, utiliser les groupes pré-remplis
    return prefilledGroupIds || [];
  });
  const [selectedCoCreators, setSelectedCoCreators] = useState<User[]>([]);
  const [selectedParentIds, setSelectedParentIds] = useState<string[]>(() => {
    // PRIORITÉ 1: Si on a un brouillon, charger ses liens
    if (loadedDraft?.selectedParentIds && loadedDraft.selectedParentIds.length > 0) {
      console.log('🔄 Chargement des liens depuis le brouillon:', loadedDraft.selectedParentIds);
      return loadedDraft.selectedParentIds;
    }
    // PRIORITÉ 2: Charger depuis le store (persistance navigation)
    // prefilledParentIds contient déjà tous les contenus fusionnés (sourceIdea + linkedContent + discussions)
    if (prefilledParentIds && prefilledParentIds.length > 0) {
      console.log('🔄 Restauration des liens depuis prefilledParentIds:', prefilledParentIds);
      return prefilledParentIds;
    }
    
    return [];
  });
  const [showNoLinksDialog, setShowNoLinksDialog] = useState(false);

  // Ref pour le timer de l'auto-sauvegarde
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastAutoSaveRef = useRef<string>(''); // Pour éviter les sauvegardes redondantes

  // 💾 PERSISTANCE : Sauvegarder dans le store à chaque changement pour persister lors de la navigation
  useEffect(() => {
    // Ne sauvegarder que si on n'est pas en train de charger un brouillon
    if (!loadedDraft) {
      rawActions.setDraftIdeaTitle(title);
      rawActions.setDraftIdeaSummary(summary);
      rawActions.setDraftIdeaDescription(description);
      rawActions.setPrefilledSelectedParentIds(selectedParentIds);
      rawActions.setPrefilledLocation(typeof location === 'string' ? location : JSON.stringify(location));
      rawActions.setPrefilledGroupIds(groupIds);
    }
  }, [title, summary, description, selectedParentIds, location, groupIds, loadedDraft, rawActions]);

  // Effet pour ajouter automatiquement le post source aux contenus liés
  useEffect(() => {
    if (derivedSourcePost && !selectedParentIds.includes(derivedSourcePost.id)) {
      setSelectedParentIds(prev => [...prev, derivedSourcePost.id]);
    }
  }, [derivedSourcePost, selectedParentIds]);

  // Effet pour charger les données du brouillon
  useEffect(() => {
    if (loadedDraft) {
      console.log('📋 Chargement du brouillon:', loadedDraft);
      setTitle(loadedDraft.title);
      setSummary(loadedDraft.summary);
      setDescription(loadedDraft.description || '');
      if (loadedDraft.selectedParentIds && loadedDraft.selectedParentIds.length > 0) {
        console.log('✅ Chargement des liens du brouillon:', loadedDraft.selectedParentIds);
        setSelectedParentIds(loadedDraft.selectedParentIds);
      }
      if (loadedDraft.location) {
        setLocation(loadedDraft.location);
      }
      if (loadedDraft.groupIds && loadedDraft.groupIds.length > 0) {
        setGroupIds(loadedDraft.groupIds);
      }
      // Marquer le brouillon comme chargé
      onDraftLoaded?.();
    }
  }, [loadedDraft, onDraftLoaded]);

  // ✨ AUTO-SAUVEGARDE AUTOMATIQUE DES BROUILLONS
  // Sauvegarde automatiquement toutes les 30 secondes si du contenu a été écrit
  useEffect(() => {
    // Nettoyer le timer précédent
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Ne sauvegarder que s'il y a du contenu significatif
    const hasContent = title.trim().length > 0 || summary.trim().length > 0 || description.trim().length > 0;
    
    if (hasContent && onSaveDraft) {
      // Créer une signature du contenu actuel
      const currentSignature = JSON.stringify({ title, summary, description, selectedParentIds, location, groupIds });
      
      // Ne sauvegarder que si le contenu a changé
      if (currentSignature !== lastAutoSaveRef.current) {
        // Démarrer un timer de 30 secondes
        autoSaveTimerRef.current = setTimeout(() => {
          console.log('💾 Auto-sauvegarde du brouillon...');
          onSaveDraft(
            title, 
            summary, 
            description, 
            selectedParentIds, 
            typeof location === 'string' ? location : JSON.stringify(location), 
            groupIds
          );
          lastAutoSaveRef.current = currentSignature;
          toast.info('Brouillon sauvegardé automatiquement', { duration: 2000 });
        }, 30000); // 30 secondes
      }
    }

    // Cleanup lors du démontage
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [title, summary, description, selectedParentIds, location, groupIds, onSaveDraft]);

  // Gestion des actions
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si l'utilisateur peut créer des idées
    if (!actions.canCreateIdea()) {
      toast.error('Vous devez créer un compte pour publier un projet');
      navigation.goToSignup();
      return;
    }
    
    // Validation avec messages d'erreur explicites
    if (!title.trim()) {
      toast.error('Veuillez renseigner un titre pour votre projet');
      return;
    }
    
    if (!summary.trim()) {
      toast.error('Veuillez renseigner un résumé pour votre projet');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Veuillez renseigner une description détaillée pour votre projet');
      return;
    }
    
    // Vérifier s'il y a des contenus liés
    // selectedParentIds contient déjà tous les types de contenus (idées, posts, discussions)
    const hasLinkedContent = selectedParentIds.length > 0;
    
    if (!hasLinkedContent) {
      // Afficher le dialogue de confirmation
      setShowNoLinksDialog(true);
      return;
    }
    
    // Publier directement si il y a des liens
    publishIdea();
  };

  const publishIdea = async () => {
    // Séparer les sourceIdeas, sourcePosts et sourceDiscussions depuis selectedParentIds
    const sourceIdeas: string[] = [];
    const sourcePosts: string[] = [];
    const sourceDiscussions: string[] = [];
    
    selectedParentIds.forEach(id => {
      const idea = ideas.find(i => i.id === id);
      const post = posts.find(p => p.id === id);
      
      if (idea) {
        sourceIdeas.push(id);
      } else if (post) {
        sourcePosts.push(id);
      } else {
        // Si ce n'est ni une idée ni un post, c'est probablement une discussion (topic)
        sourceDiscussions.push(id);
      }
    });

    const newIdea = await actions.publishIdea({
      title: title.trim(),
      summary: summary.trim(),
      description: description.trim(),
      location: location || undefined,
      groupIds: groupIds.length > 0 ? groupIds : undefined,
      creators: selectedCoCreators,
      sourceIdeas: sourceIdeas,
      sourcePosts: sourcePosts,
      sourceDiscussions: sourceDiscussions, // Discussions extraites de selectedParentIds
      discussionIds: [] // Ne pas copier les discussions
    });
    
    // Navigate to the created idea
    if (newIdea) {
      navigation.goToIdea(newIdea.id);
    }
    
    // Reset form
    setTitle('');
    setSummary('');
    setDescription('');
    setLocation('');
    setGroupIds([]);
    setSelectedCoCreators([]);
    setSelectedParentIds([]);
    
    // Nettoyer le store après publication réussie
    rawActions.clearDraftIdea();
    rawActions.setPrefilledSelectedParentIds([]);
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
    setGroupIds([]);
    setSelectedParentIds([]);
    setSelectedCoCreators([]);
    
    // Nettoyer le store pour supprimer TOUTES les données pré-remplies
    rawActions.setPrefilledSourcePostId(null);
    rawActions.setPrefilledLocation(null);
    rawActions.setPrefilledGroupIds([]);
    rawActions.setPrefilledSelectedParentIds([]);
    rawActions.clearDraftIdea(); // Nettoyer le brouillon dans le store
    
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
        sourcePost={derivedSourcePost || undefined}
        selectedParentIds={selectedParentIds}
        onClearPrefilled={onClearPrefilled}
        onStartFromScratch={handleStartFromScratch}
        isIdeaMode={true}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <BasicIdeaForm
          title={title}
          setTitle={setTitle}
          summary={summary}
          setSummary={setSummary}
          description={description}
          setDescription={setDescription}
          location={location}
          setLocation={setLocation}
          groupIds={groupIds}
          setGroupIds={setGroupIds}
          // AJOUTER CES PROPS ICI :
          selectedParentIds={selectedParentIds}
          setSelectedParentIds={setSelectedParentIds}
          ideas={ideas}
          posts={posts}
          sourcePost={derivedSourcePost || undefined}
        />

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          {onSaveDraft && (
            <Button 
              type="button" 
              variant="outline"
              onClick={() => onSaveDraft(title, summary, description, selectedParentIds, typeof location === 'string' ? location : JSON.stringify(location), groupIds)}
              className="flex items-center space-x-2"
            >
              <Quote className="w-4 h-4" />
              <span>Enregistrer brouillon</span>
            </Button>
          )}
          <Button type="submit" className="flex items-center space-x-2">
            <Send className="w-4 h-4" />
            <span>Publier le projet</span>
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