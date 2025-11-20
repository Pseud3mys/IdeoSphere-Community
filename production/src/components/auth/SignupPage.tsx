import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, UserPlus, MapPin, Calendar, AlertCircle, CheckCircle2, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { clientConfig } from '../../config/clientConfig';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';

interface SignupPageProps {
  onBack: () => void;
  onSignup: (userData: {
    name: string;
    email: string;
    password: string;
    address?: string;
    bio?: string;
    birthYear: number;
  }) => Promise<boolean>;
  onSocialLogin?: (provider: string) => Promise<boolean>;
  onRegisterSSO?: () => void;
  prefilledData?: {
    name?: string;
    email?: string;
  };
}

/**
 * Page de finalisation de profil
 * L'utilisateur arrive ici après s'être authentifié via SSO
 * Il doit compléter son profil avec les informations supplémentaires
 */
export function SignupPage({ onBack, onSignup, prefilledData }: SignupPageProps) {
  const { getCurrentUser } = useEntityStoreSimple();
  const currentUser = getCurrentUser();
  
  const [formData, setFormData] = useState({
    address: currentUser?.address || '',
    birthYear: currentUser?.birthYear?.toString() || '',
    bio: currentUser?.bio || ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.birthYear) {
      setError('L\'année de naissance est requise');
      return false;
    }
    const birthYear = parseInt(formData.birthYear);
    const currentYear = new Date().getFullYear();
    if (birthYear < 1900 || birthYear > currentYear - 16) {
      setError('Année de naissance invalide (vous devez avoir au moins 16 ans)');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Si l'utilisateur est déjà connecté via SSO, on met à jour son profil
      // Sinon, on crée un nouveau compte (fallback)
      const userData = {
        name: currentUser?.name || prefilledData?.name || 'Utilisateur',
        email: currentUser?.email || prefilledData?.email || '',
        password: '', // Pas de mot de passe car SSO
        address: formData.address.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        birthYear: parseInt(formData.birthYear)
      };
      
      const success = await onSignup(userData);
      
      if (success) {
        toast.success('Profil complété avec succès ! Bienvenue sur IdeoSphere ! 🎉');
        // Reset form
        setFormData({
          address: '',
          birthYear: '',
          bio: ''
        });
      } else {
        setError('Une erreur est survenue lors de la mise à jour du profil');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
      console.error('Profile completion error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ideosphere-blue-light to-white p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 flex items-center space-x-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour</span>
          </Button>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-white mb-4">
              <UserIcon className="w-8 h-8" />
            </div>
            <h1 className="text-2xl mb-2">
              Finalisez votre profil
            </h1>
            <p className="text-muted-foreground">
              Bienvenue {currentUser?.name || 'sur IdeoSphere'} ! Complétez votre profil pour une meilleure expérience.
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle>Informations complémentaires</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informations utilisateur SSO */}
            {currentUser && (
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <div className="flex items-center mb-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mr-2" />
                  <span className="text-sm text-primary">Compte authentifié</span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Nom :</strong> {currentUser.name}</p>
                  <p><strong>Email :</strong> {currentUser.email}</p>
                </div>
              </div>
            )}

            {/* Avantages */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-blue-900 mb-2">Pourquoi ces informations ?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• L'âge nous aide à comprendre les besoins de chaque génération</li>
                <li>• L'adresse nous permet de vous proposer des projets près de chez vous</li>
                <li>• Votre bio permet aux autres membres de mieux vous connaître</li>
                <li>• Ces données restent privées et ne sont jamais partagées</li>
              </ul>
            </div>

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Année de naissance */}
              <div className="space-y-2">
                <Label htmlFor="birthYear" className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Année de naissance *</span>
                </Label>
                <Input
                  id="birthYear"
                  type="number"
                  min="1900"
                  max={currentYear - 16}
                  value={formData.birthYear}
                  onChange={(e) => handleInputChange('birthYear', e.target.value)}
                  placeholder={clientConfig.examples.profile.birthYearPlaceholder}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Cette information nous aide à mieux comprendre notre communauté
                </p>
              </div>

              {/* Adresse */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <Label htmlFor="address">Adresse (optionnel)</Label>
                </div>
                <Input
                  id="address"
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 rue de la République, Le Blanc"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Nous permet de vous proposer des projets près de chez vous
                </p>
              </div>

              {/* Bio optionnelle */}
              <div className="space-y-2">
                <Label htmlFor="bio">Présentez-vous brièvement (optionnel)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  placeholder={clientConfig.examples.profile.bioPlaceholder}
                  rows={3}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {clientConfig.systemMessages.signupPage.bioHelperText}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Plus tard
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enregistrement...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Finaliser mon profil</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}