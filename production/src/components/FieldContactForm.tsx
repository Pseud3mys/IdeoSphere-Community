// src/components/FieldContactForm.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { UserPlus, Loader2, CheckCircle, AlertCircle, Share } from 'lucide-react';
import { SharePlatformDialog } from './SharePlatformDialog';

interface FieldContactFormProps {
  onSubmit: (contact: {
    name: string;
    email: string;
    firstPost?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function FieldContactForm({ onSubmit }: FieldContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    firstPost: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.email.trim()) {
      setErrorMessage('L\'email est obligatoire');
      return;
    }

    if (!formData.email.includes('@')) {
      setErrorMessage('Veuillez entrer un email valide');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        firstPost: formData.firstPost.trim() || undefined
      });

      if (result.success) {
        setSuccessMessage('Contact ajouté avec succès !');
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          email: '',
          firstPost: ''
        });
        // Effacer le message après 3 secondes
        setTimeout(() => setSuccessMessage(null), 3000);
      } else if (result.error === 'EMAIL_EXISTS') {
        setErrorMessage('Cet email est déjà associé à un compte existant');
      } else {
        setErrorMessage('Erreur lors de l\'ajout du contact');
      }
    } catch (error) {
      setErrorMessage('Erreur lors de l\'ajout du contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Ajouter un contact terrain
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Messages de succès/erreur */}
          {successMessage && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {/* Champs du formulaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nom de la personne"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemple.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstPost">1er post</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Ce message sera publié automatiquement au nom de cette personne lors de son premier accès à la plateforme.
            </p>
            <Textarea
              id="firstPost"
              value={formData.firstPost}
              onChange={(e) => setFormData({ ...formData, firstPost: e.target.value })}
              placeholder="Entrez le premier message à publier..."
              rows={4}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full md:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ajout en cours...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Ajouter le contact
              </>
            )}
          </Button>
        </form>

        {/* Section Partager la plateforme */}
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Share className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-sm">Partager la plateforme avec QR code</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Générez un QR code pour partager facilement la plateforme. 
                Idéal pour les actions de terrains ou à imprimer sur un tract.
              </p>
            </div>
          </div>
          
          <SharePlatformDialog>
            <Button 
              variant="outline" 
              size="sm"
              type="button"
            >
              <Share className="w-4 h-4 mr-2" />
              Partager le QR code
            </Button>
          </SharePlatformDialog>
        </div>
      </CardContent>
    </Card>
  );
}
