// src/components/AdminModerationTab.tsx
// Onglet « Modération auto » de la page Admin : dossiers créés par Mistral (ou par un admin),
// avec les décisions bannir / garder / restaurer / confirmer.
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Ban, CheckCircle, ExternalLink, Loader2, RotateCcw, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import {
  applyModerationAction,
  fetchModerationRecords,
  ModerationAction,
  ModerationRecord,
  ModerationStatus,
  ModerationView,
} from '../api/adminService';

const VIEWS: { value: ModerationView; label: string; empty: string }[] = [
  { value: 'pending', label: 'À traiter', empty: 'Aucun contenu signalé en attente de décision.' },
  { value: 'removed', label: 'Retirés', empty: 'Aucun contenu retiré en attente de confirmation.' },
  { value: 'history', label: 'Historique', empty: 'Aucune décision prise pour le moment.' },
];

// Le CSS Tailwind est pré-compilé (src/index.css) : seules les classes déjà présentes fonctionnent,
// les autres couleurs passent par `style`.
const STATUS: Record<ModerationStatus, { label: string; className: string; accent: string }> = {
  flagged: { label: 'Signalé, toujours en ligne', className: 'bg-amber-50 text-amber-800 border-amber-200', accent: '#f59e0b' },
  removed: { label: 'Retiré', className: 'bg-red-100 text-red-800 border-red-200', accent: '#ef4444' },
  confirmed: { label: 'Retrait confirmé', className: 'bg-red-50 text-red-700 border-red-200', accent: '#fca5a5' },
  restored: { label: 'Restauré', className: 'bg-green-100 text-green-800 border-green-200', accent: '#86efac' },
  dismissed: { label: 'Gardé en ligne', className: 'bg-gray-100 text-gray-700 border-gray-200', accent: '#d1d5db' },
};

const TYPE_LABEL: Record<ModerationRecord['contentType'], string> = {
  ideas: 'Projet',
  posts: 'Post',
  comment: 'Commentaire',
};

const ACTION_DONE: Record<ModerationAction, string> = {
  remove: 'Contenu banni : il est retiré du site et archivé',
  dismiss: 'Contenu gardé en ligne',
  confirm: 'Retrait confirmé',
  restore: 'Contenu restauré',
};

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function decidedByLabel(decidedBy: string | null) {
  if (!decidedBy) return '';
  return decidedBy === 'mistral' ? 'Mistral (automatique)' : 'Admin';
}

export function AdminModerationTab() {
  const navigate = useNavigate();
  const [view, setView] = useState<ModerationView>('pending');
  const [records, setRecords] = useState<ModerationRecord[]>([]);
  const [counts, setCounts] = useState<Record<ModerationView, number>>({ pending: 0, removed: 0, history: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const load = useCallback(async (v: ModerationView) => {
    setIsLoading(true);
    const result = await fetchModerationRecords(v);
    if (!result) {
      toast.error('Impossible de charger les dossiers de modération');
    } else {
      setRecords(result.data);
      setCounts(result.counts);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load(view);
  }, [view, load]);

  const act = async (record: ModerationRecord, action: ModerationAction) => {
    setProcessingKey(record.key);
    const result = await applyModerationAction(record.key, action);
    if (result.success) {
      const skipped = result.data?.restoreReport?.skippedEdges?.length ?? 0;
      toast.success(skipped && action === 'restore'
        ? `${ACTION_DONE[action]} (${skipped} lien${skipped > 1 ? 's' : ''} non recréé${skipped > 1 ? 's' : ''})`
        : ACTION_DONE[action]);
      await load(view);
    } else {
      toast.error(result.error || 'Action impossible');
    }
    setProcessingKey(null);
  };

  const openContent = (record: ModerationRecord) => {
    const [collection, key] = record.contentId.split('/');
    navigate(`/content/${collection}/${key}`);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Contenus analysés par Mistral : les cas douteux sont signalés et restent en ligne en attendant votre décision,
        les cas graves sont retirés automatiquement. Tout retrait est archivé et peut être annulé.
      </p>

      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <Button
            key={v.value}
            size="sm"
            variant={view === v.value ? 'default' : 'outline'}
            onClick={() => setView(v.value)}
          >
            {v.label}
            {v.value !== 'history' && counts[v.value] > 0 && (
              <Badge variant={view === v.value ? 'secondary' : 'destructive'} className="ml-1">
                {counts[v.value]}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : records.length === 0 ? (
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertDescription>{VIEWS.find((v) => v.value === view)?.empty}</AlertDescription>
        </Alert>
      ) : (
        records.map((record) => {
          const busy = processingKey === record.key;
          const status = STATUS[record.status];
          return (
            <Card key={record.key} className="border-l-4" style={{ borderLeftColor: status.accent }}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{TYPE_LABEL[record.contentType]}</Badge>
                  <Badge variant="outline" className={status.className}>{status.label}</Badge>
                  <span className="text-sm text-gray-500">
                    {decidedByLabel(record.decidedBy)} · {formatDate(record.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Par {record.authors.map((a) => a.name).join(', ') || 'auteur inconnu'}
                </p>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="rounded-md bg-gray-50 p-3">
                  {record.title && <p className="font-semibold text-gray-900 mb-1">{record.title}</p>}
                  <p className="text-gray-800 whitespace-pre-line" style={{ overflowWrap: 'anywhere' }}>
                    {record.text || <span className="italic text-gray-400">Contenu introuvable</span>}
                  </p>
                </div>

                {/* Motifs */}
                {record.reasons.length > 0 && (
                  <div className="space-y-2">
                    {record.reasons.map((reason) => (
                      <div key={reason.category} className="flex items-center gap-3 text-sm">
                        <span className="w-52 shrink-0 text-gray-700">{reason.label}</span>
                        {typeof reason.score === 'number' && (
                          <>
                            <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden" style={{ maxWidth: '12rem' }}>
                              <div
                                className="h-full"
                                style={{
                                  width: `${Math.round(reason.score * 100)}%`,
                                  backgroundColor: reason.score >= 0.8 ? '#ef4444' : '#f59e0b',
                                }}
                              />
                            </div>
                            <span className="w-12 text-right text-gray-600">{Math.round(reason.score * 100)}%</span>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {record.reviewedAt && (
                  <p className="text-sm text-gray-500">
                    Décision admin le {formatDate(record.reviewedAt)}{record.reviewNote ? ` : « ${record.reviewNote} »` : ''}
                  </p>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  {record.status === 'flagged' && (
                    <>
                      <Button variant="destructive" disabled={busy} onClick={() => act(record, 'remove')}>
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        Bannir
                      </Button>
                      <Button variant="outline" disabled={busy} onClick={() => act(record, 'dismiss')}>
                        <CheckCircle className="w-4 h-4" />
                        Garder en ligne
                      </Button>
                    </>
                  )}
                  {(record.status === 'removed' || record.status === 'confirmed') && (
                    <Button variant="outline" disabled={busy} onClick={() => act(record, 'restore')}>
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      Restaurer
                    </Button>
                  )}
                  {record.status === 'removed' && (
                    <Button variant="destructive" disabled={busy} onClick={() => act(record, 'confirm')}>
                      <Ban className="w-4 h-4" />
                      Confirmer le retrait
                    </Button>
                  )}
                  {record.online && (
                    <Button variant="ghost" onClick={() => openContent(record)}>
                      <ExternalLink className="w-4 h-4" />
                      Voir sur le site
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
