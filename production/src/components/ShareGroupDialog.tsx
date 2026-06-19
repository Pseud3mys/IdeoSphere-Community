import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Copy, Check, Share, Smartphone, Download } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { clientConfig } from '../config/clientConfig';

interface ShareGroupDialogProps {
  groupId: string;
  groupName: string;
  children: React.ReactNode;
}

/**
 * Configuration du domaine de base pour les liens de partage
 */
const BASE_URL_OVERRIDE: string | null = null;

/**
 * Obtient l'URL de base pour les liens de partage
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
 * Composant de partage de groupe avec QR code
 * 
 * Fonctionnalités :
 * - Génère un QR code scannable vers la page du groupe
 * - Supporte le partage natif (mobile) et par copie de lien
 * - Permet le téléchargement de l'image du QR code
 * - Partage par email et WhatsApp
 * 
 * @example
 * <ShareGroupDialog groupId="groups/123" groupName="Mon Groupe">
 *   <Button size="sm" variant="ghost">Partager</Button>
 * </ShareGroupDialog>
 */
export function ShareGroupDialog({ groupId, groupName, children }: ShareGroupDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Générer l'URL du groupe
  const baseUrl = getBaseUrl();
  // Enlever le préfixe "groups/" si présent pour l'URL
  const cleanGroupId = groupId.replace(/^groups\//, '');
  const groupUrl = `${baseUrl}/groups/${cleanGroupId}`;

  const shareTitle = `Rejoignez le groupe ${groupName}`;
  const shareText = `Découvrez le groupe "${groupName}" sur ${clientConfig.identity.appName} et participez aux discussions locales !`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(groupUrl);
    setCopied(true);
    toast.success('Lien copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareNative = () => {
    if (navigator.share) {
      navigator.share({
        title: shareTitle,
        text: shareText,
        url: groupUrl,
      }).catch(() => {
        handleCopyLink();
      });
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQRCode = () => {
    if (!canvasRef.current) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const qrSize = 400;
      const margin = 40;
      const textHeight = 80;
      canvas.width = qrSize + (margin * 2);
      canvas.height = qrSize + (margin * 2) + textHeight;

      // Fond blanc
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dessiner le QR code
      ctx.drawImage(canvasRef.current, margin, margin, qrSize, qrSize);

      // Ajouter le texte
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(groupName, canvas.width / 2, qrSize + margin + 30);
      ctx.font = '16px sans-serif';
      ctx.fillText(clientConfig.identity.appName, canvas.width / 2, qrSize + margin + 55);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `qrcode-groupe-${groupName.toLowerCase().replace(/\s+/g, '-')}.png`;
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

  // Générer le QR code
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (canvasRef.current) {
          QRCode.toCanvas(canvasRef.current, groupUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#FFFFFF',
            },
          }).catch(err => {
            console.error('Erreur génération QR code:', err);
          });
        }
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, groupUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share className="w-5 h-5" />
            <span>Partager le groupe</span>
          </DialogTitle>
          <DialogDescription>
            Invitez vos proches à rejoindre "{groupName}" pour participer aux discussions et projets du groupe.
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
              <p className="text-sm font-medium line-clamp-2">{groupName}</p>
              <div className="flex items-center justify-center space-x-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Scannez pour rejoindre le groupe
                </span>
              </div>
            </div>
            
            {/* Bouton de téléchargement */}
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

          {/* Lien de partage */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Lien de partage :</label>
            <div className="flex space-x-2">
              <Input
                value={groupUrl}
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

          {/* Boutons d'action */}
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
                  window.open(`mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\n${groupUrl}`)}`, '_blank');
                }}
              >
                Par email
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText} ${groupUrl}`)}`, '_blank');
                }}
              >
                WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
