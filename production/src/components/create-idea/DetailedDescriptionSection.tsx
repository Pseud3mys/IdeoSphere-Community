import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { RichTextEditor } from '../RichTextEditor';
import { FileText } from 'lucide-react';
import { Post } from '../../types';

interface DetailedDescriptionSectionProps {
  description: string;
  sourcePost?: Post;
  onDescriptionChange: (value: string) => void;
  getWordCount: (text: string) => number;
}

export function DetailedDescriptionSection({
  description,
  sourcePost,
  onDescriptionChange,
  getWordCount
}: DetailedDescriptionSectionProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Description détaillée</span>
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {getWordCount(description)} mots
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <RichTextEditor
          value={description}
          onChange={onDescriptionChange}
          placeholder={`## Contexte et enjeu
 
${sourcePost ? `Suite au post de ${sourcePost.author.name}, je pense que...` : 'Décrivez le problème ou l\'opportunité que vous avez identifié...'}
 
## Solution proposée
 
Expliquez en détail votre idée et comment elle répond au besoin...
 
## Mise en œuvre
 
- Étape 1 : ...
- Étape 2 : ...
 
## Impact attendu
 
Quels bénéfices concrets pour les membres de la communauté ?`}
          minHeight="400px"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          💡 Plus votre description est détaillée, mieux elle sera évaluée par la communauté
        </div>
      </CardContent>
    </Card>
  );
}