import { useState } from 'react';
import { Post } from '../../types';
import { QuickPostComposer } from './QuickPostComposer';
import { QuickPostFeed } from './QuickPostFeed';
import { QuickPostSuccess } from './QuickPostSuccess';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';

export interface QuickPostWidgetProps {
  // Configuration du widget
  defaultGroupIds?: string[];
  defaultTags?: string[]; // Tags à ajouter automatiquement (ex: ['#FAQ'])
  showContactFields?: boolean;
  
  // Contrôle du feed
  showFeedAfterPost?: boolean;
  feedSize?: 4 | 6;
  
  // Callbacks
  onPostCreated?: (post: Post) => void;
  onClose?: () => void;
  
  // Mode standalone pour iframe
  standalone?: boolean;
  
  // Placeholder personnalisé
  placeholder?: string;
  
  // Fond du widget (transparent par défaut)
  background?: 'white' | 'transparent';
}

type ViewMode = 'composer' | 'feed' | 'success';

export function QuickPostWidget({
  defaultGroupIds = [],
  defaultTags = [],
  showContactFields = false,
  showFeedAfterPost = false,
  feedSize = 6,
  onPostCreated,
  onClose,
  standalone = false,
  placeholder,
  background = 'transparent'
}: QuickPostWidgetProps) {
  const { getCurrentUser } = useEntityStoreSimple();
  const currentUser = getCurrentUser();
  
  const [currentView, setCurrentView] = useState<ViewMode>('composer');
  const [createdPost, setCreatedPost] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    // Initialiser avec l'utilisateur connecté ou le guest stocké
    if (currentUser) {
      console.log('[QuickPostWidget] Utilisateur connecté trouvé:', currentUser.id);
      return currentUser.id;
    }
    const storedGuestId = localStorage.getItem('quickpost_guest_user_id');
    if (storedGuestId) {
      console.log('[QuickPostWidget] Compte invité stocké trouvé:', storedGuestId);
      return storedGuestId;
    }
    console.log('[QuickPostWidget] Aucun utilisateur trouvé, sera créé lors de la soumission');
    return ''; // Chaîne vide au lieu de 'unknown'
  });

  const handlePostCreated = (post: Post) => {
    setCreatedPost(post);
    setCurrentUserId(post.authorId); // Sauvegarder l'ID de l'utilisateur créé
    
    // Callback externe
    if (onPostCreated) {
      onPostCreated(post);
    }

    // Basculer vers le feed ou la page de succès
    if (showFeedAfterPost) {
      setCurrentView('feed');
    } else {
      setCurrentView('success');
    }

    // Notification iframe si mode standalone
    if (standalone && window.parent !== window) {
      window.parent.postMessage({
        type: 'quickpost_created',
        postId: post.id,
        groupIds: defaultGroupIds
      }, '*');
    }
  };

  const handleCreateAnother = () => {
    setCurrentView('composer');
    setCreatedPost(null);
  };

  const handleFeedClose = () => {
    if (onClose) {
      onClose();
    }
    
    // Notification iframe si mode standalone
    if (standalone && window.parent !== window) {
      window.parent.postMessage({
        type: 'quickpost_closed'
      }, '*');
    }
  };

  return (
    <div className={standalone ? 'w-full max-w-2xl h-fit' : ''}>
      <div className={`
        ${standalone ? 'rounded-lg border border-black/20 shadow-sm overflow-hidden p-6' : ''}
        ${background === 'white' ? 'bg-white' : ''}
      `}>
        {currentView === 'composer' ? (
          <QuickPostComposer
            groupIds={defaultGroupIds}
            tags={defaultTags}
            showContactFields={showContactFields}
            onPostCreated={handlePostCreated}
            placeholder={placeholder}
          />
        ) : currentView === 'success' ? (
          <QuickPostSuccess
            onCreateAnother={handleCreateAnother}
          />
        ) : (
          <QuickPostFeed
            groupIds={defaultGroupIds}
            tags={defaultTags}
            feedSize={feedSize}
            currentUserId={currentUserId}
            onCreateAnother={showFeedAfterPost ? handleCreateAnother : undefined}
            onClose={handleFeedClose}
          />
        )}
      </div>
    </div>
  );
}
