import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Copy, Check, Share, Smartphone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ShareDialogProps {
  contentId: string;
  contentTitle: string;
  contentType: 'idea' | 'post';
  children: React.ReactNode;
}

/**
 * Composant générique de partage de contenu
 * Remplace ShareIdeaDialog et SharePostDialog
 */
export function ShareDialog({ contentId, contentTitle, contentType, children }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Generate a simple QR code pattern using CSS
  const qrCodePattern = Array.from({ length: 21 }, (_, i) => 
    Array.from({ length: 21 }, (_, j) => {
      // Create a deterministic pattern based on content ID
      const hash = (contentId + i.toString() + j.toString()).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      return Math.abs(hash) % 3 === 0;
    })
  );

  // Générer l'URL et le texte en fonction du type
  const contentUrl = contentType === 'idea' 
    ? `https://ideosphere.fr/idees/${contentId}`
    : `https://ideosphere.fr/posts/${contentId}`;
  
  const previewText = contentType === 'idea' 
    ? contentTitle
    : contentTitle.length > 100 ? contentTitle.slice(0, 100) + '...' : contentTitle;

  const shareTitle = contentType === 'idea' ? contentTitle : 'Post IdeoSphere';
  const shareText = contentType === 'idea'
    ? `Découvrez cette idée citoyenne : ${contentTitle}`
    : `Découvrez ce post citoyen : ${previewText}`;

  const dialogTitle = contentType === 'idea' ? 'Partager cette idée' : 'Partager ce post';
  const dialogDescription = contentType === 'idea'
    ? 'Partagez cette idée avec vos amis et voisins pour recueillir plus de soutiens.'
    : 'Partagez ce post avec vos amis et voisins pour encourager les discussions.';

  const qrCodeLabel = contentType === 'idea' 
    ? 'Scannez ce QR code pour voir l\'idée'
    : 'Scannez ce QR code pour voir le post';

  const tipMessage = contentType === 'idea'
    ? {
        emoji: '💡',
        title: 'Plus de soutiens = plus d\'impact !',
        text: 'Chaque personne qui soutient votre idée augmente ses chances d\'être réalisée par la municipalité.'
      }
    : {
        emoji: '💬',
        title: 'Encouragez la discussion !',
        text: 'Partager ce post peut susciter des réactions intéressantes et faire émerger de nouvelles idées.'
      };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(contentUrl);
    setCopied(true);
    toast.success('Lien copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: contentUrl,
      }).catch(() => {
        // Fallback to copy if native share fails
        handleCopyLink();
      });
    } else {
      handleCopyLink();
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div onClick={handleOpen}>
        {children}
      </div>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share className="w-5 h-5" />
            <span>{dialogTitle}</span>
          </DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-48 h-48 bg-white p-4 rounded-lg border-2 border-border">
              <div className="w-full h-full grid grid-cols-21 gap-0">
                {qrCodePattern.map((row, i) =>
                  row.map((cell, j) => (
                    <div
                      key={`${i}-${j}`}
                      className={`w-full h-full ${cell ? 'bg-black' : 'bg-white'}`}
                    />
                  ))
                )}
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{previewText}</p>
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {qrCodeLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Share link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lien de partage :</label>
            <div className="flex space-x-2">
              <Input
                value={contentUrl}
                readOnly
                className="text-xs bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyLink}
                className="flex-shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col space-y-2">
            <Button onClick={handleShareNative} className="w-full">
              <Share className="w-4 h-4 mr-2" />
              Partager
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${contentUrl}`)}`, '_blank');
                }}
              >
                Par email
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${contentUrl}`)}`, '_blank');
                }}
              >
                WhatsApp
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
            <strong>{tipMessage.emoji} {tipMessage.title}</strong><br />
            {tipMessage.text}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
