import { useState } from 'react';
import { Idea, Post, User } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Search, Plus, X, Lightbulb, MessageSquare, Filter } from 'lucide-react';

interface ContentLinkDialogProps {
  ideas: Idea[];
  posts: Post[];
  currentUser: User;
  selectedContentIds: string[];
  onContentToggle: (contentId: string) => void;
  children: React.ReactNode;
}

export function ContentLinkDialog({ 
  ideas, 
  posts, 
  currentUser, 
  selectedContentIds, 
  onContentToggle, 
  children 
}: ContentLinkDialogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [contentFilter, setContentFilter] = useState<'all' | 'ideas' | 'posts'>('all');
  const [isOpen, setIsOpen] = useState(false);

  // Créer une liste combinée de tous les contenus
  const getAllContent = () => {
    const combinedContent: Array<{
      id: string;
      type: 'idea' | 'post';
      title: string;
      summary: string;
      author: User;
      createdAt: Date;
      supportCount?: number;
      isSupported?: boolean;
      isSupporting?: boolean;
    }> = [];

    if (contentFilter === 'all' || contentFilter === 'ideas') {
      ideas.forEach(idea => {
        combinedContent.push({
          id: idea.id,
          type: 'idea',
          title: idea.title,
          summary: idea.summary,
          author: idea.creators[0] || { id: 'unknown', name: 'Créateur inconnu', email: '', avatar: '', preferences: { newsletter: false, visibility: 'public' } }, // Protection contre creators vide
          createdAt: idea.createdAt,
          supportCount: idea.supporters?.length || 0,
          isSupported: idea.supporters?.some(supporter => supporter.id === currentUser.id) || false
        });
      });
    }

    if (contentFilter === 'all' || contentFilter === 'posts') {
      posts.forEach(post => {
        combinedContent.push({
          id: post.id,
          type: 'post',
          title: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
          summary: post.content,
          author: post.author,
          createdAt: post.createdAt,
          supportCount: post.supporters?.length || 0,
          isSupporting: post.supporters?.includes(currentUser.id) || false
        });
      });
    }

    // Trier par date de création (plus récent en premier)
    return combinedContent.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const allContent = getAllContent();

  // Filtrer par recherche
  const filteredContent = allContent.filter(content =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
    content.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedContent = allContent.filter(content => selectedContentIds.includes(content.id));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Lier des idées et posts</span>
          </DialogTitle>
          <DialogDescription>
            Recherchez et liez des contenus existants pour enrichir votre idée
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-4 flex-1 overflow-hidden">
          {/* Filtres et recherche */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Boutons de filtre */}
            <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
              <Button
                variant={contentFilter === 'all' ? "default" : "ghost"}
                size="sm"
                onClick={() => setContentFilter('all')}
                className="rounded-full px-3 h-7 text-xs"
              >
                Tout ({ideas.length + posts.length})
              </Button>
              <Button
                variant={contentFilter === 'ideas' ? "default" : "ghost"}
                size="sm"
                onClick={() => setContentFilter('ideas')}
                className="rounded-full px-3 h-7 text-xs"
              >
                <Lightbulb className="w-3 h-3 mr-1" />
                Projets ({ideas.length})
              </Button>
              <Button
                variant={contentFilter === 'posts' ? "default" : "ghost"}
                size="sm"
                onClick={() => setContentFilter('posts')}
                className="rounded-full px-3 h-7 text-xs"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Posts ({posts.length})
              </Button>
            </div>

            {/* Recherche */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre, contenu ou auteur..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Contenus sélectionnés */}
          {selectedContent.length > 0 && (
            <div className="space-y-2 border-b pb-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Contenus liés ({selectedContent.length})
              </h4>
              <div className="space-y-2 max-h-24 overflow-y-auto">
                {selectedContent.map((content) => (
                  <div key={content.id} className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        {content.type === 'idea' ? (
                          <Lightbulb className="w-3 h-3 text-primary" />
                        ) : (
                          <MessageSquare className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm truncate">{content.title}</span>
                        <div className="text-xs text-muted-foreground">
                          {content.type === 'idea' ? 'Idée' : 'Post'} • {content.author.name}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onContentToggle(content.id)}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Liste des contenus disponibles */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium">
                Contenus disponibles
                {searchQuery && ` (${filteredContent.length} résultats)`}
              </h4>
              <div className="text-xs text-muted-foreground">
                {contentFilter === 'all' ? 'Projets et posts' : 
                 contentFilter === 'ideas' ? 'Projets uniquement' : 
                 'Posts uniquement'}
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2">
              {filteredContent.length > 0 ? (
                filteredContent.map((content) => {
                  const isSelected = selectedContentIds.includes(content.id);
                  
                  return (
                    <div
                      key={content.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5 border-primary' : 'hover:bg-muted/30 border-border'
                      }`}
                      onClick={() => onContentToggle(content.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            {content.type === 'idea' ? (
                              <Lightbulb className="w-4 h-4 text-gray-600" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-sm line-clamp-2 mb-1">{content.title}</h5>
                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                              {content.summary}
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={content.author.avatar} alt={content.author.name} />
                                <AvatarFallback className="text-xs">{content.author.name.slice(0, 1)}</AvatarFallback>
                              </Avatar>
                              <span>{content.author.name}</span>
                              <span>•</span>
                              <span>{content.type === 'idea' ? 'Idée' : 'Post'}</span>
                              <span>•</span>
                              <span>{content.createdAt.toLocaleDateString('fr-FR')}</span>
                              {(content.isSupported || content.isSupporting) && (
                                <>
                                  <span>•</span>
                                  <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                                    {content.isSupported ? 'Soutenu' : 'Aimé'}
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                          {isSelected ? (
                            <Badge variant="default" className="text-xs">
                              <X className="w-3 h-3 mr-1" />
                              Lié
                            </Badge>
                          ) : (
                            <Button variant="outline" size="sm" className="h-7 text-xs">
                              <Plus className="w-3 h-3 mr-1" />
                              Lier
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    {contentFilter === 'ideas' ? (
                      <Lightbulb className="w-6 h-6 text-gray-400" />
                    ) : contentFilter === 'posts' ? (
                      <MessageSquare className="w-6 h-6 text-gray-400" />
                    ) : (
                      <Search className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm mb-1">
                    {searchQuery ? 'Aucun résultat trouvé' : 
                     contentFilter === 'ideas' ? 'Aucune idée disponible' :
                     contentFilter === 'posts' ? 'Aucun post disponible' :
                     'Aucun contenu disponible'}
                  </p>
                  <p className="text-xs">
                    {searchQuery ? 'Essayez des mots-clés différents' :
                     'Revenez quand il y aura du contenu à lier'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              {selectedContentIds.length} contenu{selectedContentIds.length > 1 ? 's' : ''} sélectionné{selectedContentIds.length > 1 ? 's' : ''}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Annuler
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Valider ({selectedContentIds.length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}