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
  prefilledSourceIdea?: string | null;
  prefilledLinkedContent?: string[];
  prefilledSelectedDiscussions?: string[];
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
}

export function CreateIdeaPage({ sourcePost, prefilledSourceIdea, prefilledLinkedContent, prefilledSelectedDiscussions, onClearPrefilled }: CreateIdeaPageProps) {
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
      prefilledSourceIdea,
      prefilledLinkedContentLength: prefilledLinkedContent?.length,
      prefilledSelectedDiscussionsLength: prefilledSelectedDiscussions?.length,
      hasSourcePost: !!sourcePost
    });
    
    // 1. Vérifier d'abord si on a une idée source préremplie
    if (prefilledSourceIdea) {
      console.log('✅ Mode IDEA : idée source détectée');
      return 'idea';
    }
    
    // 2. Si on a du contenu lié prérempli, c'est qu'on veut créer une idée
    if (prefilledLinkedContent && prefilledLinkedContent.length > 0) {
      console.log('✅ Mode IDEA : contenu lié détecté');
      return 'idea';
    }
    
    // 3. Si on a des discussions sélectionnées, c'est qu'on veut créer une idée
    if (prefilledSelectedDiscussions && prefilledSelectedDiscussions.length > 0) {
      console.log('✅ Mode IDEA : discussions sélectionnées');
      return 'idea';
    }
    
    // 4. SEULEMENT si on a un post source ET qu'on n'a AUCUN autre indicateur,
    // alors c'est qu'on veut créer un post de réponse
    if (sourcePost) {
      console.log('✅ Mode POST : post source pour réponse');
      return 'post';
    }
    
    // 5. Par défaut, commencer en mode post (plus simple)
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

  const handleSaveDraft = (title: string, summary: string, description?: string) => {
    const newDraft: Draft = {
      id: Date.now().toString(),
      title: title || 'Brouillon sans titre',
      summary: summary || description?.slice(0, 100) + '...' || '',
      description: description,
      type: creationMode,
      createdAt: new Date(),
      sourcePostIds: sourcePost ? [sourcePost.id] : []
    };

    const updatedDrafts = [newDraft, ...drafts].slice(0, 10); // Garder max 10 brouillons
    setDrafts(updatedDrafts);
    localStorage.setItem('ideosphere-drafts', JSON.stringify(updatedDrafts));
    toast.success('Brouillon sauvegardé localement ! 💾');
  };

  const loadDraft = (draft: Draft) => {
    // Simuler le chargement d'un brouillon (dans une vraie app, on sauvegarderait plus de données)
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
          (store.prefilledLinkedContent && store.prefilledLinkedContent.length > 0) ||
          prefilledSourceIdea ||
          (prefilledSelectedDiscussions && prefilledSelectedDiscussions.length > 0)
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
              onSwitchToIdea={switchToIdeaMode}
            />
          ) : (
            <CreateCompleteIdea
              sourcePost={sourcePost}
              prefilledSourceIdea={prefilledSourceIdea}
              prefilledLinkedContent={prefilledLinkedContent}
              prefilledSelectedDiscussions={prefilledSelectedDiscussions}
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