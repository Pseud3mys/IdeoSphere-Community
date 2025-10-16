import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CollaborationQRCode } from '../CollaborationQRCode';
import { ContentLinkDialog } from '../ContentLinkDialog';
import { 
  Users, 
  QrCode, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  X, 
  MessageSquare, 
  Lightbulb 
} from 'lucide-react';
import { User, Idea, Post } from '../../types';
import { toast } from 'sonner@2.0.3';

interface CollaborationSectionProps {
  showAdvanced: boolean;
  selectedCoCreators: User[];
  selectedParentIds: string[];
  coCreatorSearch: string;
  filteredUsers: User[];
  selectedContent: Array<{
    id: string;
    type: 'idea' | 'post';
    title: string;
    author: User;
  }>;
  ideas: Idea[];
  posts: Post[];
  currentUser: User;
  mockIdeaId: string;
  onToggleAdvanced: () => void;
  onAddCoCreator: (user: User) => void;
  onRemoveCoCreator: (userId: string) => void;
  onCoCreatorSearchChange: (value: string) => void;
  onContentToggle: (contentId: string) => void;
}

export function CollaborationSection({
  showAdvanced,
  selectedCoCreators,
  selectedParentIds,
  coCreatorSearch,
  filteredUsers,
  selectedContent,
  ideas,
  posts,
  currentUser,
  mockIdeaId,
  onToggleAdvanced,
  onAddCoCreator,
  onRemoveCoCreator,
  onCoCreatorSearchChange,
  onContentToggle
}: CollaborationSectionProps) {
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
            onClick={onToggleAdvanced}
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
                      onClick={() => onRemoveCoCreator(user.id)}
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
                onChange={(e) => onCoCreatorSearchChange(e.target.value)}
                placeholder="Rechercher un membre à inviter comme co-créateur..."
              />
              {coCreatorSearch && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredUsers.slice(0, 5).map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => onAddCoCreator(user)}
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
              <ContentLinkDialog
                ideas={ideas}
                posts={posts}
                currentUser={currentUser}
                selectedContentIds={selectedParentIds}
                onContentToggle={onContentToggle}
              >
                <Button variant="outline" size="sm">
                  <Search className="w-4 h-4 mr-2" />
                  Rechercher et lier
                </Button>
              </ContentLinkDialog>
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
                      onClick={() => onContentToggle(content.id)}
                      className="h-6 w-6 p-0 flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-xs text-muted-foreground">
              Liez votre idée à des contenus existants pour montrer les inspirations et connexions logiques
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}