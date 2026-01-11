import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Copy, Check, Share, Smartphone, Download } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { clientConfig } from '../config/clientConfig';

interface SharePlatformDialogProps {
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
 * Composant de partage de la plateforme avec QR code
 * 
 * Fonctionnalités :
 * - Génère un QR code scannable vers la page d'accueil
 * - Détecte automatiquement le domaine (window.location.origin) ou utilise BASE_URL_OVERRIDE
 * - Supporte le partage natif (mobile) et par copie de lien
 * - Permet le téléchargement de l'image du QR code
 * - Partage par email et WhatsApp
 * 
 * @example
 * <SharePlatformDialog>
 *   <Button>Partager la plateforme</Button>
 * </SharePlatformDialog>
 */
export function SharePlatformDialog({ children }: SharePlatformDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Générer l'URL de la page d'accueil
  const baseUrl = getBaseUrl();
  const platformUrl = baseUrl; // URL de la page d'accueil

  const shareTitle = `Découvrez ${clientConfig.identity.appName}`;
  const shareText = `Rejoignez ${clientConfig.identity.appName} - La plateforme de démocratie participative de votre territoire ! Partagez vos idées et améliorez votre quotidien.`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(platformUrl);
    setCopied(true);
    toast.success('Lien copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: platformUrl,
      }).catch(() => {
        // Fallback to copy if native share fails
        handleCopyLink();
      });
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQRCode = () => {
    if (!canvasRef.current) return;

    try {
      // Créer un canvas temporaire avec un fond blanc et plus de marge
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Définir la taille du canvas final (QR code + marge + texte)
      const qrSize = 400;
      const margin = 40;
      const textHeight = 60;
      canvas.width = qrSize + (margin * 2);
      canvas.height = qrSize + (margin * 2) + textHeight;

      // Fond blanc
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dessiner le QR code au centre
      ctx.drawImage(canvasRef.current, margin, margin, qrSize, qrSize);

      // Ajouter le texte en bas
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(clientConfig.identity.appName, canvas.width / 2, qrSize + margin + 35);

      // Télécharger l'image
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `qrcode-${clientConfig.identity.appName.toLowerCase().replace(/\s+/g, '-')}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('QR code téléchargé !');
      });
    } catch (error) {
      console.error('Erreur lors du téléchargement du QR code:', error);
      toast.error('Erreur lors du téléchargement');
    }
  };

  // Générer le QR code quand le dialog s'ouvre
  useEffect(() => {
    if (isOpen) {
      console.log('🔄 [SharePlatformDialog] Dialog ouvert, tentative de génération du QR code...');
      
      // Petit délai pour s'assurer que le canvas est bien rendu dans le DOM
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          console.log('✅ [SharePlatformDialog] Canvas trouvé, génération du QR code pour:', platformUrl);
          QRCode.toCanvas(canvasRef.current, platformUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          }).then(() => {
            console.log('✅ [SharePlatformDialog] QR code généré avec succès');
          }).catch(err => {
            console.error('❌ [SharePlatformDialog] Erreur lors de la génération du QR code:', err);
          });
        } else {
          console.warn('⚠️ [SharePlatformDialog] Canvas toujours null après le délai');
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, platformUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share className="w-5 h-5" />
            <span>Partager la plateforme</span>
          </DialogTitle>
          <DialogDescription>
            Invitez vos amis et voisins à rejoindre {clientConfig.identity.appName} pour participer à la démocratie locale !
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
              <p className="text-sm font-medium">{clientConfig.identity.appName}</p>
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Scannez ce QR code pour accéder à la plateforme
                </span>
              </div>
            </div>
            
            {/* Bouton de téléchargement du QR code */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadQRCode}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Télécharger le QR code
            </Button>
          </div>

          {/* Share link */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lien de partage :</label>
            <div className="flex space-x-2">
              <Input
                value={platformUrl}
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
                  window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${platformUrl}`)}`, '_blank');
                }}
              >
                Par email
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${platformUrl}`)}`, '_blank');
                }}
              >
                WhatsApp
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
            <strong>🌟 Faites grandir la communauté !</strong><br />
            Plus nous sommes nombreux, plus nos voix comptent et plus nous pouvons améliorer notre territoire ensemble.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
