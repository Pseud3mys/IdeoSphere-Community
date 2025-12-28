// src/components/FieldContactsList.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  Mail, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Trash2, 
  Loader2,
  User,
  CheckCircle
} from 'lucide-react';
import { FieldContact } from '../api/adminService';

interface FieldContactsListProps {
  contacts: FieldContact[];
  onDeleteContact: (contactId: string) => Promise<void>;
  isLoading: boolean;
}

export function FieldContactsList({ contacts, onDeleteContact, isLoading }: FieldContactsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (contactId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      return;
    }

    setDeletingId(contactId);
    try {
      await onDeleteContact(contactId);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contacts.length === 0) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Aucun contact terrain enregistré pour le moment.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Contacts terrain ({contacts.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-start justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="truncate">
                    {contact.name || 'Sans nom'}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(contact.id)}
                  disabled={deletingId === contact.id}
                  className="h-8 w-8 p-0 flex-shrink-0"
                >
                  {deletingId === contact.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-red-500" />
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Email */}
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <a
                  href={`mailto:${contact.email}`}
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {contact.email}
                </a>
              </div>

              {/* Quartier */}
              {contact.neighborhood && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{contact.neighborhood}</span>
                </div>
              )}

              {/* Âge approximatif */}
              {contact.approximateAge && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {contact.approximateAge}
                  </Badge>
                </div>
              )}

              {/* Commentaire */}
              {contact.comment && (
                <div className="flex items-start gap-2 pt-2 border-t">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-600 line-clamp-3">
                    {contact.comment}
                  </p>
                </div>
              )}

              {/* Date d'ajout */}
              <div className="flex items-center gap-2 pt-2 border-t text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>
                  {new Date(contact.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
