import { useState } from 'react';
import { Post, Location } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { LocationSearch } from './LocationSearch';
import { updatePost } from '../api/contentEditService';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';

interface EditPostDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPostUpdated: (updatedPost: Post) => void;
  children?: React.ReactNode;
}

export function EditPostDialog({
  post,
  open,
  onOpenChange,
  onPostUpdated,
  children,
}: EditPostDialogProps) {
  const [content, setContent] = useState(post.content);
  const [location, setLocation] = useState<Location | string | undefined>(post.location);
  const [tags, setTags] = useState(post.tags?.join(', ') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Le contenu ne peut pas être vide');
      return;
    }

    setIsSubmitting(true);

    try {
      // Extraire les hashtags du contenu
      const hashtagRegex = /#(\w+)/g;
      const contentHashtags = [...content.matchAll(hashtagRegex)].map(match => match[1]);
      
      // Combiner avec les tags saisis manuellement
      const manualTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const allTags = [...new Set([...contentHashtags, ...manualTags])];

      const updatedPost = await updatePost(post.id, {
        content: content.trim(),
        location: location || undefined,
        tags: allTags.length > 0 ? allTags : undefined,
      });

      if (updatedPost) {
        onPostUpdated(updatedPost);
        toast.success('Post modifié avec succès ! 📝');
        onOpenChange(false);
      } else {
        toast.error('Erreur lors de la modification du post');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du post:', error);
      toast.error('Erreur lors de la modification du post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le post</DialogTitle>
          <DialogDescription>
            Vous pouvez modifier votre post dans les 5 minutes suivant sa publication
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="content">Contenu *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Qu'avez-vous à partager ?"
              className="min-h-[200px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Utilisez # pour ajouter des hashtags (ex: #environnement)
            </p>
          </div>

          <div>
            <Label htmlFor="location">Localisation</Label>
            <LocationSearch
              onLocationSelect={(loc) => setLocation(loc || undefined)}
              initialLocation={location}
              placeholder="Ville, quartier..."
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags supplémentaires</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="mobilité, transport, vélo (séparés par des virgules)"
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}