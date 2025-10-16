import { useState } from 'react';
import { User } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, UserPlus, MapPin, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SignupPageProps {
  onBack: () => void;
  onSignup: (userData: {
    name: string;
    email: string;
    location: string;
    preciseAddress?: string;
    birthYear: number;
  }) => void;
  prefilledData?: {
    name?: string;
    email?: string;
  };
}

export function SignupPage({ onBack, onSignup, prefilledData }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: prefilledData?.name || '',
    email: prefilledData?.email || '',
    preciseAddress: '',
    birthYear: '',
    bio: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom est requis');
      return;
    }
    
    if (!formData.email.trim()) {
      toast.error('L\'email est requis');
      return;
    }
    
    if (!formData.birthYear) {
      toast.error('L\'année de naissance est requise');
      return;
    }
    
    const birthYear = parseInt(formData.birthYear);
    const currentYear = new Date().getFullYear();
    
    if (birthYear < 1900 || birthYear > currentYear - 16) {
      toast.error('Année de naissance invalide (vous devez avoir au moins 16 ans)');
      return;
    }

    setIsLoading(true);
    
    try {
      await onSignup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        location: 'Le Blanc',
        preciseAddress: formData.preciseAddress.trim() || undefined,
        birthYear: birthYear
      });
      
      toast.success('Compte créé avec succès ! Bienvenue sur IdeoSphere ! 🎉');
    } catch (error) {
      toast.error('Erreur lors de la création du compte');
      console.error('Signup error:', error);
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
              <UserPlus className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Rejoignez IdeoSphere
            </h1>
            <p className="text-gray-600">
              Créez votre compte pour participer pleinement à la vie citoyenne de Le Blanc
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Marie Dupont"
                    required
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="marie.dupont@email.com"
                    required
                    className="w-full"
                  />
                </div>
              </div>

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
                  onChange={(e) => setFormData(prev => ({ ...prev, birthYear: e.target.value }))}
                  placeholder="Ex: 1985"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Cette information nous aide à mieux comprendre notre communauté
                </p>
              </div>

              {/* Localisation */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <Label htmlFor="preciseAddress">Adresse (optionnel)</Label>
                </div>
                <Input
                  id="preciseAddress"
                  type="text"
                  value={formData.preciseAddress}
                  onChange={(e) => setFormData(prev => ({ ...prev, preciseAddress: e.target.value }))}
                  placeholder="123 rue de la République"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Seule la localisation approximative nous intéresse pour vous proposer des projets près de chez vous
                </p>
              </div>

              {/* Bio optionnelle */}
              <div className="space-y-2">
                <Label htmlFor="bio">Présentez-vous brièvement (optionnel)</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Ex: Passionné(e) d'urbanisme et d'écologie, je souhaite contribuer à l'amélioration de notre ville..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Cela aide les autres citoyens à mieux comprendre vos motivations
                </p>
              </div>

              {/* Informations importantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Pourquoi ces informations ?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• L'âge nous aide à comprendre les besoins de chaque génération</li>
                  <li>• L'adresse nous permet de vous proposer des projets près de chez vous</li>
                  <li>• Ces données restent privées et ne sont jamais partagées</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-dark"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Création...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>Créer mon compte</span>
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
