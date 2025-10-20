import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  AlertCircle,
  CheckCircle2
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

const DiscordIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#5865F2">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSocialLogin: (provider: string) => Promise<boolean>;
  onSwitchToSignup: () => void;
  onEnterPlatform: () => void;
}

export function LoginDialog({ isOpen, onClose, onLogin, onSocialLogin, onSwitchToSignup, onEnterPlatform }: LoginDialogProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Utiliser la fonction onLogin qui utilise maintenant la vérification d'email via l'API
      const success = await onLogin(email, password);
      if (success) {
        // Réinitialiser le formulaire
        setEmail('');
        setPassword('');
        onClose();
      }
      // Les erreurs sont gérées par les toasts dans handleLogin
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    
    // Connexion démo automatique
    try {
      const success = await onLogin('demo@ideosphere.fr', '');
      if (success) {
        onClose();
      } else {
        setError('Erreur lors de la connexion démo');
      }
    } catch (err) {
      setError('Erreur de connexion démo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLoginClick = async (provider: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const success = await onSocialLogin(provider);
      if (success) {
        onClose();
      } else {
        setError(`Erreur lors de la connexion avec ${provider}`);
      }
    } catch (err) {
      setError(`Erreur de connexion ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form when dialog closes
  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto bg-white">
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl mb-2">Se connecter</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Accédez à votre compte IdeoSphere pour participer à la discussion
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Connexion démo */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Accès rapide pour tester</span>
            </div>
            <Button
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Compte de démonstration
            </Button>
          </div>

          <Separator className="my-4" />

          {/* Connexions sociales */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground text-center">
              Ou connectez-vous avec :
            </p>
            <div className="grid grid-cols-1 gap-2">
              <Button
                onClick={() => handleSocialLoginClick('google')}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <GoogleIcon />
                <span className="ml-2">Google</span>
              </Button>
              <Button
                onClick={() => handleSocialLoginClick('facebook')}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <FacebookIcon />
                <span className="ml-2">Facebook</span>
              </Button>
              <Button
                onClick={() => handleSocialLoginClick('discord')}
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                <DiscordIcon />
                <span className="ml-2">Discord</span>
              </Button>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Formulaire de connexion */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe (optionnel en démo)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Votre mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                En mode démo, seul l'email est requis
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isLoading || !email} className="w-full">
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Liens vers inscription */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <button
                onClick={onSwitchToSignup}
                className="text-primary hover:underline"
              >
                Créer un compte
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}