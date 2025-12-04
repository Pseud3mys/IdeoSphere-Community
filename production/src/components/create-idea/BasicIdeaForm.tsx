import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RichTextEditor } from '../RichTextEditor';
import { Lightbulb, FileText, MapPin, Users, X } from 'lucide-react';
import { Post, Location } from '../../types';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';
import { clientConfig } from '../../config/clientConfig';
import { LocationSearch } from '../LocationSearch';

interface BasicIdeaFormProps {
  title: string;
  setTitle: (title: string) => void;
  summary: string;
  setSummary: (summary: string) => void;
  description: string;
  setDescription: (description: string) => void;
  location?: Location | string;
  setLocation?: (location: Location | string) => void;
  groupIds?: string[];
  setGroupIds?: (groupIds: string[]) => void;
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
  groupIds,
  setGroupIds,
  sourcePost
}: BasicIdeaFormProps) {
  // ✅ Résoudre l'auteur du post source
  const { getUserById, getUserGroups, getCurrentUser } = useEntityStoreSimple();
  const sourcePostAuthor = sourcePost ? getUserById(sourcePost.authorId) : null;
  const currentUser = getCurrentUser();
  // ✅ Récupérer uniquement les groupes dont l'utilisateur est membre
  const userGroups = currentUser ? getUserGroups(currentUser.id) : [];

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

          {/* Groupes liés (optionnel) */}
          {setGroupIds && (
            <div className="space-y-2">
              <Label htmlFor="idea-group" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Groupes liés (optionnel)</span>
              </Label>
              {groupIds && groupIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {groupIds.map((gId) => {
                    const group = userGroups.find(g => g.id === gId);
                    return group ? (
                      <Badge key={gId} variant="secondary" className="flex items-center gap-1">
                        {group.name}
                        <button
                          type="button"
                          onClick={() => setGroupIds(groupIds.filter(id => id !== gId))}
                          className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
              <Select 
                value="select" 
                onValueChange={(value) => {
                  if (value !== 'select' && groupIds && !groupIds.includes(value)) {
                    setGroupIds([...groupIds, value]);
                  }
                }}
              >
                <SelectTrigger id="idea-group">
                  <SelectValue placeholder="Ajouter un groupe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="select" disabled>Sélectionner un groupe</SelectItem>
                  {userGroups
                    .filter(group => !groupIds?.includes(group.id))
                    .map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Associez votre idée à un ou plusieurs groupes pour la partager avec leurs membres
              </p>
            </div>
          )}

          {/* Localisation optionnelle */}
          {setLocation && (
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Localisation (optionnelle)</span>
              </Label>
              <LocationSearch
                initialLocation={location}
                onLocationSelect={(loc) => setLocation(loc || '')}
                placeholder={clientConfig.examples.idea.locationPlaceholder}
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
