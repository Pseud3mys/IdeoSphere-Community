import { useState } from 'react';
import { User, Idea, Post } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  Lightbulb, 
  MessageSquare, 
  Plus,
  Check,
  X,
  Filter
} from 'lucide-react';

interface ContentLinkSearchProps {
  selectedContentIds: string[];
  onContentToggle: (contentId: string) => void;
}

export function ContentLinkSearch({ 
  selectedContentIds, 
  onContentToggle 
}: ContentLinkSearchProps) {
  // Récupérer les données directement depuis l'Entity Store
  const { 
    getCurrentUser,
    getUserById,
    getAllIdeas, 
    getAllPosts 
  } = useEntityStoreSimple();

  const currentUser = getCurrentUser();
  const ideas = getAllIdeas();
  const posts = getAllPosts();

  // Protection si currentUser est null
  if (!currentUser) {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  // Filtrer et chercher dans les contenus
  const getFilteredContent = () => {
    let filteredIdeas = ideas;
    let filteredPosts = posts;

    // Filtrer par auteur si "Mes contenus" est activé
    if (showOnlyMine) {
      filteredIdeas = ideas.filter(idea => idea.creatorIds?.includes(currentUser.id));
      filteredPosts = posts.filter(post => post.authorId === currentUser.id);
    }

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredIdeas = filteredIdeas.filter(idea => {
        // Résoudre les créateurs pour la recherche
        const creators = (idea.creatorIds || [])
          .map(id => getUserById(id))
          .filter(Boolean);
        
        return idea.title.toLowerCase().includes(query) ||
          idea.summary.toLowerCase().includes(query) ||
          creators.some(c => c.name.toLowerCase().includes(query));
      });
      filteredPosts = filteredPosts.filter(post => {
        const author = getUserById(post.authorId);
        return post.content.toLowerCase().includes(query) ||
          (author && author.name.toLowerCase().includes(query));
      });
    }

    // Trier par date (plus récent en premier)
    filteredIdeas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const allContent = [
      ...filteredIdeas.map(idea => ({ ...idea, type: 'idea' as const })),
      ...filteredPosts.map(post => ({ ...post, type: 'post' as const }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      all: allContent,
      ideas: filteredIdeas,
      posts: filteredPosts
    };
  };

  const filteredContent = getFilteredContent();

  const isSelected = (contentId: string) => selectedContentIds.includes(contentId);

  const handleToggle = (contentId: string) => {
    onContentToggle(contentId);
  };

  const getContentTitle = (content: any) => {
    if (content.type === 'idea') {
      return content.title;
    } else {
      return content.content.length > 50 ? content.content.substring(0, 50) + '...' : content.content;
    }
  };

  const getContentAuthor = (content: any) => {
    if (content.type === 'idea') {
      // ✅ Résoudre le créateur depuis les IDs
      if (content.creatorIds && content.creatorIds.length > 0) {
        const firstCreator = getUserById(content.creatorIds[0]);
        return firstCreator || { id: 'unknown', name: 'Créateur inconnu', email: '', avatar: '', bio: '', createdAt: new Date(), isRegistered: false };
      }
      return { id: 'unknown', name: 'Créateur inconnu', email: '', avatar: '', bio: '', createdAt: new Date(), isRegistered: false };
    }
    // Pour les posts, récupérer l'auteur depuis l'ID
    const author = getUserById(content.authorId);
    return author || { id: 'unknown', name: 'Auteur inconnu', email: '', avatar: '', bio: '', createdAt: new Date(), isRegistered: false };
  };

  const renderContentItem = (content: any) => {
    const author = getContentAuthor(content);
    const title = getContentTitle(content);
    const selected = isSelected(content.id);

    return (
      <div
        key={content.id}
        className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
          selected 
            ? 'border-primary bg-primary/5 ring-1 ring-primary' 
            : 'border-border hover:border-primary/50 hover:bg-gray-50'
        }`}
        onClick={() => handleToggle(content.id)}
      >
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
          {content.type === 'idea' ? (
            <Lightbulb className="w-4 h-4 text-primary" />
          ) : (
            <MessageSquare className="w-4 h-4 text-primary" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
            {content.type === 'idea' && (
              <Badge variant="outline" className="text-xs">Projet</Badge>
            )}
            {content.type === 'post' && (
              <Badge variant="secondary" className="text-xs">Post</Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Avatar className="w-4 h-4">
              <AvatarImage src={author.avatar} alt={author.name} />
              <AvatarFallback className="text-[10px]">{author.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span>{author.name}</span>
            <span>•</span>
            <span>{content.createdAt ? new Date(content.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}</span>
            {content.type === 'idea' && 'supporters' in content && content.supporters && content.supporters.length > 0 && (
              <>
                <span>•</span>
                <span>{content.supporters.length} soutien{content.supporters.length > 1 ? 's' : ''}</span>
              </>
            )}
            {content.type === 'post' && 'supporters' in content && content.supporters && content.supporters.length > 0 && (
              <>
                <span>•</span>
                <span>{content.supporters.length} soutien{content.supporters.length > 1 ? 's' : ''}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          {selected ? (
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          ) : (
            <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
              <Plus className="w-3 h-3 text-gray-400" />
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="w-4 h-4 mr-2" />
          Rechercher et lier
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Rechercher et lier du contenu</span>
          </DialogTitle>
          <DialogDescription>
            Recherchez et sélectionnez des projets ou posts existants pour les lier à votre contenu.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          {/* Barre de recherche et filtres */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre, contenu ou auteur..."
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Button
                variant={showOnlyMine ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyMine(!showOnlyMine)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-3 h-3" />
                <span>Mes contenus</span>
              </Button>
              
              <div className="text-xs text-muted-foreground">
                {selectedContentIds.length} contenu{selectedContentIds.length > 1 ? 's' : ''} sélectionné{selectedContentIds.length > 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Onglets et contenu */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center space-x-2">
                <span>Tout</span>
                <Badge variant="secondary" className="text-xs">
                  {filteredContent.all.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="ideas" className="flex items-center space-x-2">
                <Lightbulb className="w-3 h-3" />
                <span>Projets</span>
                <Badge variant="secondary" className="text-xs">
                  {filteredContent.ideas.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center space-x-2">
                <MessageSquare className="w-3 h-3" />
                <span>Posts</span>
                <Badge variant="secondary" className="text-xs">
                  {filteredContent.posts.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-2">
                {filteredContent.all.length > 0 ? (
                  filteredContent.all.map(content => renderContentItem(content))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun contenu trouvé</p>
                    {searchQuery && (
                      <p className="text-xs mt-1">Essayez avec d'autres mots-clés</p>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="ideas" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-2">
                {filteredContent.ideas.length > 0 ? (
                  filteredContent.ideas.map(idea => renderContentItem({ ...idea, type: 'idea' }))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun projet trouvé</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="posts" className="flex-1 overflow-y-auto mt-4">
              <div className="space-y-2">
                {filteredContent.posts.length > 0 ? (
                  filteredContent.posts.map(post => renderContentItem({ ...post, type: 'post' }))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Aucun post trouvé</p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            💡 Liez votre contenu à des éléments existants pour montrer les connexions et inspirations
          </p>
          <Button onClick={() => setIsOpen(false)}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}