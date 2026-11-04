// src/components/AdminPage.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Shield, Users, Sparkles, ShieldAlert } from 'lucide-react';
import { FieldContact } from '../api/adminService';
import { FieldContactForm } from './FieldContactForm';
import { AdminDirectGroupCreationTab } from './AdminDirectGroupCreationTab';
import { AdminModerationTab } from './AdminModerationTab';

interface AdminPageProps {
  // Props pour les contacts terrain
  onAddContact: (contact: FieldContact) => Promise<{ success: boolean; error?: string }>;
}

export function AdminPage({ onAddContact }: AdminPageProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* En-tête */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-900">Administration</h1>
        </div>
        <p className="text-gray-600">
          Gérez les signalements et la modération de contenu
        </p>
      </div>

      {/* Onglets */}
      {/* « Modération » regroupe aussi les signalements des utilisateurs (anciennement un onglet à part) */}
      <Tabs defaultValue="moderation" className="w-full">
        <TabsList>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" />
            Modération
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Contacts Terrain
          </TabsTrigger>
          <TabsTrigger value="group-validation" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            création groupe
          </TabsTrigger>
        </TabsList>

        <TabsContent value="moderation" className="mt-6">
          <AdminModerationTab />
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <div className="space-y-6">
            {/* Formulaire d'ajout */}
            <FieldContactForm onSubmit={onAddContact} />
          </div>
        </TabsContent>

        <TabsContent value="group-validation" className="mt-6">
          <AdminDirectGroupCreationTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
