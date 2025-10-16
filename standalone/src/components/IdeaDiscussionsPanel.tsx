import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { MessageCircle, User, ThumbsUp } from 'lucide-react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Post } from '../types';

interface IdeaDiscussionsPanelProps {
  ideaId: string;
  onNavigateToPost?: (postId: string) => void;
}

export function IdeaDiscussionsPanel({ ideaId, onNavigateToPost }: IdeaDiscussionsPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [discussions, setDiscussions] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { actions, getIdeaById } = useEntityStoreSimple();
  const idea = getIdeaById(ideaId);

  const loadDiscussions = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await actions.fetchIdeaDiscussions(ideaId);
      setDiscussions(result);
    } catch (err) {
      setError('Erreur lors du chargement des discussions');
      console.error('Erreur discussions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToPost = (postId: string) => {
    if (onNavigateToPost) {
      onNavigateToPost(postId);
    } else {
      actions.goToPost(postId);
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Il y a moins d\'une heure';
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Il y a ${diffInDays}j`;
  };

  if (!idea) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Idée non trouvée</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Discussions sur cette idée
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Échanges et débats autour de cette proposition
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {discussions.length === 0 && !isLoading && (
          <Button onClick={loadDiscussions} className="w-full">
            Charger les discussions
          </Button>
        )}

        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={loadDiscussions} className="mt-2">
              Réessayer
            </Button>
          </div>
        )}

        {discussions.length > 0 && (
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <div
                key={discussion.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleNavigateToPost(discussion.id)}
              >
                {/* En-tête de la discussion */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {discussion.author.avatar ? (
                      <img 
                        src={discussion.author.avatar} 
                        alt={discussion.author.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{discussion.author.name}</p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(discussion.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenu de la discussion */}
                <div className="prose prose-sm max-w-none mb-3">
                  <div className="line-clamp-3 text-sm">
                    {discussion.content.split('\n').map((line, index) => (
                      <p key={index} className="mb-1 last:mb-0">
                        {line.startsWith('**') && line.endsWith('**') ? (
                          <strong>{line.slice(2, -2)}</strong>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Statistiques */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      <span>{discussion.likeCount} likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{discussion.replies.length} réponses</span>
                    </div>
                  </div>
                  <span className="text-primary hover:underline">
                    Voir la discussion →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {discussions.length === 0 && !isLoading && !error && (
          <div className="text-center py-6">
            <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              Aucune discussion n'a encore été lancée sur cette idée.
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Soyez le premier à ouvrir le débat !
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}