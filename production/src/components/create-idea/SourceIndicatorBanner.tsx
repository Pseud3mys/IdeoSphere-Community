import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { GitBranch, X, RefreshCw } from 'lucide-react';
import { Post } from '../../types';

interface SourceIndicatorBannerProps {
  sourcePost?: Post;
  prefilledSourceIdea?: string | null;
  prefilledLinkedContent?: string[];
  prefilledSelectedDiscussions?: string[];
  onClearPrefilled?: () => void;
  onStartFromScratch: () => void;
}

export function SourceIndicatorBanner({
  sourcePost,
  prefilledSourceIdea,
  prefilledLinkedContent,
  prefilledSelectedDiscussions,
  onClearPrefilled,
  onStartFromScratch
}: SourceIndicatorBannerProps) {
  // Le bandeau ne s'affiche que s'il y a vraiment du contenu source
  const hasSourceContent = prefilledSourceIdea || 
                          (prefilledLinkedContent && prefilledLinkedContent.length > 0) || 
                          (prefilledSelectedDiscussions && prefilledSelectedDiscussions.length > 0) || 
                          sourcePost;

  if (!hasSourceContent) {
    return null;
  }

  return (
    <Card className="border-purple-200 bg-purple-50/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GitBranch className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800">
              Création d'une nouvelle version
            </span>
          </div>
          <div className="flex space-x-2">
            {/* Le bouton "Ne pas partir de ce contenu" fait disparaître tout le bandeau */}
            {onClearPrefilled && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearPrefilled}
                className="text-purple-600 hover:text-purple-800"
              >
                <X className="w-4 h-4 mr-2" />
                Ne pas partir de ce contenu
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onStartFromScratch}
              className="text-orange-600 hover:text-orange-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Partir de zéro
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-purple-700">
          {sourcePost && <div>• Inspirée du post de {sourcePost.author.name}</div>}
          {prefilledSourceIdea && <div>• Basée sur l'idée source</div>}
          {prefilledLinkedContent && prefilledLinkedContent.length > 0 && (
            <div>• {prefilledLinkedContent.length} contenu{prefilledLinkedContent.length > 1 ? 's' : ''} lié{prefilledLinkedContent.length > 1 ? 's' : ''}</div>
          )}
          {prefilledSelectedDiscussions && prefilledSelectedDiscussions.length > 0 && (
            <div>• {prefilledSelectedDiscussions.length} discussion{prefilledSelectedDiscussions.length > 1 ? 's' : ''} sélectionnée{prefilledSelectedDiscussions.length > 1 ? 's' : ''}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}