import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { MessageSquare, Lightbulb, Archive, Trash2, X } from 'lucide-react';

export interface Draft {
  id: string;
  title: string;
  summary: string;
  type: 'post' | 'idea';
  createdAt: Date | string;
  sourcePostIds?: string[];
}

interface DraftsSectionProps {
  drafts: Draft[];
  onLoadDraft: (draft: Draft) => void;
  onDeleteDraft: (draftId: string) => void;
  onClose?: () => void;
}

export function DraftsSection({ 
  drafts, 
  onLoadDraft, 
  onDeleteDraft,
  onClose
}: DraftsSectionProps) {
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('fr-FR');
  };

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center space-x-2">
            <Archive className="w-4 h-4 text-amber-600" />
            <span>Brouillons sauvegardés</span>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {drafts.map(draft => (
            <div key={draft.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  {draft.type === 'post' ? (
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-1">{draft.title}</h4>
                  <p className="text-xs text-gray-500">
                    {draft.summary} • {formatDate(draft.createdAt)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoadDraft(draft)}
                  className="h-8 px-3"
                >
                  Charger
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteDraft(draft.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}