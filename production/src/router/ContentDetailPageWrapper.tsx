import { useParams } from 'react-router-dom';
import { IdeaDetailPageWrapper } from './IdeaDetailPageWrapper';
import { PostDetailPageWrapper } from './PostDetailPageWrapper';

/**
 * ContentDetailPageWrapper
 * Wrapper unifié pour les pages de détail de contenu (ideas et posts)
 * Détecte automatiquement le type via le préfixe de l'ID
 * 
 * Format attendu :
 * - ideas/123 → Route vers IdeaDetailPageWrapper
 * - posts/456 → Route vers PostDetailPageWrapper
 * 
 * Note : Utilise le splat route (*) pour capturer les IDs avec slashes
 */
export function ContentDetailPageWrapper() {
  const { '*': contentId } = useParams<{ '*': string }>();

  // Vérifier que l'ID existe
  if (!contentId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground">ID de contenu manquant</p>
        </div>
      </div>
    );
  }

  // Détecter le type via le préfixe
  if (contentId.startsWith('ideas/')) {
    return <IdeaDetailPageWrapper />;
  }

  if (contentId.startsWith('posts/')) {
    return <PostDetailPageWrapper />;
  }

  // Type de contenu invalide
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-muted-foreground">Type de contenu invalide : {contentId}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Format attendu : ideas/xxx ou posts/xxx
        </p>
      </div>
    </div>
  );
}
