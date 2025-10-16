import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { ArrowUp, ArrowDown, MessageSquare, Lightbulb } from 'lucide-react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Idea, Post } from '../types';

interface IdeaLineagePanelProps {
  ideaId: string;
  onNavigateToIdea?: (ideaId: string) => void;
  onNavigateToPost?: (postId: string) => void;
}

export function IdeaLineagePanel({ ideaId, onNavigateToIdea, onNavigateToPost }: IdeaLineagePanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [lineageData, setLineageData] = useState<{
    parents: { ideas: Idea[]; posts: Post[] };
    children: { ideas: Idea[]; posts: Post[] };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { actions, getIdeaById } = useEntityStoreSimple();
  const idea = getIdeaById(ideaId);

  const loadLineage = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await actions.fetchIdeaLineage(ideaId);
      setLineageData(result);
    } catch (err) {
      setError('Erreur lors du chargement de la généalogie');
      console.error('Erreur généalogie:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateToIdea = (targetIdeaId: string) => {
    if (onNavigateToIdea) {
      onNavigateToIdea(targetIdeaId);
    } else {
      actions.goToIdea(targetIdeaId);
    }
  };

  const handleNavigateToPost = (postId: string) => {
    if (onNavigateToPost) {
      onNavigateToPost(postId);
    } else {
      actions.goToPost(postId);
    }
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
          <ArrowUp className="h-5 w-5" />
          Généalogie de l'idée
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Découvrez les sources d'inspiration et les idées dérivées
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!lineageData && !isLoading && (
          <Button onClick={loadLineage} className="w-full">
            Charger la généalogie
          </Button>
        )}

        {isLoading && (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={loadLineage} className="mt-2">
              Réessayer
            </Button>
          </div>
        )}

        {lineageData && (
          <div className="space-y-6">
            {/* Parents */}
            {(lineageData.parents.ideas.length > 0 || lineageData.parents.posts.length > 0) && (
              <div>
                <h4 className="flex items-center gap-2 mb-3">
                  <ArrowUp className="h-4 w-4 text-muted-foreground" />
                  Sources d'inspiration
                </h4>
                <div className="space-y-2">
                  {lineageData.parents.ideas.map((parentIdea) => (
                    <div
                      key={parentIdea.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleNavigateToIdea(parentIdea.id)}
                    >
                      <Lightbulb className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{parentIdea.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {parentIdea.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                  {lineageData.parents.posts.map((parentPost) => (
                    <div
                      key={parentPost.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleNavigateToPost(parentPost.id)}
                    >
                      <MessageSquare className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          Post de {parentPost.author.name}
                        </p>
                        <p className="text-sm line-clamp-2">{parentPost.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Children */}
            {(lineageData.children.ideas.length > 0 || lineageData.children.posts.length > 0) && (
              <div>
                <h4 className="flex items-center gap-2 mb-3">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                  Idées et posts dérivés
                </h4>
                <div className="space-y-2">
                  {lineageData.children.ideas.map((childIdea) => (
                    <div
                      key={childIdea.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleNavigateToIdea(childIdea.id)}
                    >
                      <Lightbulb className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{childIdea.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {childIdea.summary}
                        </p>
                      </div>
                    </div>
                  ))}
                  {lineageData.children.posts.map((childPost) => (
                    <div
                      key={childPost.id}
                      className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => handleNavigateToPost(childPost.id)}
                    >
                      <MessageSquare className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground mb-1">
                          Post de {childPost.author.name}
                        </p>
                        <p className="text-sm line-clamp-2">{childPost.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {lineageData.parents.ideas.length === 0 && 
             lineageData.parents.posts.length === 0 && 
             lineageData.children.ideas.length === 0 && 
             lineageData.children.posts.length === 0 && (
              <div className="text-center py-6">
                <p className="text-muted-foreground text-sm">
                  Cette idée n'a pas encore de généalogie visible.
                </p>
                <p className="text-muted-foreground text-xs mt-1">
                  Elle pourrait être une idée originale ou les liens ne sont pas encore établis.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}