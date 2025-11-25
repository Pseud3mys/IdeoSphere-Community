import { ConfirmationDialog } from '../ConfirmationDialog';
import { AlertTriangle } from 'lucide-react';

interface PublishConfirmationDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Dialogue de confirmation pour la publication d'une idée sans liens
 * Utilise le composant générique ConfirmationDialog
 */
export function PublishConfirmationDialog({
  isOpen,
  onConfirm,
  onCancel
}: PublishConfirmationDialogProps) {
  const description = (
    <div className="text-muted-foreground text-sm">
      <div className="space-y-3">
        <p>
          Vous êtes sur le point de publier une idée qui n'est liée à aucun contenu existant 
          (posts, idées ou discussions).
        </p>
        <p>
          <strong>💡 Les liens enrichissent IdeoSphere :</strong>
        </p>
        <ul className="text-sm space-y-1 ml-4">
          <li>• Ils montrent comment votre idée s'inspire d'autres contributions</li>
          <li>• Ils créent des connexions dans l'intelligence collective</li>
          <li>• Ils aident la communauté à mieux comprendre et évaluer votre proposition</li>
          <li>• Ils permettent aux meilleures idées d'émerger naturellement</li>
        </ul>
        <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
          ✨ <strong>Cependant, si votre idée est vraiment nouvelle et originale, n'hésitez pas à la publier !</strong> 
          Elle pourrait devenir la source d'inspiration pour de futures contributions.
        </p>
      </div>
    </div>
  );

  return (
    <ConfirmationDialog
      isOpen={isOpen}
      onConfirm={onConfirm}
      onCancel={onCancel}
      title="Publier sans liens ?"
      description={description}
      confirmText="Publier quand même"
      cancelText="Retour pour ajouter des liens"
      icon={AlertTriangle}
      iconClassName="text-orange-500"
      confirmButtonClassName="bg-orange-600 hover:bg-orange-700"
    />
  );
}