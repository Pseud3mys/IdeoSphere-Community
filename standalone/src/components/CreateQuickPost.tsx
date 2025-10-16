import { useState } from 'react';
import { Post } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageSquare, Lightbulb, ArrowRight, Quote, MapPin } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CreateQuickPostProps {
  sourcePost?: Post;
  onSwitchToIdea: () => void;
}

export function CreateQuickPost({ sourcePost, onSwitchToIdea }: CreateQuickPostProps) {
  // Récupération du currentUser depuis l'Entity Store
  const { store, getCurrentUser, actions } = useEntityStoreSimple();
  const currentUser = getCurrentUser();

  // Si currentUser est null, ne pas afficher le composant
  if (!currentUser) {
    return <div>Loading...</div>;
  }

  const [title, setTitle] = useState(sourcePost ? `En réponse à ${sourcePost.author.name}` : '');
  const [location, setLocation] = useState(() => {
    // Pré-remplir avec la localisation du store ou du post source
    return store.prefilledLocation || sourcePost?.location || '';
  });
  const [content, setContent] = useState(() => {
    if (!sourcePost) return '';
    const excerpt = sourcePost.content.slice(0, 100);
    const truncated = sourcePost.content.length > 100 ? '...' : '';
    return `À propos de votre post: "${excerpt}${truncated}"\n\n`;
  });

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim()) {
      await actions.publishPost({
        content: content.trim(),
        location: location.trim() || undefined,
        sourcePostIds: sourcePost ? [sourcePost.id] : []
      });
      
      // Reset form
      setTitle('');
      setContent('');
      setLocation('');
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5" />
              <span>Votre post</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sujet (optionnel) */}
            <div className="space-y-2">
              <Label htmlFor="title">Sujet de votre post (optionnel)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Réflexion sur les réunions virtuelles..."
                className="text-base"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Le thème principal de votre message</span>
                <span>{title.length}/100</span>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="content">Votre message</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Partagez votre réflexion, observation, question ou idée avec la communauté..."
                rows={4}
                required
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Exprimez-vous librement</span>
                <span>{getWordCount(content)} mots</span>
              </div>
            </div>

            {/* Localisation optionnelle */}
            <div className="space-y-2">
              <Label htmlFor="post-location" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Localisation (optionnelle)</span>
              </Label>
              <Input
                id="post-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Place de la République, Quartier Centre-ville"
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Précisez où votre post s'applique si il concerne un lieu spécifique
              </p>
            </div>

            {/* Bouton d'expansion vers idée */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onSwitchToIdea}
                className="flex items-center space-x-2"
              >
                <Lightbulb className="w-4 h-4" />
                <span>Développer en idée complète</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <Button type="submit" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Publier le post</span>
          </Button>
        </div>
      </form>
    </div>
  );
}