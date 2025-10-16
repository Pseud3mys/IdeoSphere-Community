import { Post } from '../../types';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { MessageSquare, Lightbulb, Archive, Quote } from 'lucide-react';

interface CreateIdeaHeaderProps {
  creationMode: 'post' | 'idea';
  sourcePost?: Post;
  draftsCount: number;
  onToggleDrafts: () => void;
}

export function CreateIdeaHeader({ 
  creationMode, 
  sourcePost, 
  draftsCount, 
  onToggleDrafts
}: CreateIdeaHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="mb-2">Créer du contenu</h1>
          <p className="text-muted-foreground">
            Partagez {creationMode === 'post' ? 'un post rapide' : 'une idée développée'} avec la communauté
          </p>
        </div>
        {/* Toujours afficher le bouton brouillons */}
        <Button 
          variant="outline" 
          onClick={onToggleDrafts}
          className="flex items-center space-x-2"
        >
          <Archive className="w-4 h-4" />
          <span>
            {draftsCount > 0 ? `Brouillons (${draftsCount})` : 'Brouillons'}
          </span>
        </Button>
      </div>

      {/* Post source si présent */}
      {sourcePost && (
        <Card className="border-blue-200 bg-blue-50/30 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Quote className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Post source</span>
            </div>
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={sourcePost.author.avatar} alt={sourcePost.author.name} />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                  {sourcePost.author.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{sourcePost.author.name}</span>
                  <span className="text-xs text-gray-500">
                    {sourcePost.createdAt.toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <p className="text-sm text-gray-800 line-clamp-3">{sourcePost.content}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}