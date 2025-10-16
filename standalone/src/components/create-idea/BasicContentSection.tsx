import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { MessageSquare, Lightbulb, ArrowRight } from 'lucide-react';

interface BasicContentSectionProps {
  creationMode: 'post' | 'idea';
  title: string;
  summary: string;
  onTitleChange: (value: string) => void;
  onSummaryChange: (value: string) => void;
  onSwitchToIdeaMode: () => void;
  getWordCount: (text: string) => number;
}

export function BasicContentSection({
  creationMode,
  title,
  summary,
  onTitleChange,
  onSummaryChange,
  onSwitchToIdeaMode,
  getWordCount
}: BasicContentSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {creationMode === 'post' ? (
            <>
              <MessageSquare className="w-5 h-5" />
              <span>Votre post</span>
            </>
          ) : (
            <>
              <Lightbulb className="w-5 h-5" />
              <span>Présentation de l'idée</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Titre/Sujet */}
        <div className="space-y-2">
          <Label htmlFor="title">
            {creationMode === 'post' ? 'Sujet de votre post' : 'Titre de votre idée'}
          </Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={creationMode === 'post' 
              ? "Ex: Réflexion sur les réunions virtuelles..."
              : "Ex: Plateforme d'innovation collaborative"
            }
            required
            className={creationMode === 'post' ? 'text-base' : 'text-lg'}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{creationMode === 'post' ? 'Le thème principal de votre message' : 'Un titre clair et inspirant'}</span>
            <span>{title.length}/100</span>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-2">
          <Label htmlFor="summary">
            {creationMode === 'post' ? 'Votre message' : 'Résumé en une phrase'}
          </Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            placeholder={creationMode === 'post'
              ? "Partagez votre réflexion, observation, question ou idée avec la communauté..."
              : "Décrivez votre idée en une phrase percutante qui donne envie d'en savoir plus..."
            }
            rows={creationMode === 'post' ? 4 : 2}
            required
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {creationMode === 'post' 
                ? 'Exprimez-vous librement' 
                : 'L\'accroche qui apparaîtra dans les listes'
              }
            </span>
            <span>{getWordCount(summary)} mots</span>
          </div>
        </div>

        {/* Bouton d'expansion vers idée */}
        {creationMode === 'post' && (
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onSwitchToIdeaMode}
              className="flex items-center space-x-2"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Développer en idée complète</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}