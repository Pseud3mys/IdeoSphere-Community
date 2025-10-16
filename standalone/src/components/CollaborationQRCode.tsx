import { useState } from 'react';
import { User } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { QrCode, Copy, Check, Users, Share, Smartphone } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface CollaborationQRCodeProps {
  projectId: string;
  collaborators: User[];
  onInviteEmail?: (email: string) => void;
  children: React.ReactNode;
}

export function CollaborationQRCode({ projectId, collaborators, onInviteEmail, children }: CollaborationQRCodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Generate a simple QR code pattern using CSS
  const qrCodePattern = Array.from({ length: 21 }, (_, i) => 
    Array.from({ length: 21 }, (_, j) => {
      // Create a deterministic pattern based on project ID
      const hash = (projectId + i.toString() + j.toString()).split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      return Math.abs(hash) % 3 === 0;
    })
  );

  const collaborationUrl = `https://ideosphere.local/join/${projectId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(collaborationUrl);
    setCopied(true);
    toast.success('Lien copié dans le presse-papier !');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInviteByEmail = () => {
    if (emailInput.trim()) {
      onInviteEmail?.(emailInput.trim());
      setEmailInput('');
      toast.success('Invitation envoyée !');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Inviter des collaborateurs</span>
          </DialogTitle>
          <DialogDescription>
            Partagez ce QR code ou le lien pour inviter des voisins à collaborer sur votre idée.
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
              <p className="text-sm">Scannez ce QR code pour rejoindre la collaboration</p>
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Ouvrez l'appareil photo de votre smartphone
                </span>
              </div>
            </div>
          </div>

          {/* Share link */}
          <div className="space-y-2">
            <label className="text-sm">Ou partagez ce lien :</label>
            <div className="flex space-x-2">
              <Input
                value={collaborationUrl}
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

          {/* Email invitation */}
          <div className="space-y-2">
            <label className="text-sm">Inviter par email :</label>
            <div className="flex space-x-2">
              <Input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="nom@exemple.fr"
                type="email"
                onKeyPress={(e) => e.key === 'Enter' && handleInviteByEmail()}
              />
              <Button onClick={handleInviteByEmail} size="sm">
                Inviter
              </Button>
            </div>
          </div>

          {/* Current collaborators */}
          {collaborators.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm">Collaborateurs actuels ({collaborators.length})</h4>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center space-x-2 p-2 bg-muted/30 rounded">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                      <AvatarFallback className="text-xs">{collaborator.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1">{collaborator.name}</span>
                    <Badge variant="outline" className="text-xs">
                      Actif
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded">
            <strong>💡 Astuce :</strong> La modification en temps réel n'est pas encore disponible. 
            En attendant, les collaborateurs peuvent utiliser un outil externe (Google Docs, Framapad, etc.) 
            pour travailler ensemble puis copier-coller le contenu ici. Cela permet d'identifier tous les 
            auteurs de l'idée et de les créditer en tant que co-créateurs.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}