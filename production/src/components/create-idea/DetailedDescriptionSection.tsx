import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { RichTextEditor } from '../RichTextEditor';
import { FileText } from 'lucide-react';
import { Post } from '../../types';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';
import { clientConfig } from '../../config/clientConfig';

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
  // ✅ Résoudre l'auteur du post source
  const { getUserById } = useEntityStoreSimple();
  const sourcePostAuthor = sourcePost ? getUserById(sourcePost.authorId) : null;
  
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
          placeholder={
            sourcePost && sourcePostAuthor
              ? clientConfig.examples.idea.descriptionTemplate.withSourcePost(sourcePostAuthor.name)
              : clientConfig.examples.idea.descriptionTemplate.withoutSourcePost
          }
          minHeight="400px"
        />
        <div className="mt-2 text-xs text-muted-foreground">
          💡 Plus votre description est détaillée, mieux elle sera évaluée par la communauté
        </div>
      </CardContent>
    </Card>
  );
}
