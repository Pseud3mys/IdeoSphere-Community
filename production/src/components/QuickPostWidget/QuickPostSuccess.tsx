import { Button } from '../ui/button';
import { CheckCircle2, PlusCircle } from 'lucide-react';

interface QuickPostSuccessProps {
  onCreateAnother: () => void;
}

export function QuickPostSuccess({ onCreateAnother }: QuickPostSuccessProps) {
  return (
    <div>
      <div className="pt-6 pb-6">
        <div className="text-center space-y-6">
          {/* Icône de succès */}
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Message de succès */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">
              Merci pour votre contribution !
            </h3>
            <p className="text-gray-600">
              Votre message a été publié avec succès.
            </p>
          </div>

          {/* Bouton pour créer un autre post */}
          <Button
            onClick={onCreateAnother}
            className="w-full"
            size="lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Publier une autre contribution
          </Button>
        </div>
      </div>
    </div>
  );
}
