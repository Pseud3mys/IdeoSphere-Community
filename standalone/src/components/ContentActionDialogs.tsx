import { ConfirmationDialog } from './ConfirmationDialog';
import { Flag, EyeOff } from 'lucide-react';

interface ContentActionDialogsProps {
  isIgnoreDialogOpen: boolean;
  isReportDialogOpen: boolean;
  contentType: 'post' | 'projet';
  contentId: string;
  onIgnoreCancel: () => void;
  onIgnoreConfirm: () => void;
  onReportCancel: () => void;
  onReportConfirm: () => void;
}

/**
 * Composant qui regroupe les dialogues de confirmation pour les actions sur le contenu
 * Utilise le composant générique ConfirmationDialog
 */
export function ContentActionDialogs({
  isIgnoreDialogOpen,
  isReportDialogOpen,
  contentType,
  contentId,
  onIgnoreCancel,
  onIgnoreConfirm,
  onReportCancel,
  onReportConfirm
}: ContentActionDialogsProps) {
  return (
    <>
      {/* Dialogue d'ignorer */}
      <ConfirmationDialog
        isOpen={isIgnoreDialogOpen}
        onConfirm={onIgnoreConfirm}
        onCancel={onIgnoreCancel}
        title={`Masquer ce ${contentType}`}
        description={`Vous ne verrez plus ce ${contentType} dans votre fil d'idées. Cette action peut être annulée depuis vos paramètres.`}
        confirmText="Masquer"
        cancelText="Annuler"
        icon={EyeOff}
        iconClassName="text-muted-foreground"
      />

      {/* Dialogue de signaler */}
      <ConfirmationDialog
        isOpen={isReportDialogOpen}
        onConfirm={onReportConfirm}
        onCancel={onReportCancel}
        title={`Signaler ce ${contentType}`}
        description="Êtes-vous sûr de vouloir signaler ce contenu ? Votre signalement sera transmis aux modérateurs qui examineront le contenu selon nos conditions d'utilisation."
        confirmText="Signaler"
        cancelText="Annuler"
        icon={Flag}
        iconClassName="text-destructive"
        confirmButtonClassName="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      />
    </>
  );
}
