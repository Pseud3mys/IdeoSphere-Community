import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Mail, 
  MapPin,
  CheckCircle2,
  Bell,
  Calendar
} from 'lucide-react';

import { LocationSearch } from './LocationSearch';

interface NewsletterSubscriptionProps {
  onSubscribe: (data: {
    email: string;
    location: string;
    frequency: string;
  }) => Promise<boolean>;
}

export function NewsletterSubscription({ onSubscribe }: NewsletterSubscriptionProps) {
  const [formData, setFormData] = useState({
    email: '',
    location: '',
    frequency: 'weekly'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setError('Veuillez entrer votre email');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Veuillez entrer un email valide');
      return;
    }

    if (!formData.location.trim()) {
      setError('Veuillez entrer votre localisation');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const success = await onSubscribe(formData);
      if (success) {
        setIsSubscribed(true);
      } else {
        setError('Cette adresse email est déjà abonnée');
      }
    } catch (err) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Quotidienne', icon: '📅' },
    { value: 'weekly', label: 'Hebdomadaire', icon: '📧' },
    { value: 'monthly', label: 'Mensuelle', icon: '📰' },
    { value: 'important', label: 'Événements importants seulement', icon: '⚡' }
  ];

  // Supprimé les options de rayon

  if (isSubscribed) {
    return (
      <Card className="max-w-2xl mx-auto border border-primary/20 bg-primary/5">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          
          <h3 className="text-2xl mb-3 text-gray-900">Abonnement confirmé !</h3>
          <p className="text-muted-foreground mb-4">
            Vous recevrez désormais les idées de votre zone {formData.frequency === 'daily' ? 'chaque jour' : 
            formData.frequency === 'weekly' ? 'chaque semaine' : 
            formData.frequency === 'monthly' ? 'chaque mois' : 'lors d\'événements importants'}.
          </p>
          <div className="text-sm text-muted-foreground bg-white p-3 rounded-lg">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-primary" />
                {formData.location}
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-primary" />
                {frequencyOptions.find(f => f.value === formData.frequency)?.label}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border border-gray-200">
      <CardHeader className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Newsletter personnalisée</CardTitle>
        <p className="text-muted-foreground">
          Recevez les idées et projets de votre zone à la fréquence qui vous convient
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="newsletter-email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="newsletter-email"
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
            <Label htmlFor="newsletter-location">Votre zone d'intérêt *</Label>
            <LocationSearch
              onLocationSelect={(loc) => handleInputChange('location', loc ? loc.label : '')}
              initialLocation={formData.location}
              placeholder="ex. Lyon 2ème, Villeurbanne, Place Bellecour..."
            />
            <p className="text-sm text-muted-foreground">
              Entrez votre quartier, ville ou une adresse précise
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Fréquence d'envoi</Label>
            <Select value={formData.frequency} onValueChange={(value) => handleInputChange('frequency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir la fréquence" />
              </SelectTrigger>
              <SelectContent>
                {frequencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <span className="mr-2">{option.icon}</span>
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
            <h4 className="text-sm text-primary mb-2">Ce que vous recevrez :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Nouvelles idées dans votre zone</li>
              <li>• Projets en cours de réalisation</li>
              <li>• Opportunités de participation</li>
              <li>• Événements et consultations locales</li>
            </ul>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? (
              'Inscription...'
            ) : (
              <>
                S'abonner à la newsletter
                <Mail className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Vous pouvez vous désabonner à tout moment. Nous respectons votre vie privée.
        </p>
      </CardContent>
    </Card>
  );
}