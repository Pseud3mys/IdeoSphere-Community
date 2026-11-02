// src/components/AdminModerateDialog.tsx
// Bouton « Modérer » des admins, à la place de « Signaler » (inutile à un admin). Deux choix :
// - Évaluer avec Mistral : les scores s'affichent, rien n'est retiré, l'admin décide ensuite.
//   L'évaluation est gardée en base : rouvrir la fenêtre la réaffiche sans rappeler Mistral ;
// - Bannir : le contenu (idée, post ou commentaire) est retiré du site et archivé ; il reste
//   restaurable dans Administration > Modération auto.
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Ban, Loader2, RefreshCw, ScanSearch, Shield, LucideIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import {
  banContent, evaluateContent, fetchBanReasons, fetchLastEvaluation, ContentEvaluation, ModerationReason,
} from '../api/adminService';
import { hasAdminRole } from '../api/authService';
import { keycloak } from '../api/keycloak';

export type ModerateTargetKind = 'idea' | 'post' | 'comment';

const KIND_LABEL: Record<ModerateTargetKind, string> = {
  idea: 'ce projet',
  post: 'ce post',
  comment: 'ce commentaire',
};

// Ce qu'aurait fait la modération automatique avec ces scores
const VERDICT: Record<ContentEvaluation['action'], { text: string; className: string }> = {
  remove: { text: 'Serait retiré automatiquement', className: 'bg-red-50 border-red-200 text-red-700' },
  flag: { text: 'Serait signalé aux admins, sans être retiré', className: 'bg-amber-50 border-amber-200 text-amber-700' },
  none: { text: 'Rien à signaler pour Mistral', className: 'bg-gray-50 text-gray-700' },
};

type Step = 'loading' | 'choose' | 'evaluating' | 'result' | 'ban';

// Scores au dixième de pourcent ; en dessous de 0,1 %, la catégorie n'est pas affichée
const MIN_SHOWN_SCORE = 0.001;
const percent = (score: number) =>
  `${(score * 100).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;

const formatEvaluatedAt = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// hasAdminRole() relit le jeton et écrit dans la console : on le calcule une fois par jeton
let adminCache: { token: string | undefined; value: boolean } | null = null;
export function isAdminUser(): boolean {
  if (!adminCache || adminCache.token !== keycloak.token) {
    adminCache = { token: keycloak.token, value: keycloak.authenticated ? hasAdminRole() : false };
  }
  return adminCache.value;
}

interface AdminModerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;          // "posts/123" ou "ideas/45" (pour un commentaire : le post parent)
  commentId?: string;
  kind: ModerateTargetKind;
  onBanned?: () => void;      // par défaut : la page est rechargée
}

export function AdminModerateDialog({ open, onOpenChange, contentId, commentId, kind, onBanned }: AdminModerateDialogProps) {
  const [step, setStep] = useState<Step>('loading');
  const [evaluation, setEvaluation] = useState<ContentEvaluation | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  const [reasons, setReasons] = useState<ModerationReason[]>([]);
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Une réponse de Mistral arrivée après fermeture (ou après une nouvelle demande) est ignorée
  const request = useRef(0);

  // À l'ouverture : si le contenu a déjà été évalué (et n'a pas changé depuis), on réaffiche le récap
  useEffect(() => {
    if (!open) return;
    const current = ++request.current;
    setStep('loading');
    setEvaluation(null);
    setEvaluationError(null);
    setCategory('');
    setNote('');
    fetchBanReasons().then(setReasons);
    fetchLastEvaluation(contentId, commentId).then((saved) => {
      if (current !== request.current) return;
      setEvaluation(saved);
      setStep(saved ? 'result' : 'choose');
    });
  }, [open, contentId, commentId]);

  useEffect(() => {
    if (step === 'ban' && !category && reasons.length > 0) setCategory(reasons[0].category);
  }, [step, category, reasons]);

  const evaluate = async () => {
    const current = ++request.current;
    setStep('evaluating');
    setEvaluation(null);
    setEvaluationError(null);
    const result = await evaluateContent(contentId, commentId);
    if (current !== request.current) return;
    if (result.success && result.data) {
      setEvaluation(result.data);
    } else {
      setEvaluationError(result.error || "L'évaluation a échoué.");
    }
    setStep('result');
  };

  const goToBan = () => {
    // Motif pré-rempli : la catégorie la plus grave selon Mistral, si elle fait partie des motifs proposés
    const suggested = evaluation?.reasons[0]?.category;
    if (suggested && reasons.some((r) => r.category === suggested)) setCategory(suggested);
    setStep('ban');
  };

  const submit = async () => {
    setIsSubmitting(true);
    const result = await banContent(contentId, category, { commentId, note });
    setIsSubmitting(false);
    if (!result.success) {
      toast.error(result.error || 'Impossible de bannir ce contenu');
      return;
    }
    toast.success('Contenu banni : retiré du site et archivé (restaurable dans Administration > Modération auto)');
    onOpenChange(false);
    if (onBanned) onBanned();
    else setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* stopPropagation : le dialogue est rendu dans un portail, mais ses clics remontent l'arbre React */}
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'ban' ? <Ban className="w-5 h-5 text-red-600" /> : <Shield className="w-5 h-5 text-red-600" />}
            {step === 'ban' ? 'Bannir' : 'Modérer'} {KIND_LABEL[kind]}
          </DialogTitle>
          <DialogDescription>
            {step === 'ban'
              ? 'Le contenu est retiré du site et archivé. Vous pourrez le restaurer depuis Administration > Modération auto.'
              : 'Faites évaluer le contenu par Mistral avant de décider, ou bannissez-le directement.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'choose' && (
          <div className="space-y-2">
            <ChoiceButton icon={ScanSearch} title="Évaluer avec Mistral" text="Voir ses scores. Rien n'est retiré." onClick={evaluate} />
            <ChoiceButton icon={Ban} title="Bannir" text="Retirer le contenu du site (restaurable)." onClick={() => setStep('ban')} danger />
          </div>
        )}

        {(step === 'loading' || step === 'evaluating') && (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-gray-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            {step === 'evaluating' ? 'Mistral analyse le contenu…' : 'Chargement…'}
          </div>
        )}

        {step === 'result' && evaluationError && (
          <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{evaluationError}</p>
        )}
        {step === 'result' && evaluation && <EvaluationResult evaluation={evaluation} />}

        {step === 'ban' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ban-reason">Motif (montré à l'auteur)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="ban-reason">
                  <SelectValue placeholder="Choisir un motif" />
                </SelectTrigger>
                <SelectContent>
                  {reasons.map((reason) => (
                    <SelectItem key={reason.category} value={reason.category}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ban-note">Note interne (facultatif)</Label>
              <Textarea
                id="ban-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Pourquoi ce bannissement ? Visible seulement par les admins."
                rows={3}
              />
            </div>
            {evaluation && <p className="text-xs text-gray-500">Les scores de Mistral seront joints au dossier.</p>}
          </div>
        )}

        <DialogFooter>
          {(step === 'loading' || step === 'choose' || step === 'evaluating') && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          )}
          {step === 'result' && evaluationError && (
            <>
              <Button variant="outline" onClick={() => setStep('choose')}>Retour</Button>
              <Button onClick={evaluate}>Réessayer</Button>
            </>
          )}
          {step === 'result' && evaluation && (
            <>
              <Button variant="ghost" onClick={evaluate} title="Nouvel appel à Mistral">
                <RefreshCw className="w-4 h-4" />
                Réévaluer
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Garder en ligne</Button>
              <Button variant="destructive" onClick={goToBan}>
                <Ban className="w-4 h-4" />
                Bannir…
              </Button>
            </>
          )}
          {step === 'ban' && (
            <>
              <Button variant="outline" onClick={() => setStep(evaluation ? 'result' : 'choose')} disabled={isSubmitting}>
                Retour
              </Button>
              <Button variant="destructive" onClick={submit} disabled={isSubmitting || !category}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                Bannir
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ChoiceButton({ icon: Icon, title, text, onClick, danger = false }: {
  icon: LucideIcon; title: string; text: string; onClick: () => void; danger?: boolean;
}) {
  return (
    <Button
      variant="outline"
      className="w-full h-auto py-3 text-left"
      style={{ justifyContent: 'flex-start', whiteSpace: 'normal' }}
      onClick={onClick}
    >
      <Icon className={`w-5 h-5 shrink-0 ${danger ? 'text-red-600' : 'text-gray-700'}`} />
      <span className="flex flex-col items-start gap-1">
        <span className={`font-medium ${danger ? 'text-red-700' : 'text-gray-900'}`}>{title}</span>
        <span className="text-xs text-gray-500">{text}</span>
      </span>
    </Button>
  );
}

function EvaluationResult({ evaluation }: { evaluation: ContentEvaluation }) {
  const { thresholds } = evaluation;
  const verdict = VERDICT[evaluation.action];
  // Les catégories à 0 ou sous 0,1 % ne sont pas affichées
  const rows = evaluation.scores.filter((s) => s.score >= MIN_SHOWN_SCORE);
  const color = (score: number) =>
    score >= thresholds.remove ? '#ef4444' : score >= thresholds.flag ? '#f59e0b' : '#9ca3af';

  return (
    <div className="space-y-3">
      <div className={`rounded-md border p-3 text-sm font-medium ${verdict.className}`}>{verdict.text}</div>
      {evaluation.evaluatedAt && (
        <p className="text-xs text-gray-500">Évalué par Mistral le {formatEvaluatedAt(evaluation.evaluatedAt)}</p>
      )}
      <div className="space-y-2">
        {rows.map((s) => (
          <div key={s.category} className="flex items-center gap-3 text-sm">
            <span className="shrink-0 text-gray-700" style={{ width: '9rem' }}>{s.label}</span>
            <div className="h-2 flex-1 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full" style={{ width: `${s.score * 100}%`, backgroundColor: color(s.score) }} />
            </div>
            <span className="text-right text-gray-600" style={{ width: '3.5rem' }}>{percent(s.score)}</span>
          </div>
        ))}
        {rows.length === 0 && <p className="text-sm text-gray-500">Aucune catégorie au-dessus de 0,1 %.</p>}
      </div>
    </div>
  );
}

interface AdminModerateButtonProps {
  contentId: string;
  commentId?: string;
  kind: ModerateTargetKind;
  className?: string;
  showLabel?: boolean;
}

/** Bouton « Modérer » visible uniquement par les admins du tenant. */
export function AdminModerateButton({ contentId, commentId, kind, className = '', showLabel = true }: AdminModerateButtonProps) {
  const [open, setOpen] = useState(false);
  if (!isAdminUser()) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={`flex items-center gap-1 text-red-600 hover:bg-red-50 ${className}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title="Modérer (admin)"
      >
        <Shield className="w-3.5 h-3.5" />
        {showLabel && <span className="text-xs">Modérer</span>}
      </Button>
      <AdminModerateDialog open={open} onOpenChange={setOpen} contentId={contentId} commentId={commentId} kind={kind} />
    </>
  );
}
