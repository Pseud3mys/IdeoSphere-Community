import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  confirmButtonClassName?: string;
}

/**
 * Composant générique de dialogue de confirmation
 * Remplace les dialogues AlertDialog dupliqués dans ContentActionDialogs, 
 * PublishConfirmationDialog, et ailleurs
 */
export function ConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  icon: Icon,
  iconClassName = '',
  confirmButtonClassName = ''
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {Icon && <Icon className={`w-5 h-5 ${iconClassName}`} />}
            <span>{title}</span>
          </AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={confirmButtonClassName}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
