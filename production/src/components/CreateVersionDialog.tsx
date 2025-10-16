import { useState } from 'react';
import { User, DiscussionTopic } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageSquare, 
  GitBranch,
  Eye,
  Search,
  Filter
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CreateVersionDialogProps {
  idea: any; // Idée actuelle - on peut récupérer cela du store aussi
  children: React.ReactNode;
}

export function CreateVersionDialog({ 
  idea,
  children 
}: CreateVersionDialogProps) {
  // Récupérer les données directement depuis l'Entity Store
  const { 
    getCurrentUser, 
    getDiscussionsForIdea,
    getIdeaById,
    actions 
  } = useEntityStoreSimple();

  const currentUser = getCurrentUser();
  // Récupérer seulement les discussions liées à cette idée
  const availableDiscussions = idea ? getDiscussionsForIdea(idea.id) : [];

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDiscussions, setSelectedDiscussions] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Protection contre idea undefined
  if (!idea) {
    return <>{children}</>;
  }

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleDiscussionToggle = (discussionId: string) => {
    setSelectedDiscussions(prev => 
      prev.includes(discussionId) 
        ? prev.filter(id => id !== discussionId)
        : [...prev, discussionId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    actions.createVersionFromIdea(idea.id, selectedDiscussions);
    
    // Reset form
    setSelectedDiscussions([]);
    setSearchQuery('');
    setTypeFilter('all');
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
    setTypeFilter('all');
    setSelectedDiscussions([]);
  };

  // Filtrer les discussions par recherche et type
  const filteredDiscussions = availableDiscussions.filter(discussion => {
    const matchesSearch = searchQuery === '' || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === 'all' || discussion.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  // Types de discussions uniques pour le filtre
  const discussionTypes = Array.from(new Set(availableDiscussions.map(d => d.type)));

  return (
    <>
      {/* Bouton qui déclenche l'ouverture du dialogue */}
      <div onClick={handleOpen}>
        {children}
      </div>

      {/* Le dialogue lui-même */}
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}>
        <DialogContent 
          className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
          aria-describedby="create-version-description"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <GitBranch className="w-5 h-5" />
              <span>Créer une nouvelle version</span>
            </DialogTitle>
            <DialogDescription id="create-version-description">
              Sélectionnez les discussions qui ont inspiré votre nouvelle version. Elles seront référencées comme sources d'inspiration dans votre version.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {/* Information sur l'idée actuelle */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Version basée sur</span>
                </div>
                <p className="text-sm text-blue-700 font-medium">{idea.title}</p>
                <p className="text-xs text-blue-600 mt-1">{idea.summary}</p>
              </div>

              {/* Barre de recherche et filtres */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Discussions disponibles</span>
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {filteredDiscussions.length} sur {availableDiscussions.length} discussion{availableDiscussions.length > 1 ? 's' : ''}
                  </p>
                </div>

                {/* Recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher par titre, contenu ou auteur..."
                    className="pl-10"
                  />
                </div>

                {/* Filtres par type */}
                {discussionTypes.length > 1 && (
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <div className="flex items-center space-x-1 bg-gray-100 rounded-full p-1">
                      <Button
                        type="button"
                        variant={typeFilter === 'all' ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setTypeFilter('all')}
                        className="rounded-full px-3 h-7 text-xs"
                      >
                        Tout
                      </Button>
                      {discussionTypes.map(type => (
                        <Button
                          key={type}
                          type="button"
                          variant={typeFilter === type ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setTypeFilter(type)}
                          className="rounded-full px-3 h-7 text-xs capitalize"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Liste des discussions */}
              <div className="space-y-3">
                {filteredDiscussions.length > 0 ? (
                  <ScrollArea className="max-h-80">
                    <div className="space-y-2 pr-4">
                      {filteredDiscussions.map(discussion => (
                        <div
                          key={discussion.id}
                          className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/20 transition-colors"
                        >
                          <Checkbox
                            id={`discussion-${discussion.id}`}
                            checked={selectedDiscussions.includes(discussion.id)}
                            onCheckedChange={() => handleDiscussionToggle(discussion.id)}
                          />
                          <div className="flex-1 min-w-0">
                            <label 
                              htmlFor={`discussion-${discussion.id}`}
                              className="text-sm font-medium cursor-pointer hover:text-primary"
                            >
                              {discussion.title}
                            </label>
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                              {discussion.content}
                            </p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={discussion.author.avatar} alt={discussion.author.name} />
                                <AvatarFallback className="text-xs">{discussion.author.name.slice(0, 1)}</AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-muted-foreground">{discussion.author.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {discussion.type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {discussion.posts?.length || 0} réponse{(discussion.posts?.length || 0) > 1 ? 's' : ''}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      {searchQuery || typeFilter !== 'all' 
                        ? 'Aucune discussion trouvée avec ces critères' 
                        : 'Aucune discussion disponible pour cette idée'
                      }
                    </p>
                    {(searchQuery || typeFilter !== 'all') && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSearchQuery('');
                          setTypeFilter('all');
                        }}
                        className="mt-2 text-xs"
                      >
                        Effacer les filtres
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Résumé des discussions sélectionnées */}
              {selectedDiscussions.length > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="text-sm font-medium text-green-800 mb-2">
                    Discussions sélectionnées ({selectedDiscussions.length})
                  </h5>
                  <div className="space-y-1">
                    {selectedDiscussions.map(discussionId => {
                      const discussion = availableDiscussions.find(d => d.id === discussionId);
                      return discussion ? (
                        <div key={discussionId} className="text-xs text-green-700">
                          • {discussion.title}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button type="submit">
                <GitBranch className="w-4 h-4 mr-2" />
                Continuer la création
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}