import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, UserPlus, MapPin, Calendar, Lock, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { clientConfig, getSignupDescription } from '../../config/clientConfig';

// SVG Icons pour les connexions sociales
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

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

export function SignupPage({ onBack, onSignup, onSocialLogin, onRegisterSSO, prefilledData }: SignupPageProps) {
  const [formData, setFormData] = useState({
    name: prefilledData?.name || '',
    email: prefilledData?.email || '',
    address: '',
    birthYear: '',
    bio: ''
  });

  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSocialLogin = async (provider: string) => {
    if (!onSocialLogin) return;
    
    setIsLoading(true);
    setError('');
    try {
      const success = await onSocialLogin(provider);
      if (!success) {
        setError(`Erreur de connexion avec ${provider}`);
      }
    } catch (error) {
      console.error('Social login error:', error);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour générer un mot de passe aléatoire sécurisé
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Veuillez entrer votre nom');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Veuillez entrer votre email');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Veuillez entrer un email valide');
      return false;
    }
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
    if (!acceptTerms) {
      setError('Veuillez accepter les conditions d\'utilisation');
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
      // Générer un mot de passe sécurisé automatiquement
      const autoGeneratedPassword = generateSecurePassword();
      
      const success = await onSignup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: autoGeneratedPassword,
        address: formData.address.trim() || undefined,
        bio: formData.bio.trim() || undefined,
        birthYear: parseInt(formData.birthYear)
      });
      
      if (success) {
        toast.success('Compte créé avec succès ! Bienvenue sur IdeoSphere ! 🎉');
        // Reset form
        setFormData({
          name: '',
          email: '',
          address: '',
          birthYear: '',
          bio: ''
        });
        setAcceptTerms(false);
      } else {
        setError('Cette adresse email est déjà utilisée');
      }
    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
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
            <h1 className="text-2xl mb-2">
              Rejoignez {clientConfig.identity.appName}
            </h1>
            <p className="text-muted-foreground">
              {getSignupDescription()}
            </p>
          </div>
        </div>

        {/* Formulaire */}
        <Card>
          <CardHeader>
            <CardTitle>Créer votre compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Connexion SSO officielle */}
            {onRegisterSSO && (
              <>
                <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary/30">
                  <div className="flex items-center justify-center mb-3">
                    <Shield className="w-5 h-5 text-primary mr-2" />
                    <span className="text-primary">Compte officiel recommandé</span>
                  </div>
                  <Button
                    onClick={onRegisterSSO}
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Créer un compte officiel avec Keycloak
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Compte sécurisé géré par votre administration
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Autres options
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Connexions sociales */}
            {onSocialLogin && (
              <>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleSocialLogin('google')}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <GoogleIcon />
                    <span className="ml-2">Continuer avec Google</span>
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={() => handleSocialLogin('facebook')}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      <FacebookIcon />
                      <span className="ml-2">Facebook</span>
                    </Button>
                    
                    <Button
                      onClick={() => handleSocialLogin('discord')}
                      disabled={isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      <DiscordIcon />
                      <span className="ml-2">Discord</span>
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Ou créez un compte
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Avantages */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <div className="flex items-center mb-2">
                <Shield className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm text-primary">Vos avantages</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Proposez et soutenez des idées</li>
                <li>• Participez aux discussions</li>
                <li>• Suivez l'évolution des projets</li>
                <li>• Personnalisez votre expérience</li>
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

              {/* Nom et Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Prénom *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Marie"
                    required
                    disabled={isLoading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Votre prénom sera visible par les autres membres
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="marie.dupont@email.com"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Note sur le mot de passe */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Lock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    Un mot de passe sécurisé sera généré automatiquement pour votre compte. Vous pourrez vous connecter avec votre email et ce mot de passe par la suite.
                  </p>
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

              {/* Informations importantes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-blue-900 mb-2">Pourquoi ces informations ?</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• L'âge nous aide à comprendre les besoins de chaque génération</li>
                  <li>• L'adresse nous permet de vous proposer des projets près de chez vous</li>
                  <li>• Un mot de passe sécurisé est généré automatiquement pour protéger votre compte</li>
                  <li>• Ces données restent privées et ne sont jamais partagées</li>
                </ul>
              </div>

              {/* Checkbox conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked === true)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  J'accepte les{' '}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    conditions d'utilisation
                  </Button>{' '}
                  et la{' '}
                  <Button variant="link" className="p-0 h-auto text-primary">
                    politique de confidentialité
                  </Button>
                </Label>
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
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isLoading || !acceptTerms}
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
