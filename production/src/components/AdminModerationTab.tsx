// src/components/AdminModerationTab.tsx
// Onglet « Modération » de la page Admin. Deux vues :
// - À traiter : contenus signalés (par Mistral ou par des utilisateurs) et retraits automatiques
//   de Mistral pas encore vérifiés -> Bannir ou Ignorer ;
// - Historique : tout ce qui est réglé -> Restaurer ce qui a été retiré.
// Dans chaque vue, un filtre garde ce qu'a soulevé Mistral ou un humain (utilisateurs, admin).
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
  ModerationCounts,
  ModerationOrigin,
  ModerationRecord,
  ModerationThresholds,
  ModerationView,
} from '../api/adminService';

const VIEWS: { value: ModerationView; label: string; empty: string }[] = [
  { value: 'pending', label: 'À traiter', empty: 'Rien à traiter pour le moment.' },
  { value: 'history', label: 'Historique', empty: 'Aucune décision pour le moment.' },
];

const ORIGINS: { value: ModerationOrigin | null; label: string }[] = [
  { value: null, label: 'Tous' },
  { value: 'mistral', label: 'Mistral' },
  { value: 'human', label: 'Humain' },
];

const EMPTY_COUNTS: ModerationCounts = {
  pending: { all: 0, mistral: 0, human: 0 },
  history: { all: 0, mistral: 0, human: 0 },
};

// Le CSS Tailwind est pré-compilé (src/index.css) : seules les classes déjà présentes fonctionnent,
// les autres couleurs passent par `style`.
const STATUS_STYLE = {
  flagged: { className: 'bg-amber-50 text-amber-800 border-amber-200', accent: '#f59e0b' },
  removed: { className: 'bg-red-100 text-red-800 border-red-200', accent: '#ef4444' },
  confirmed: { className: 'bg-red-50 text-red-700 border-red-200', accent: '#fca5a5' },
  restored: { className: 'bg-green-100 text-green-800 border-green-200', accent: '#86efac' },
  dismissed: { className: 'bg-gray-100 text-gray-700 border-gray-200', accent: '#d1d5db' },
};

const TYPE_LABEL: Record<ModerationRecord['contentType'], string> = {
  ideas: 'Projet',
  posts: 'Post',
  comment: 'Commentaire',
};

const ACTION_DONE: Record<ModerationAction, string> = {
  remove: 'Contenu banni : retiré du site et archivé',
  dismiss: 'Signalement ignoré : le contenu reste en ligne',
  confirm: 'Retrait confirmé',
  restore: 'Contenu remis en ligne',
};

// Retrait automatique de Mistral, pas encore vérifié par un humain
const isAutoRemoval = (record: ModerationRecord) => record.status === 'removed' && record.decidedBy === 'mistral';

function statusLabel(record: ModerationRecord) {
  switch (record.status) {
    case 'flagged': return 'Signalé, toujours en ligne';
    case 'removed': return isAutoRemoval(record) ? 'Retiré automatiquement, à vérifier' : 'Retiré par un admin';
    case 'confirmed': return 'Retrait confirmé';
    case 'restored': return 'Remis en ligne';
    case 'dismissed': return 'Ignoré, toujours en ligne';
  }
}

// Qui a soulevé le cas
function originLabels(record: ModerationRecord) {
  return record.raisedBy.map((origin) => {
    if (origin === 'mistral') return 'Mistral';
    if (origin === 'admin') return 'Admin';
    const n = record.reportCount;
    return n > 0 ? `${n} signalement${n > 1 ? 's' : ''} d'utilisateur${n > 1 ? 's' : ''}` : 'Signalé par des utilisateurs';
  });
}

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

const percent = (score: number) =>
  `${(score * 100).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

export function AdminModerationTab() {
  const navigate = useNavigate();
  const [view, setView] = useState<ModerationView>('pending');
  const [origin, setOrigin] = useState<ModerationOrigin | null>(null);
  const [records, setRecords] = useState<ModerationRecord[]>([]);
  const [counts, setCounts] = useState<ModerationCounts>(EMPTY_COUNTS);
  const [thresholds, setThresholds] = useState<ModerationThresholds | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const load = useCallback(async (v: ModerationView, o: ModerationOrigin | null) => {
    setIsLoading(true);
    const result = await fetchModerationRecords(v, o);
    if (!result) {
      toast.error('Impossible de charger les dossiers de modération');
    } else {
      setRecords(result.data);
      setCounts(result.counts);
      setThresholds(result.thresholds ?? null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    load(view, origin);
  }, [view, origin, load]);

  const act = async (record: ModerationRecord, action: ModerationAction) => {
    setProcessingKey(record.key);
    const result = await applyModerationAction(record.key, action);
    if (result.success) {
      const skipped = result.data?.restoreReport?.skippedEdges?.length ?? 0;
      toast.success(skipped && action === 'restore'
        ? `${ACTION_DONE[action]} (${skipped} lien${skipped > 1 ? 's' : ''} non recréé${skipped > 1 ? 's' : ''})`
        : ACTION_DONE[action]);
      await load(view, origin);
    } else {
      toast.error(result.error || 'Action impossible');
    }
    setProcessingKey(null);
  };

  const openContent = (record: ModerationRecord) => {
    const [collection, key] = record.contentId.split('/');
    navigate(`/content/${collection}/${key}`);
  };

  const barColor = (score: number) =>
    !thresholds ? '#f59e0b' : score >= thresholds.remove ? '#ef4444' : score >= thresholds.flag ? '#f59e0b' : '#9ca3af';

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        « À traiter » regroupe ce qui attend une décision : les contenus signalés par Mistral ou par des utilisateurs,
        et les retraits automatiques de Mistral à vérifier. Tout retrait est archivé et se restaure depuis l'historique.
      </p>

      {/* Vues */}
      <div className="flex flex-wrap gap-2">
        {VIEWS.map((v) => (
          <Button
            key={v.value}
            size="sm"
            variant={view === v.value ? 'default' : 'outline'}
            onClick={() => setView(v.value)}
          >
            {v.label}
            {v.value === 'pending' && counts.pending.all > 0 && (
              <Badge variant={view === v.value ? 'secondary' : 'destructive'} className="ml-1">
                {counts.pending.all}
              </Badge>
            )}
          </Button>
        ))}
      </div>

      {/* Qui a soulevé le cas */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-500">Soulevé par :</span>
        {ORIGINS.map((o) => (
          <Button
            key={o.label}
            size="sm"
            variant={origin === o.value ? 'secondary' : 'ghost'}
            onClick={() => setOrigin(o.value)}
          >
            {o.label} ({counts[view][o.value ?? 'all']})
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
          const style = STATUS_STYLE[record.status];
          return (
            <Card key={record.key} className="border-l-4" style={{ borderLeftColor: style.accent }}>
              <CardHeader className="pb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{TYPE_LABEL[record.contentType]}</Badge>
                  <Badge variant="outline" className={style.className}>{statusLabel(record)}</Badge>
                  {originLabels(record).map((label) => (
                    <Badge key={label} variant="secondary">{label}</Badge>
                  ))}
                  <span className="text-sm text-gray-500">{formatDate(record.createdAt)}</span>
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

                {/* Motifs (les signalements d'utilisateurs sont déjà dans le badge d'origine) */}
                {record.reasons.some((r) => r.category !== 'user_reports') && (
                  <div className="space-y-2">
                    {record.reasons.filter((r) => r.category !== 'user_reports').map((reason) => (
                      <div key={reason.category} className="flex items-center gap-3 text-sm">
                        <span className="w-52 shrink-0 text-gray-700">{reason.label}</span>
                        {typeof reason.score === 'number' && (
                          <>
                            <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden" style={{ maxWidth: '12rem' }}>
                              <div
                                className="h-full"
                                style={{ width: `${reason.score * 100}%`, backgroundColor: barColor(reason.score) }}
                              />
                            </div>
                            <span className="text-right text-gray-600" style={{ width: '3.5rem' }}>{percent(reason.score)}</span>
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

                {/* Actions : bannir ou ignorer dans « À traiter », restaurer dans l'historique */}
                <div className="flex flex-wrap gap-2">
                  {view === 'pending' && (
                    <>
                      <Button
                        variant="destructive"
                        disabled={busy}
                        onClick={() => act(record, isAutoRemoval(record) ? 'confirm' : 'remove')}
                      >
                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                        Bannir
                      </Button>
                      <Button
                        variant="outline"
                        disabled={busy}
                        onClick={() => act(record, isAutoRemoval(record) ? 'restore' : 'dismiss')}
                      >
                        <CheckCircle className="w-4 h-4" />
                        {isAutoRemoval(record) ? 'Ignorer et remettre en ligne' : 'Ignorer'}
                      </Button>
                    </>
                  )}
                  {view === 'history' && (record.status === 'removed' || record.status === 'confirmed') && (
                    <Button variant="outline" disabled={busy} onClick={() => act(record, 'restore')}>
                      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                      Restaurer
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
