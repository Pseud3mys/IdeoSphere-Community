// src/components/FieldContactForm.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { UserPlus, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface FieldContactFormProps {
  onSubmit: (contact: {
    name: string;
    email: string;
    neighborhood?: string;
  }) => Promise<boolean>;
}

export function FieldContactForm({ onSubmit }: FieldContactFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    neighborhood: ''
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
      const success = await onSubmit({
        name: formData.name.trim(),
        email: formData.email.trim(),
        neighborhood: formData.neighborhood.trim() || undefined
      });

      if (success) {
        setSuccessMessage('Contact ajouté avec succès !');
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          email: '',
          neighborhood: ''
        });
        // Effacer le message après 3 secondes
        setTimeout(() => setSuccessMessage(null), 3000);
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

            <div className="space-y-2">
              <Label htmlFor="neighborhood">Quartier</Label>
              <Input
                id="neighborhood"
                type="text"
                value={formData.neighborhood}
                onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                placeholder="Quartier de résidence"
              />
            </div>
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
      </CardContent>
    </Card>
  );
}
