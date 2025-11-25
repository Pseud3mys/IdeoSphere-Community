import { useState } from 'react';
import { Idea } from '../types';
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
import { updateIdea } from '../api/contentEditService';
import { toast } from 'sonner@2.0.3';
import { Loader2 } from 'lucide-react';

interface EditIdeaDialogProps {
  idea: Idea;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onIdeaUpdated: (updatedIdea: Idea) => void;
  children?: React.ReactNode;
}

export function EditIdeaDialog({
  idea,
  open,
  onOpenChange,
  onIdeaUpdated,
  children,
}: EditIdeaDialogProps) {
  const [title, setTitle] = useState(idea.title);
  const [summary, setSummary] = useState(idea.summary);
  const [description, setDescription] = useState(idea.description || '');
  const [location, setLocation] = useState(idea.location || '');
  const [tags, setTags] = useState(idea.tags?.join(', ') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Le titre ne peut pas être vide');
      return;
    }

    if (!summary.trim()) {
      toast.error('Le résumé ne peut pas être vide');
      return;
    }

    setIsSubmitting(true);

    try {
      // Extraire les hashtags du résumé et de la description
      const hashtagRegex = /#(\w+)/g;
      const summaryHashtags = [...summary.matchAll(hashtagRegex)].map(match => match[1]);
      const descriptionHashtags = [...description.matchAll(hashtagRegex)].map(match => match[1]);
      
      // Combiner avec les tags saisis manuellement
      const manualTags = tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      const allTags = [...new Set([...summaryHashtags, ...descriptionHashtags, ...manualTags])];

      const updatedIdea = await updateIdea(idea.id, {
        title: title.trim(),
        summary: summary.trim(),
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        tags: allTags.length > 0 ? allTags : undefined,
      });

      if (updatedIdea) {
        onIdeaUpdated(updatedIdea);
        toast.success('Projet modifié avec succès ! 📝');
        onOpenChange(false);
      } else {
        toast.error('Erreur lors de la modification du projet');
      }
    } catch (error) {
      console.error('Erreur lors de la modification du projet:', error);
      toast.error('Erreur lors de la modification du projet');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
          <DialogDescription>
            Vous pouvez modifier votre projet dans les 5 minutes suivant sa publication
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du projet"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="summary">Résumé *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Résumé en quelques lignes"
              className="min-h-[100px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description complète du projet (optionnel)"
              className="min-h-[200px] resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Utilisez # pour ajouter des hashtags (ex: #environnement)
            </p>
          </div>

          <div>
            <Label htmlFor="location">Localisation</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ville, quartier..."
              disabled={isSubmitting}
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