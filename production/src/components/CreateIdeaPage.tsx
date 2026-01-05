import { useState } from 'react';
import { Post } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CreateQuickPost } from './CreateQuickPost';
import { CreateCompleteIdea } from './CreateCompleteIdea';
import { DraftsSection } from './create-idea/DraftsSection';
import { CreateIdeaHeader } from './create-idea/CreateIdeaHeader';
import { CreateIdeaSidebar } from './create-idea/CreateIdeaSidebar';
import { 
  MessageSquare,
  Lightbulb,
  Archive
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CreateIdeaPageProps {
  sourcePost?: Post; // Post source si on vient d'un post
  prefilledParentIds?: string[]; // ✨ TOUS les contenus pré-remplis fusionnés (idées, posts, discussions)
  prefilledGroupIds?: string[];
  prefilledCreationMode?: 'post' | 'idea'; // Mode de création pré-rempli depuis la navigation
  onClearPrefilled?: () => void;
}

// Interface pour les brouillons sauvegardés localement
interface Draft {
  id: string;
  title: string;
  summary: string;
  description?: string;
  type: 'post' | 'idea';
  createdAt: Date | string;
  sourcePostIds?: string[];
  selectedParentIds?: string[]; // Liens vers contenus (idées/posts)
  location?: string; // Localisation du projet
  groupIds?: string[]; // Groupes associés
}

export function CreateIdeaPage({ sourcePost, prefilledParentIds, prefilledGroupIds, prefilledCreationMode, onClearPrefilled }: CreateIdeaPageProps) {
  // Récup��ration des données depuis l'Entity Store
  const {
    store,
    getCurrentUser,
    getAllUsers,
    getAllIdeas,
    getAllPosts,
    actions
  } = useEntityStoreSimple();

  const currentUser = getCurrentUser();
  const users = getAllUsers();
  const ideas = getAllIdeas();
  const posts = getAllPosts();

  // ✅ Utiliser unknownUser comme fallback pour les invités
  const effectiveUser = currentUser || { id: 'unknown', name: 'Invité', email: '' } as any;

  // Mode création : déterminer selon les données préremplies
  const [creationMode, setCreationMode] = useState<'post' | 'idea'>(() => {
    // IMPORTANT : L'ordre de vérification est crucial !
    
    console.log('🎯 [CreateIdeaPage] Détermination du mode de création:', {
      prefilledCreationMode,
      prefilledParentIdsLength: prefilledParentIds?.length,
      hasSourcePost: !!sourcePost
    });
    
    // 0. Si un mode est explicitement passé via la navigation, l'utiliser en priorité
    if (prefilledCreationMode) {
      console.log(`✅ Mode ${prefilledCreationMode.toUpperCase()} : explicitement défini via navigation`);
      return prefilledCreationMode;
    }
    
    // 1. Si on a des contenus pré-remplis (idées, posts, discussions), c'est qu'on veut créer une idée
    if (prefilledParentIds && prefilledParentIds.length > 0) {
      console.log('✅ Mode IDEA : contenus pré-remplis détectés');
      return 'idea';
    }
    
    // 2. SEULEMENT si on a un post source ET qu'on n'a AUCUN autre indicateur,
    // alors c'est qu'on veut créer un post de réponse
    if (sourcePost) {
      console.log('✅ Mode POST : post source pour réponse');
      return 'post';
    }
    
    // 3. Par défaut, commencer en mode post (plus simple)
    console.log('✅ Mode POST : par défaut');
    return 'post';
  });

  // Gestion des brouillons
  const [showDrafts, setShowDrafts] = useState(false);
  const [loadedDraft, setLoadedDraft] = useState<Draft | null>(null);
  const [drafts, setDrafts] = useState<Draft[]>(() => {
    // Charger les brouillons du localStorage
    const saved = localStorage.getItem('ideosphere-drafts');
    return saved ? JSON.parse(saved) : [];
  });

  const switchToIdeaMode = () => {
    setCreationMode('idea');
  };

  const handleSaveDraft = (
    title: string, 
    summary: string, 
    description?: string, 
    selectedParentIds?: string[],
    location?: string,
    groupIds?: string[]
  ) => {
    const newDraft: Draft = {
      id: Date.now().toString(),
      title: title || 'Brouillon sans titre',
      summary: summary || description?.slice(0, 100) + '...' || '',
      description: description,
      type: creationMode,
      createdAt: new Date(),
      sourcePostIds: sourcePost ? [sourcePost.id] : [],
      selectedParentIds: selectedParentIds || [], // Sauvegarder les liens
      location: location, // Sauvegarder la localisation
      groupIds: groupIds || [] // Sauvegarder les groupes
    };

    const updatedDrafts = [newDraft, ...drafts].slice(0, 10); // Garder max 10 brouillons
    setDrafts(updatedDrafts);
    localStorage.setItem('ideosphere-drafts', JSON.stringify(updatedDrafts));
    toast.success('Brouillon sauvegardé localement ! 💾');
  };

  const loadDraft = (draft: Draft) => {
    // Charger toutes les données du brouillon
    setCreationMode(draft.type);
    setLoadedDraft(draft);
    toast.success('Brouillon chargé ! 📋');
  };

  const deleteDraft = (draftId: string) => {
    const updatedDrafts = drafts.filter(d => d.id !== draftId);
    setDrafts(updatedDrafts);
    localStorage.setItem('ideosphere-drafts', JSON.stringify(updatedDrafts));
    toast.success('Brouillon supprimé');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header avec composant séparé */}
      <CreateIdeaHeader 
        creationMode={creationMode}
        draftsCount={drafts.length}
        onToggleDrafts={() => setShowDrafts(!showDrafts)}
        sourcePost={
          // Seulement afficher le sourcePost s'il y a des données préremplies
          (prefilledParentIds && prefilledParentIds.length > 0)
            ? sourcePost
            : undefined
        }
      />

      {/* Sélecteur de mode */}
      <div className="mb-8">
        <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1 w-fit">
          <Button
            variant={creationMode === 'post' ? "default" : "ghost"}
            size="sm"
            onClick={() => setCreationMode('post')}
            className="rounded-full px-4 h-8"
          >
            <MessageSquare className="w-3 h-3 mr-2" />
            Post rapide
          </Button>
          <Button
            variant={creationMode === 'idea' ? "default" : "ghost"}
            size="sm"
            onClick={switchToIdeaMode}
            className="rounded-full px-4 h-8"
          >
            <Lightbulb className="w-3 h-3 mr-2" />
            Projet complet
          </Button>
        </div>
      </div>

      {/* Brouillons avec composant séparé */}
      {showDrafts && (
        <DraftsSection 
          drafts={drafts}
          onLoadDraft={loadDraft}
          onDeleteDraft={deleteDraft}
          onClose={() => setShowDrafts(false)}
        />
      )}

      <div className="grid grid-cols-1 gap-4 md:gap-8">
        {/* Main content */}
        <div className="space-y-4 md:space-y-6">
          {creationMode === 'post' ? (
            <CreateQuickPost
              sourcePost={sourcePost}
              prefilledGroupIds={prefilledGroupIds}
              onSwitchToIdea={switchToIdeaMode}
            />
          ) : (
            <CreateCompleteIdea
              sourcePost={sourcePost}
              prefilledParentIds={prefilledParentIds}
              prefilledGroupIds={prefilledGroupIds}
              onClearPrefilled={onClearPrefilled}
              onSaveDraft={handleSaveDraft}
              loadedDraft={loadedDraft}
              onDraftLoaded={() => setLoadedDraft(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}