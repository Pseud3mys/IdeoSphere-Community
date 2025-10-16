import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Link, Edit, Eye } from 'lucide-react';
import Markdown from 'react-markdown';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  required?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder = "Rédigez votre idée...", minHeight = "300px", required = false }: RichTextEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };



  return (
    <div className="space-y-3">
      {/* Mode toggle button above editor */}
      <div className="flex items-center justify-end">
        <Button
          type="button"
          variant={isPreview ? "secondary" : "outline"}
          size="sm"
          onClick={() => setIsPreview(!isPreview)}
          className="flex items-center space-x-2"
        >
          {isPreview ? (
            <>
              <Edit className="w-4 h-4" />
              <span>Édition</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>Aperçu</span>
            </>
          )}
        </Button>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        {/* Toolbar - only show in edit mode */}
        {!isPreview && (
          <div className="bg-muted/30 border-b border-border p-2 flex items-center space-x-1">
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertText('## ', '')}
                className="h-8 w-8 p-0"
              >
                <Heading2 className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertText('### ', '')}
                className="h-8 w-8 p-0"
              >
                <Heading3 className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertText('**', '**')}
                className="h-8 w-8 p-0"
              >
                <Bold className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertText('*', '*')}
                className="h-8 w-8 p-0"
              >
                <Italic className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <div className="flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertText('- ', '')}
                className="h-8 w-8 p-0"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertText('1. ', '')}
                className="h-8 w-8 p-0"
              >
                <ListOrdered className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertText('> ', '')}
                className="h-8 w-8 p-0"
              >
                <Quote className="w-4 h-4" />
              </Button>
            </div>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => insertText('[texte du lien](', ')')}
              className="h-8 w-8 p-0"
            >
              <Link className="w-4 h-4" />
            </Button>
          </div>
        )}

      {/* Content */}
      <div className="relative">
        {!isPreview ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            className="w-full p-4 border-0 resize-none focus:outline-none focus:ring-0 bg-background"
            style={{ minHeight }}
          />
        ) : (
          <div 
            className="p-4 prose prose-sm max-w-none"
            style={{ minHeight }}
          >
            {value ? (
              <Markdown>{value}</Markdown>
            ) : (
              <p className="text-muted-foreground">{placeholder}</p>
            )}
          </div>
        )}
      </div>

        {/* Helper text - only show in edit mode */}
        {!isPreview && (
          <div className="bg-muted/20 border-t border-border p-2 text-xs text-muted-foreground">
            <span>Utilisez le Markdown : **gras**, *italique*, ## Titre, - Liste, &gt; Citation, [lien](url)</span>
          </div>
        )}
      </div>
    </div>
  );
}