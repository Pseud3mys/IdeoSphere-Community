import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { RichTextEditor } from '../RichTextEditor';
import { ContentLinkSearch } from '../ContentLinkSearch';
import { Lightbulb, FileText, MapPin, Users, X, Link as LinkIcon, MessageSquare } from 'lucide-react';
import { Post, Location, Idea, User } from '../../types';
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
  selectedParentIds: string[];
  setSelectedParentIds: (ids: string[]) => void;
  ideas: Idea[];
  posts: Post[];
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
  groupIds = [],
  setGroupIds,
  selectedParentIds = [], // ✅ Correction : Valeur par défaut pour éviter le undefined.forEach
  setSelectedParentIds,
  ideas = [],
  posts = [],
  sourcePost
}: BasicIdeaFormProps) {
  const { getUserById, getUserGroups, getCurrentUser } = useEntityStoreSimple();
  const sourcePostAuthor = sourcePost ? getUserById(sourcePost.authorId) : null;
  const currentUser = getCurrentUser();
  const userGroups = currentUser ? getUserGroups(currentUser.id) : [];

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleContentToggle = (contentId: string) => {
    const currentIds = selectedParentIds || [];
    setSelectedParentIds(
      currentIds.includes(contentId) 
        ? currentIds.filter(id => id !== contentId)
        : [...currentIds, contentId]
    );
  };

  const getSelectedContent = () => {
    const selectedContent: Array<{
      id: string;
      type: 'idea' | 'post';
      title: string;
      author: User;
    }> = [];

    // ✅ Utilisation de l'optional chaining ou fallback vide
    (selectedParentIds || []).forEach(id => {
      const idea = ideas.find(i => i.id === id);
      const post = posts.find(p => p.id === id);
      
      if (idea) {
        const firstCreator = idea.creatorIds?.[0] ? getUserById(idea.creatorIds[0]) : null;
        selectedContent.push({
          id: idea.id,
          type: 'idea',
          title: idea.title,
          author: firstCreator || { id: 'unknown', name: 'Créateur inconnu' } as User
        });
      } else if (post) {
        const author = getUserById(post.authorId);
        if (author) {
          selectedContent.push({
            id: post.id,
            type: 'post',
            title: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
            author: author
          });
        }
      }
    });
    return selectedContent;
  };

  const selectedContent = getSelectedContent();

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5" />
            <span>Présentation de l'idée</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Titre et Résumé */}
          <div className="space-y-4">
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
          </div>

          <Separator className="opacity-50" />

          {/* Options secondaires (Visibilité réduite) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {setGroupIds && (
              <div className="space-y-2 opacity-80 focus-within:opacity-100 transition-opacity">
                <Label htmlFor="idea-group" className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <Users className="w-3 h-3" />
                  <span>Groupes liés (optionnel)</span>
                </Label>
                {groupIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {groupIds.map((gId) => {
                      const group = userGroups.find(g => g.id === gId);
                      return group ? (
                        <Badge key={gId} variant="secondary" className="flex items-center gap-1 text-[10px]">
                          {group.name}
                          <button
                            type="button"
                            onClick={() => setGroupIds(groupIds.filter(id => id !== gId))}
                            className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
                <Select 
                  value="select" 
                  onValueChange={(value) => {
                    if (value !== 'select' && !groupIds.includes(value)) {
                      setGroupIds([...groupIds, value]);
                    }
                  }}
                >
                  <SelectTrigger id="idea-group" className="h-8 text-xs">
                    <SelectValue placeholder="Ajouter un groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="select" disabled>Sélectionner un groupe</SelectItem>
                    {userGroups
                      .filter(group => !groupIds.includes(group.id))
                      .map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {setLocation && (
              <div className="space-y-2 opacity-80 focus-within:opacity-100 transition-opacity">
                <Label htmlFor="location" className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <MapPin className="w-3 h-3" />
                  <span>Localisation (optionnelle)</span>
                </Label>
                <LocationSearch
                  initialLocation={location}
                  onLocationSelect={(loc) => setLocation(loc || '')}
                  placeholder={clientConfig.examples.idea.locationPlaceholder}
                  className="h-8 text-xs"
                />
              </div>
            )}
          </div>

          <Separator className="opacity-50" />

          {/* Liaison de contenus (Mise en évidence pour la collaboration) */}
          <div className="space-y-3 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="flex items-center space-x-2 text-blue-700">
                  <LinkIcon className="w-4 h-4" />
                  <span className="font-bold">Sources et Inspirations</span>
                </Label>
              </div>
              <ContentLinkSearch
                selectedContentIds={selectedParentIds}
                onContentToggle={handleContentToggle}
              />
            </div>
            
            {selectedContent.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {selectedContent.map((content) => (
                  <div key={content.id} className="flex items-center space-x-2 p-2 bg-white border border-blue-100 rounded-lg shadow-sm">
                    <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center flex-shrink-0">
                      {content.type === 'idea' ? (
                        <Lightbulb className="w-3 h-3 text-blue-600" />
                      ) : (
                        <MessageSquare className="w-3 h-3 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium truncate text-slate-700">{content.title}</div>
                      <div className="text-[9px] text-slate-500 truncate">par {content.author.name}</div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleContentToggle(content.id)}
                      className="h-6 w-6 p-0 hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-center py-1 text-slate-400 italic">
                Aucune source liée pour le moment.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
            placeholder={`## Contexte et enjeu...`}
            minHeight="400px"
            required
          />
        </CardContent>
      </Card>
    </>
  );
}