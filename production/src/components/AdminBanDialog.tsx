// src/components/AdminBanDialog.tsx
// Bannissement manuel par un admin : le contenu (idée, post ou commentaire) est retiré du site
// et archivé ; il reste restaurable dans Administration > Modération auto.
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Ban, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { banContent, fetchBanReasons, ModerationReason } from '../api/adminService';
import { hasAdminRole } from '../api/authService';
import { keycloak } from '../api/keycloak';

export type BanTargetKind = 'idea' | 'post' | 'comment';

const KIND_LABEL: Record<BanTargetKind, string> = {
  idea: 'ce projet',
  post: 'ce post',
  comment: 'ce commentaire',
};

// hasAdminRole() relit le jeton et écrit dans la console : on le calcule une fois par jeton
let adminCache: { token: string | undefined; value: boolean } | null = null;
export function isAdminUser(): boolean {
  if (!adminCache || adminCache.token !== keycloak.token) {
    adminCache = { token: keycloak.token, value: keycloak.authenticated ? hasAdminRole() : false };
  }
  return adminCache.value;
}

interface AdminBanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentId: string;          // "posts/123" ou "ideas/45" (pour un commentaire : le post parent)
  commentId?: string;
  kind: BanTargetKind;
  onBanned?: () => void;      // par défaut : la page est rechargée
}

export function AdminBanDialog({ open, onOpenChange, contentId, commentId, kind, onBanned }: AdminBanDialogProps) {
  const [reasons, setReasons] = useState<ModerationReason[]>([]);
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    fetchBanReasons().then((list) => {
      setReasons(list);
      setCategory((current) => current || list[0]?.category || '');
    });
  }, [open]);

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
    setNote('');
    if (onBanned) onBanned();
    else setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* stopPropagation : le dialogue est rendu dans un portail, mais ses clics remontent l'arbre React */}
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-600" />
            Bannir {KIND_LABEL[kind]}
          </DialogTitle>
          <DialogDescription>
            Le contenu est retiré du site et archivé. Vous pourrez le restaurer depuis
            Administration &gt; Modération auto.
          </DialogDescription>
        </DialogHeader>

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={submit} disabled={isSubmitting || !category}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
            Bannir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AdminBanButtonProps {
  contentId: string;
  commentId?: string;
  kind: BanTargetKind;
  className?: string;
  showLabel?: boolean;
}

/** Bouton « Bannir » visible uniquement par les admins du tenant. */
export function AdminBanButton({ contentId, commentId, kind, className = '', showLabel = true }: AdminBanButtonProps) {
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
        title="Bannir (admin)"
      >
        <Ban className="w-3.5 h-3.5" />
        {showLabel && <span className="text-xs">Bannir</span>}
      </Button>
      <AdminBanDialog open={open} onOpenChange={setOpen} contentId={contentId} commentId={commentId} kind={kind} />
    </>
  );
}
