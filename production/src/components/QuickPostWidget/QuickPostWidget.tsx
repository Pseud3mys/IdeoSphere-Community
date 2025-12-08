import { useState } from 'react';
import { Post } from '../../types';
import { QuickPostComposer } from './QuickPostComposer';
import { QuickPostFeed } from './QuickPostFeed';
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
}

type ViewMode = 'composer' | 'feed';

export function QuickPostWidget({
  defaultGroupIds = [],
  defaultTags = [],
  showContactFields = false,
  showFeedAfterPost = false,
  feedSize = 6,
  onPostCreated,
  onClose,
  standalone = false,
  placeholder
}: QuickPostWidgetProps) {
  const { getCurrentUser } = useEntityStoreSimple();
  const currentUser = getCurrentUser();
  
  const [currentView, setCurrentView] = useState<ViewMode>('composer');
  const [createdPost, setCreatedPost] = useState<Post | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    // Initialiser avec l'utilisateur connecté ou le guest stocké
    if (currentUser) return currentUser.id;
    const storedGuestId = localStorage.getItem('quickpost_guest_user_id');
    return storedGuestId || 'unknown';
  });

  const handlePostCreated = (post: Post) => {
    setCreatedPost(post);
    setCurrentUserId(post.authorId); // Sauvegarder l'ID de l'utilisateur créé
    
    // Callback externe
    if (onPostCreated) {
      onPostCreated(post);
    }

    // Basculer vers le feed si activé
    if (showFeedAfterPost) {
      setCurrentView('feed');
    } else {
      // Si pas de feed, fermer ou notifier
      if (onClose) {
        onClose();
      }
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
    <div className={standalone ? 'min-h-screen bg-gray-50 p-4' : ''}>
      <div className={standalone ? 'max-w-2xl mx-auto' : ''}>
        {currentView === 'composer' ? (
          <QuickPostComposer
            groupIds={defaultGroupIds}
            tags={defaultTags}
            showContactFields={showContactFields}
            onPostCreated={handlePostCreated}
            placeholder={placeholder}
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
