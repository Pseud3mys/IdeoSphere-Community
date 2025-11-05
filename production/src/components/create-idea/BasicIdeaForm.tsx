import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { RichTextEditor } from '../RichTextEditor';
import { Lightbulb, FileText, MapPin } from 'lucide-react';
import { Post } from '../../types';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';
import { clientConfig } from '../../config/clientConfig';

interface BasicIdeaFormProps {
  title: string;
  setTitle: (title: string) => void;
  summary: string;
  setSummary: (summary: string) => void;
  description: string;
  setDescription: (description: string) => void;
  location?: string;
  setLocation?: (location: string) => void;
  sourcePost?: Post;
}

export function BasicIdeaForm({
  title,
  setTitle,
  summary,
  setSummary,
  description,
  setDescription,
  location,
  setLocation,
  sourcePost
}: BasicIdeaFormProps) {
  // ✅ Résoudre l'auteur du post source
  const { getUserById } = useEntityStoreSimple();
  const sourcePostAuthor = sourcePost ? getUserById(sourcePost.authorId) : null;

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  return (
    <>
      {/* Présentation de l'idée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>Présentation de l'idée</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Titre */}
          <div className="space-y-2">
            <Label htmlFor="title">Titre de votre idée</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={clientConfig.examples.idea.titlePlaceholder}
              required
              className="text-lg"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Un titre clair et inspirant</span>
              <span>{title.length}/100</span>
            </div>
          </div>

          {/* Résumé */}
          <div className="space-y-2">
            <Label htmlFor="summary">Résumé en une phrase</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder={clientConfig.examples.idea.summaryPlaceholder}
              rows={2}
              required
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>L'accroche qui apparaîtra dans les listes</span>
              <span>{getWordCount(summary)} mots</span>
            </div>
          </div>

          {/* Localisation optionnelle */}
          {setLocation && (
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Localisation (optionnelle)</span>
              </Label>
              <Input
                id="location"
                value={location || ''}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={clientConfig.examples.idea.locationPlaceholder}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                Précisez où cette idée s'applique si elle concerne un lieu spécifique
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description détaillée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Description détaillée</span>
            <Badge variant="outline" className="text-xs ml-2">
              {getWordCount(description)} mots
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder={`## Contexte et enjeu

${sourcePost && sourcePostAuthor ? `Suite au post de ${sourcePostAuthor.name}, je pense que...` : 'Décrivez le problème ou l\'opportunité que vous avez identifié...'}

## Solution proposée

Expliquez en détail votre idée et comment elle répond au besoin...

## Mise en œuvre

- Étape 1 : ...
- Étape 2 : ...

## Impact attendu

Quels bénéfices concrets pour les membres de la communauté ?`}
            minHeight="400px"
            required
          />
          <div className="mt-2 text-xs text-muted-foreground">
            💡 Plus votre description est détaillée, mieux elle sera évaluée par la communauté
          </div>
        </CardContent>
      </Card>
    </>
  );
}
