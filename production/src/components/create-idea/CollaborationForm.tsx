import { useState } from 'react';
import { ContentLinkSearch } from '../ContentLinkSearch';
import { User, Idea, Post } from '../../types';
import { discussionTopics } from '../../data/discussions';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { CollaborationQRCode } from '../CollaborationQRCode';
import { 
  Users, 
  QrCode, 
  X,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CollaborationFormProps {
  selectedCoCreators: User[];
  setSelectedCoCreators: (creators: User[]) => void;
  selectedParentIds: string[];
  setSelectedParentIds: (ids: string[]) => void;
  prefilledSelectedDiscussions?: string[];
  users: User[];
  ideas: Idea[];
  posts: Post[];
}

export function CollaborationForm({
  selectedCoCreators,
  setSelectedCoCreators,
  selectedParentIds,
  setSelectedParentIds,
  prefilledSelectedDiscussions,
  users,
  ideas,
  posts
}: CollaborationFormProps) {
  const [coCreatorSearch, setCoCreatorSearch] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(true);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(coCreatorSearch.toLowerCase()) &&
    !selectedCoCreators.some(selected => selected.id === user.id)
  );

  const addCoCreator = (user: User) => {
    setSelectedCoCreators([...selectedCoCreators, user]);
    setCoCreatorSearch('');
  };

  const removeCoCreator = (userId: string) => {
    setSelectedCoCreators(selectedCoCreators.filter(user => user.id !== userId));
  };

  const handleContentToggle = (contentId: string) => {
    setSelectedParentIds(
      selectedParentIds.includes(contentId) 
        ? selectedParentIds.filter(id => id !== contentId)
        : [...selectedParentIds, contentId]
    );
  };

  const mockIdeaId = 'temp-' + Date.now();

  const getSelectedContent = () => {
    const selectedContent: Array<{
      id: string;
      type: 'idea' | 'post' | 'discussion';
      title: string;
      author: User;
    }> = [];

    selectedParentIds.forEach(id => {
      const idea = ideas.find(i => i.id === id);
      const post = posts.find(p => p.id === id);
      
      if (idea) {
        selectedContent.push({
          id: idea.id,
          type: 'idea',
          title: idea.title,
          author: idea.creators[0] || { 
            id: 'unknown', 
            name: 'Créateur inconnu', 
            email: '', 
            avatar: '', 
            createdAt: new Date(),
            isRegistered: false
          }
        });
      } else if (post) {
        selectedContent.push({
          id: post.id,
          type: 'post',
          title: post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content,
          author: post.author
        });
      }
    });

    return selectedContent;
  };

  const getSelectedDiscussions = () => {
    if (!prefilledSelectedDiscussions || prefilledSelectedDiscussions.length === 0) {
      return [];
    }

    return discussionTopics.filter(discussion => 
      prefilledSelectedDiscussions.includes(discussion.id)
    );
  };

  const selectedContent = getSelectedContent();
  const selectedDiscussions = getSelectedDiscussions();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Collaboration</span>
            <Badge variant="secondary" className="text-xs">Optionnel</Badge>
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      {showAdvanced && (
        <CardContent className="space-y-4">
          {/* Co-creators */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Co-créateurs invités</Label>
              <CollaborationQRCode
                projectId={mockIdeaId}
                collaborators={selectedCoCreators}
                onInviteEmail={(email) => toast.success(`Invitation envoyée à ${email}`)}
              >
                <Button variant="outline" size="sm">
                  <QrCode className="w-4 h-4 mr-2" />
                  QR Code
                </Button>
              </CollaborationQRCode>
            </div>
            
            {selectedCoCreators.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedCoCreators.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2 bg-secondary rounded-lg px-3 py-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="text-xs">{user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                    <Badge variant="outline" className="text-xs">Co-créateur</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCoCreator(user.id)}
                      className="h-auto p-0 w-4 h-4 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <Input
                value={coCreatorSearch}
                onChange={(e) => setCoCreatorSearch(e.target.value)}
                placeholder="Rechercher un membre à inviter comme co-créateur..."
              />
              {coCreatorSearch && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredUsers.slice(0, 5).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => addCoCreator(user)}
                      className="w-full px-3 py-2 text-left hover:bg-accent flex items-center space-x-2"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback className="text-xs">{user.name.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{user.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Liaison de contenus */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Projets et posts liés</Label>
              <ContentLinkSearch
                selectedContentIds={selectedParentIds}
                onContentToggle={handleContentToggle}
              />
            </div>
            
            {selectedContent.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm text-muted-foreground">
                  Contenus liés ({selectedContent.length})
                </h4>
                {selectedContent.map((content) => (
                  <div key={content.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      {content.type === 'idea' ? (
                        <Lightbulb className="w-3 h-3 text-primary" />
                      ) : (
                        <MessageSquare className="w-3 h-3 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{content.title}</div>
                      <div className="text-xs text-muted-foreground">
                        par {content.author.name} • {content.type === 'idea' ? 'Idée' : 'Post'}
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleContentToggle(content.id)}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Discussions sélectionnées */}
            {selectedDiscussions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm text-muted-foreground">
                  Discussions liées ({selectedDiscussions.length})
                </h4>
                {selectedDiscussions.map((discussion) => (
                  <div key={discussion.id} className="flex items-center space-x-3 p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{discussion.title}</div>
                      <div className="text-xs text-muted-foreground">
                        par {discussion.author.name} • Discussion {discussion.type}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                      {discussion.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Liez votre idée à des contenus existants pour montrer les inspirations et connexions.
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}