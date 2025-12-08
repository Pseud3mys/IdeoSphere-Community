import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { GitBranch, RefreshCw, AlertTriangle } from 'lucide-react';
import { Post } from '../../types';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';

interface SourceIndicatorBannerProps {
  sourcePost?: Post;
  prefilledSourceIdea?: string | null;
  prefilledLinkedContent?: string[];
  prefilledSelectedDiscussions?: string[];
  onClearPrefilled?: () => void;
  onStartFromScratch: () => void;
  isIdeaMode?: boolean; // Pour savoir si on est en mode projet (true) ou post (false)
}

export function SourceIndicatorBanner({
  sourcePost,
  prefilledSourceIdea,
  prefilledLinkedContent,
  prefilledSelectedDiscussions,
  onClearPrefilled,
  onStartFromScratch,
  isIdeaMode = true
}: SourceIndicatorBannerProps) {
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  // ✅ Résoudre l'auteur du post source
  const { getUserById, getIdeaById, getPostById } = useEntityStoreSimple();
  const sourcePostAuthor = sourcePost ? getUserById(sourcePost.authorId) : null;
  
  // Le bandeau ne s'affiche que s'il y a vraiment du contenu source
  const hasSourceContent = prefilledSourceIdea || 
                          (prefilledLinkedContent && prefilledLinkedContent.length > 0) || 
                          (prefilledSelectedDiscussions && prefilledSelectedDiscussions.length > 0) || 
                          sourcePost;

  if (!hasSourceContent) {
    return null;
  }

  // Compter le nombre total de contenus liés
  const linkedContentCount = (prefilledLinkedContent?.length || 0) + 
                             (prefilledSelectedDiscussions?.length || 0) +
                             (sourcePost ? 1 : 0) +
                             (prefilledSourceIdea ? 1 : 0);

  const handleResetClick = () => {
    // Pour les projets : afficher le dialog de confirmation
    if (isIdeaMode && linkedContentCount > 0) {
      setShowResetDialog(true);
    } else {
      // Pour les posts : reset direct
      onStartFromScratch();
    }
  };

  const handleConfirmReset = () => {
    setShowResetDialog(false);
    onStartFromScratch();
  };

  return (
    <>
      <Card className={isIdeaMode ? "border-purple-200 bg-purple-50/30" : "border-blue-100 bg-blue-50/20"}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GitBranch className={`w-4 h-4 ${isIdeaMode ? 'text-purple-600' : 'text-blue-600'}`} />
              <span className={`text-sm font-medium ${isIdeaMode ? 'text-purple-800' : 'text-blue-800'}`}>
                {isIdeaMode ? 'Création d\'une nouvelle version' : 'Réponse à un post'}
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleResetClick}
              className={isIdeaMode ? "text-orange-600 hover:text-orange-800" : "text-gray-500 hover:text-gray-700 text-xs"}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Repartir de zéro
            </Button>
          </div>
          {isIdeaMode && (
            <div className="mt-2 text-xs text-purple-700">
              {sourcePost && sourcePostAuthor && <div>• Inspirée du post de {sourcePostAuthor.name}</div>}
              {prefilledSourceIdea && <div>• Basée sur l'idée source</div>}
              {prefilledLinkedContent && prefilledLinkedContent.length > 0 && (
                <div>• {prefilledLinkedContent.length} contenu{prefilledLinkedContent.length > 1 ? 's' : ''} lié{prefilledLinkedContent.length > 1 ? 's' : ''}</div>
              )}
              {prefilledSelectedDiscussions && prefilledSelectedDiscussions.length > 0 && (
                <div>• {prefilledSelectedDiscussions.length} discussion{prefilledSelectedDiscussions.length > 1 ? 's' : ''} sélectionnée{prefilledSelectedDiscussions.length > 1 ? 's' : ''}</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmation pour les projets */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Repartir de zéro ?
            </DialogTitle>
            <DialogDescription className="space-y-3 pt-2">
              <p>Vous allez perdre tous les liens avec les contenus suivants :</p>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                {sourcePost && sourcePostAuthor && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>Post de <strong>{sourcePostAuthor.name}</strong></span>
                  </div>
                )}
                {prefilledSourceIdea && (() => {
                  const idea = getIdeaById(prefilledSourceIdea);
                  return idea ? (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>Projet : <strong>{idea.title}</strong></span>
                    </div>
                  ) : null;
                })()}
                {prefilledLinkedContent && prefilledLinkedContent.length > 0 && 
                  prefilledLinkedContent.map(contentId => {
                    const idea = getIdeaById(contentId);
                    const post = idea ? null : getPostById(contentId);
                    const item = idea || post;
                    if (!item) return null;
                    return (
                      <div key={contentId} className="flex items-start gap-2">
                        <span className="text-gray-400">•</span>
                        <span>{idea ? 'Projet' : 'Post'} : <strong>{item.title || (item as any).content?.substring(0, 50) + '...'}</strong></span>
                      </div>
                    );
                  })
                }
                {prefilledSelectedDiscussions && prefilledSelectedDiscussions.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{prefilledSelectedDiscussions.length} discussion{prefilledSelectedDiscussions.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm">Cette action est irréversible.</p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleConfirmReset}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Confirmer et repartir de zéro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}