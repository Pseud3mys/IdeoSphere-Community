import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  MapPin,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Shield
} from 'lucide-react';

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

const MicrosoftIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#F25022" d="M0 0h11.5v11.5H0z"/>
    <path fill="#00A4EF" d="M12.5 0H24v11.5H12.5z"/>
    <path fill="#7FBA00" d="M0 12.5h11.5V24H0z"/>
    <path fill="#FFB900" d="M12.5 12.5H24V24H12.5z"/>
  </svg>
);

interface SignupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (userData: {
    name: string;
    email: string;
    password: string;
    location?: string;
  }) => Promise<boolean>;
  onSocialLogin: (provider: string) => Promise<boolean>;
  onSwitchToLogin: () => void;
  onDemoAccess: () => void;
}

export function SignupDialog({ isOpen, onClose, onSignup, onSocialLogin, onSwitchToLogin, onDemoAccess }: SignupDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  // Supprimé acceptNewsletter car maintenant géré sur la page d'accueil
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
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
    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
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
      const success = await onSignup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        location: formData.location.trim() || undefined
      });

      if (success) {
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          location: ''
        });
        setAcceptTerms(false);
        onClose();
      } else {
        setError('Cette adresse email est déjà utilisée');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = await onSocialLogin(provider);
      if (success) {
        onClose();
      } else {
        setError(`Erreur de connexion avec ${provider}`);
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: '', color: '' };
    if (password.length < 6) return { strength: 1, label: 'Trop court', color: 'text-red-500' };
    if (password.length < 8) return { strength: 2, label: 'Faible', color: 'text-orange-500' };
    if (password.length < 12) return { strength: 3, label: 'Correct', color: 'text-blue-500' };
    return { strength: 4, label: 'Fort', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            Créer votre compte
          </DialogTitle>
          <DialogDescription className="text-center">
            Rejoignez votre communauté d'idées et participez aux discussions
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Accès démo en évidence */}
          <div className="text-center">
            <Button
              onClick={onDemoAccess}
              disabled={isLoading}
              className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Accès démo instantané
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Parfait pour découvrir la plateforme
            </p>
          </div>

          {/* Connexions sociales */}
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
                onClick={() => handleSocialLogin('microsoft')}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <MicrosoftIcon />
                <span className="ml-2">Microsoft</span>
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

          {/* Formulaire d'inscription */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nom complet *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Votre nom et prénom"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="votre.email@exemple.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Localisation (optionnel)</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="location"
                  type="text"
                  placeholder="Votre quartier ou ville"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Choisissez un mot de passe"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {formData.password && (
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        passwordStrength.strength === 1 ? 'bg-red-500 w-1/4' :
                        passwordStrength.strength === 2 ? 'bg-orange-500 w-2/4' :
                        passwordStrength.strength === 3 ? 'bg-blue-500 w-3/4' :
                        passwordStrength.strength === 4 ? 'bg-green-500 w-full' : 'w-0'
                      }`}
                    />
                  </div>
                  <span className={`text-xs ${passwordStrength.color}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmez votre mot de passe"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="pl-10 pr-10"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Checkbox conditions uniquement */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={setAcceptTerms}
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
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading || !acceptTerms}
            >
              {isLoading ? (
                'Création du compte...'
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Lien vers connexion */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Déjà un compte ?{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={onSwitchToLogin}
                disabled={isLoading}
              >
                Se connecter
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}