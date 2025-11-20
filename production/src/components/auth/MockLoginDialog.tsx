import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { User } from '../../types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface MockLoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUser: (email: string) => void;
  availableUsers: User[];
}

export function MockLoginDialog({ isOpen, onClose, onSelectUser, availableUsers }: MockLoginDialogProps) {
  const [selectedEmail, setSelectedEmail] = useState('marie.dubois@email.com');

  const handleLogin = () => {
    onSelectUser(selectedEmail);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>🔧 Connexion Mode Développement</DialogTitle>
          <DialogDescription>
            Choisissez un utilisateur pour vous connecter (données de test)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Utilisateur</Label>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {availableUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedEmail(user.email)}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedEmail === user.email
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                      {user.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  {selectedEmail === user.email && (
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleLogin}>
            Se connecter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
