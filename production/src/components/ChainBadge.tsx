import { ItemChainContext } from '../utils/feedChainUtils';
import { Badge } from './ui/badge';
import { 
  GitBranch, 
  TrendingUp, 
  Sparkles,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface ChainBadgeProps {
  context: ItemChainContext;
  itemType: 'post' | 'idea';
  compact?: boolean;
}

export function ChainBadge({ 
  context, 
  itemType, 
  compact = false
}: ChainBadgeProps) {
  const [showDialog, setShowDialog] = useState(false);

  if (!context.isInChain) {
    return null;
  }

  // Version compacte - juste un petit indicateur
  if (compact) {
    return (
      <div className="flex items-center space-x-1">
        <GitBranch className="w-3 h-3 text-blue-500" />
        <span className="text-xs text-gray-500">{context.chainLength}</span>
      </div>
    );
  }

  // Message contextuel selon la position dans la chaîne (version courte)
  const getMessage = () => {
    if (context.position === 'root' && context.hasChildren) {
      return `+${context.childCount}`;
    }
    if (context.position === 'latest' && context.hasParents) {
      return `${context.parentCount}→`;
    }
    // Position middle
    return `${context.chainLength}`;
  };

  const message = getMessage();
  if (!message) return null;

  return (
    <>
      <button
        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setShowDialog(true);
        }}
      >
        {context.position === 'root' && context.hasChildren && (
          <ArrowRight className="w-3 h-3" />
        )}
        {context.position === 'latest' && context.hasParents && (
          <ArrowLeft className="w-3 h-3" />
        )}
        {context.position === 'middle' && (
          <GitBranch className="w-3 h-3" />
        )}
        
        <span className="text-[10px]">{message}</span>
        
        {context.hasUnseenInChain && (
          <Sparkles className="w-2.5 h-2.5 text-green-500" />
        )}
      </button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <GitBranch className="w-4 h-4 text-blue-500" />
              Chaîne d'inspiration
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            {/* Statistiques de la chaîne */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className={`grid ${context.hasParents && context.hasChildren ? 'grid-cols-3' : context.hasParents || context.hasChildren ? 'grid-cols-2' : 'grid-cols-1'} gap-3 text-center`}>
                {context.hasParents && (
                  <div>
                    <ArrowLeft className="w-3.5 h-3.5 mx-auto text-blue-600 mb-0.5" />
                    <div className="text-lg">{context.parentCount}</div>
                    <div className="text-[10px] text-blue-600">source{context.parentCount > 1 ? 's' : ''}</div>
                  </div>
                )}
                
                <div>
                  <GitBranch className="w-3.5 h-3.5 mx-auto text-blue-600 mb-0.5" />
                  <div className="text-lg">{context.chainLength}</div>
                  <div className="text-[10px] text-blue-600">total</div>
                </div>

                {context.hasChildren && (
                  <div>
                    <ArrowRight className="w-3.5 h-3.5 mx-auto text-blue-600 mb-0.5" />
                    <div className="text-lg">{context.childCount}</div>
                    <div className="text-[10px] text-blue-600">suite{context.childCount > 1 ? 's' : ''}</div>
                  </div>
                )}
              </div>

              {/* Soutiens max dans la chaîne */}
              {context.maxSupportInChain > 0 && (
                <div className="mt-2 pt-2 border-t border-blue-200 flex items-center justify-center gap-1.5 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs">
                    Max <strong>{context.maxSupportInChain}</strong> soutien{context.maxSupportInChain > 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {context.hasUnseenInChain && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <Badge className="bg-green-500 text-white w-full justify-center text-[10px] py-0.5">
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    Nouveau
                  </Badge>
                </div>
              )}
            </div>

            {/* Note explicative */}
            <p className="text-xs text-gray-600 text-center">
              {context.position === 'root' && 'A inspiré d\'autres contributions'}
              {context.position === 'latest' && 'S\'inspire de contributions précédentes'}
              {context.position === 'middle' && 'Fait partie d\'un échange créatif'}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
