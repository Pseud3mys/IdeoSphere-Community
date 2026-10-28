// src/components/RemovedContentNotice.tsx
// Affiché à la place d'un post / projet retiré par la modération (lien partagé, ancienne notification…).
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import type { RemovalInfo } from '../api/contentService';

interface RemovedContentNoticeProps {
  kind: 'post' | 'idea';
  info: RemovalInfo;
}

export function RemovedContentNotice({ kind, info }: RemovedContentNoticeProps) {
  const navigate = useNavigate();
  const date = info.removedAt
    ? new Date(info.removedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardContent className="py-8 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 mx-auto text-red-600" />
          <h1 className="text-xl font-semibold text-gray-900">
            Ce {kind === 'post' ? 'post' : 'projet'} a été retiré par la modération
          </h1>
          {info.reasons.length > 0 && (
            <p className="text-gray-700">Motif : {info.reasons.join(', ')}</p>
          )}
          {date && <p className="text-sm text-gray-500">Le {date}</p>}
          <Button onClick={() => navigate('/discovery')}>Retour à l'exploration</Button>
        </CardContent>
      </Card>
    </div>
  );
}
