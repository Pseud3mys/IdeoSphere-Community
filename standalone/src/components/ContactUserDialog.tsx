import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { User } from '../types';
import { Mail, Linkedin, MessageSquare, Send, ExternalLink } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface ContactUserDialogProps {
  user: User;
  currentUser: User;
}

export function ContactUserDialog({ user, currentUser }: ContactUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [contactMethod, setContactMethod] = useState<'platform' | 'email' | 'linkedin'>('platform');
  const [shareEmail, setShareEmail] = useState(false);
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error('Veuillez écrire un message');
      return;
    }

    // Simuler l'envoi du message
    if (contactMethod === 'platform') {
      toast.success('Message envoyé via la plateforme ! 💬');
    } else if (contactMethod === 'email') {
      if (shareEmail) {
        toast.success(`Demande de contact envoyée à ${user.name} avec votre email ! 📧`);
      } else {
        toast.success('Demande de contact envoyée ! L\'utilisateur peut vous répondre via la plateforme.');
      }
    } else if (contactMethod === 'linkedin') {
      toast.success('Redirection vers LinkedIn... 🔗');
    }

    setIsOpen(false);
    setMessage('');
    setSubject('');
    setShareEmail(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center space-x-2">
          <MessageSquare className="w-4 h-4" />
          <span>Contacter</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Contacter {user.name}</span>
          </DialogTitle>
          <DialogDescription>
            Choisissez votre méthode de contact préférée et rédigez votre message
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Méthodes de contact */}
          <div className="space-y-3">
            <Label>Comment souhaitez-vous le contacter ?</Label>
            
            {/* Via la plateforme */}
            <div 
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                contactMethod === 'platform' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setContactMethod('platform')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Via IdeoSphere</span>
                    <Badge variant="secondary" className="text-xs">Recommandé</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Message privé sur la plateforme
                  </p>
                </div>
              </div>
            </div>

            {/* Via email */}
            <div 
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                contactMethod === 'email' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setContactMethod('email')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Demande par email</span>
                  <p className="text-sm text-muted-foreground">
                    L'utilisateur recevra une demande de contact
                  </p>
                </div>
              </div>
            </div>

            {/* Via LinkedIn (si disponible) */}
            <div 
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                contactMethod === 'linkedin' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setContactMethod('linkedin')}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Linkedin className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Redirection vers le profil LinkedIn
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Options pour email */}
          {contactMethod === 'email' && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <Label htmlFor="share-email" className="text-sm">
                  Partager mon email ({currentUser.email})
                </Label>
                <Switch
                  id="share-email"
                  checked={shareEmail}
                  onCheckedChange={setShareEmail}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {shareEmail 
                  ? "Votre email sera partagé pour permettre une réponse directe"
                  : "L'utilisateur pourra vous répondre via la plateforme uniquement"
                }
              </p>
            </div>
          )}

          {/* Sujet (pour email et LinkedIn) */}
          {(contactMethod === 'email' || contactMethod === 'linkedin') && (
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Collaboration sur vos idées..."
              />
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Bonjour, j'aimerais échanger avec vous sur..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="w-4 h-4 mr-2" />
              {contactMethod === 'platform' ? 'Envoyer' : 
               contactMethod === 'email' ? 'Envoyer la demande' : 
               'Aller sur LinkedIn'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}