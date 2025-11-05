import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Copy, Check, Share, Smartphone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import QRCode from 'qrcode';
import { getIdeaShareText, getPostShareText, clientConfig } from '../config/clientConfig';

interface ShareDialogProps {
  contentId: string;
  contentTitle: string;
  contentType: 'idea' | 'post';
  children: React.ReactNode;
}

/**
 * Configuration du domaine de base pour les liens de partage
 * Peut être modifié selon l'environnement (dev/prod)
 */
const BASE_URL_OVERRIDE: string | null = null; // Mettre votre domaine personnalisé ici, ou null pour auto-détection

/**
 * Obtient l'URL de base pour les liens de partage
 * - Si BASE_URL_OVERRIDE est défini, utilise cette valeur
 * - Sinon, détecte automatiquement depuis window.location.origin
 * - Fallback sur http://localhost:3000 en mode SSR
 */
const getBaseUrl = (): string => {
  if (BASE_URL_OVERRIDE) {
    return BASE_URL_OVERRIDE;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:3000';
};

/**
 * Composant générique de partage de contenu avec QR code
 * 
 * Fonctionnalités :
 * - Génère un QR code scannable vers le contenu
 * - Détecte automatiquement le domaine (window.location.origin) ou utilise BASE_URL_OVERRIDE
 * - Supporte le partage natif (mobile) et par copie de lien
 * - Partage par email et WhatsApp
 * - Utilise les IDs préfixés (ideas/12345 ou posts/12346)
 * 
 * @example
 * // Pour une idée
 * <ShareDialog contentId="ideas/12345" contentTitle="Mon idée" contentType="idea">
 *   <Button>Partager</Button>
 * </ShareDialog>
 * 
 * // Pour un post
 * <ShareDialog contentId="posts/67890" contentTitle="Mon post" contentType="post">
 *   <Button>Partager</Button>
 * </ShareDialog>
 * 
 * Remplace les anciens composants ShareIdeaDialog et SharePostDialog
 */
export function ShareDialog({ contentId, contentTitle, contentType, children }: ShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Générer l'URL et le texte en fonction du type
  const baseUrl = getBaseUrl();
  
  // Générer l'URL avec le format préfixé
  // contentId est déjà au format "ideas/12345" ou "posts/12346"
  // L'URL finale sera : http://localhost:3000/content/ideas/12345
  const contentUrl = `${baseUrl}/content/${contentId}`;
  
  const previewText = contentType === 'idea' 
    ? contentTitle
    : contentTitle.length > 100 ? contentTitle.slice(0, 100) + '...' : contentTitle;

  const shareTitle = contentType === 'idea' ? contentTitle : `Post ${clientConfig.identity.appName}`;
  const shareText = contentType === 'idea'
    ? getIdeaShareText(contentTitle)
    : getPostShareText(previewText);

  const dialogTitle = contentType === 'idea' 
    ? clientConfig.systemMessages.shareDialog.ideaDialogTitle 
    : clientConfig.systemMessages.shareDialog.postDialogTitle;
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

  // Générer le QR code quand le dialog s'ouvre
  useEffect(() => {
    // ✅ FIX: Ne vérifier canvasRef.current QUE dans le setTimeout
    // pour laisser le temps au DOM de connecter la ref
    if (isOpen) {
      console.log('🔄 [ShareDialog] Dialog ouvert, tentative de génération du QR code...');
      
      // Petit délai pour s'assurer que le canvas est bien rendu dans le DOM
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          console.log('✅ [ShareDialog] Canvas trouvé, génération du QR code pour:', contentUrl);
          QRCode.toCanvas(canvasRef.current, contentUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          }).then(() => {
            console.log('✅ [ShareDialog] QR code généré avec succès');
          }).catch(err => {
            console.error('❌ [ShareDialog] Erreur lors de la génération du QR code:', err);
          });
        } else {
          console.warn('⚠️ [ShareDialog] Canvas toujours null après le délai');
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, contentUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
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
            <div className="mx-auto w-52 h-52 bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                width={200}
                height={200}
                className="max-w-full max-h-full"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium line-clamp-2">{previewText}</p>
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
