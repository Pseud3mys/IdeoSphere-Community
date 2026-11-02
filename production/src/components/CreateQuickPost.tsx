import { useState } from 'react';
import { Post, Location } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { MessageSquare, Lightbulb, ArrowRight, Quote, MapPin, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { clientConfig } from '../config/clientConfig';
import { GroupPicker } from './group/GroupPicker';
import { LocationSearch } from './LocationSearch';

interface CreateQuickPostProps {
  sourcePost?: Post;
  prefilledGroupIds?: string[];
  onSwitchToIdea: () => void;
}

export function CreateQuickPost({ sourcePost, prefilledGroupIds, onSwitchToIdea }: CreateQuickPostProps) {
  // Récupération du currentUser depuis l'Entity Store
  const { store, getCurrentUser, getUserById, getPostById, actions, rawActions } = useEntityStoreSimple();
  const navigation = useNavigationActions();
  const currentUser = getCurrentUser();

  // ✅ Utiliser unknownUser comme fallback pour les invités
  const effectiveUser = currentUser || { id: 'unknown', name: 'Invité', email: '' } as any;

  // Obtenir le post source depuis les props ou depuis le store
  const derivedSourcePost = sourcePost || 
    (store.prefilledSourcePostId ? getPostById(store.prefilledSourcePostId) : null);
  
  // ✅ Résoudre l'auteur du post source
  const sourcePostAuthor = derivedSourcePost ? getUserById(derivedSourcePost.authorId) : null;
  
  const [title, setTitle] = useState(derivedSourcePost && sourcePostAuthor ? `En réponse à ${sourcePostAuthor.name}` : '');
  const [location, setLocation] = useState<Location | string>(() => {
    // Pré-remplir avec la localisation du store ou du post source
    return store.prefilledLocation || derivedSourcePost?.location || '';
  });
  const [groupIds, setGroupIds] = useState<string[]>(prefilledGroupIds || []);
  const [content, setContent] = useState(''); // Texte vide au démarrage

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim()) {
      const newPost = await actions.publishPost({
        title: title.trim() || undefined,
        content: content.trim(),
        location: location || undefined,
        groupIds: groupIds.length > 0 ? groupIds : undefined,
        sourcePostIds: derivedSourcePost ? [derivedSourcePost.id] : []
      });
      
      // Navigate to the created post
      if (newPost) {
        navigation.goToPost(newPost.id);
      }
      
      // Reset form
      setTitle('');
      setContent('');
      setLocation('');
      setGroupIds([]);
    }
  };

  const handleDevelopToIdea = () => {
    onSwitchToIdea();
  };

  const handleStartFromScratch = () => {
    // Réinitialiser tous les champs et données préremplies
    setTitle('');
    setContent('');
    setLocation('');
    setGroupIds([]);
    
    // Nettoyer le store pour supprimer le post source
    rawActions.setPrefilledSourcePostId(null);
    rawActions.setPrefilledLocation(null);
    
    toast.success('Vous créez maintenant un post indépendant');
  };

  return (
  <div className="space-y-6 pt-6">
      {/* Affichage du post source avec bouton de reset intégré */}
      {derivedSourcePost && (
        <Card className="border-blue-200 bg-blue-50/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Quote className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={sourcePostAuthor?.avatar} />
                      <AvatarFallback>{sourcePostAuthor?.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-blue-900">{sourcePostAuthor?.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStartFromScratch}
                    className="text-gray-500 hover:text-gray-700 h-7 px-2 text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Repartir de zéro
                  </Button>
                </div>
                {derivedSourcePost.title && (
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">{derivedSourcePost.title}</h4>
                )}
                <p className="text-sm text-blue-800 line-clamp-3">{derivedSourcePost.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

  <form onSubmit={handleSubmit} className="space-y-4">
<Card>
  <CardContent className="space-y-4 pt-6">
    {/* Message principal en haut, style réseau social */}
    <div className="flex items-start gap-3">
      <Avatar className="w-10 h-10 mt-1">
        <AvatarImage src={effectiveUser.avatar} />
        <AvatarFallback>{effectiveUser.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={clientConfig.placeholders.postContent}
          rows={3}
          required
          className="resize-none border-2 border-gray-200 focus:border-blue-500 rounded-lg p-3 focus:ring-0 bg-white min-h-[80px] transition-colors"
          style={{fontSize: '1rem'}}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
          <span className="hidden sm:inline">Exprimez-vous librement</span>
          <span>{getWordCount(content)} mots</span>
        </div>
      </div>
    </div>

    {/* Groupes où publier : visible juste sous le texte */}
    <div className="px-2">
      <GroupPicker selectedIds={groupIds} onChange={setGroupIds} />
    </div>

    {/* Options visibles en mode "bandeau" compact sous le champ principal */}
    <div className="flex flex-wrap gap-2 px-2">
      {/* Sujet (optionnel) */}
      <div className="flex flex-1 gap-2 w-full min-w-0">
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre"
          className="text-sm border border-gray-200 hover:border-gray-300 rounded-lg px-3 py-2 h-9 focus:ring-0 focus:border-blue-500 transition-colors flex-1 min-w-0"
          maxLength={100}
        />
        <div className="flex-1 min-w-0">
          <LocationSearch
        initialLocation={location}
        onLocationSelect={(loc) => setLocation(loc || '')}
        placeholder="Lieu"
          />
        </div>
      </div>

    </div>

    {/* Bouton d'expansion vers idée */}
    <div className="pt-2 flex items-center justify-between px-2">
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center space-x-1 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        onClick={handleDevelopToIdea}
      >
        <Lightbulb className="w-4 h-4" />
        <span>Développer en projet complet</span>
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