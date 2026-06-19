// src/components/AdminPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, Trash2, CheckCircle, AlertTriangle, Loader2, ExternalLink, Users, Sparkles } from 'lucide-react';
import { ReportedContent, FieldContact } from '../api/adminService';
import { FieldContactForm } from './FieldContactForm';
import { AdminDirectGroupCreationTab } from './AdminDirectGroupCreationTab';

interface AdminPageProps {
  onDeleteReport: (contentType: 'ideas' | 'posts', contentId: string) => Promise<void>;
  onIgnoreReport: (contentType: 'ideas' | 'posts', contentId: string) => Promise<void>;
  reportedContent: ReportedContent[];
  isLoading: boolean;
  // Props pour les contacts terrain
  onAddContact: (contact: FieldContact) => Promise<{ success: boolean; error?: string }>;
}

export function AdminPage({
  onDeleteReport,
  onIgnoreReport,
  reportedContent,
  isLoading,
  onAddContact
}: AdminPageProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleDelete = async (contentType: 'ideas' | 'posts', contentId: string) => {
    setProcessingId(contentId);
    try {
      await onDeleteReport(contentType, contentId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleIgnore = async (contentType: 'ideas' | 'posts', contentId: string) => {
    setProcessingId(contentId);
    try {
      await onIgnoreReport(contentType, contentId);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewContent = (contentType: 'ideas' | 'posts', contentId: string) => {
    // Nettoyer l'ID si nécessaire (enlever le préfixe "ideas/" ou "posts/")
    const cleanId = contentId.includes('/') ? contentId.split('/')[1] : contentId;
    // Utiliser le contentType directement (ideas ou posts, pas idea/post)
    navigate(`/content/${contentType}/${cleanId}`);
  };

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
      <Tabs defaultValue="moderation" className="w-full">
        <TabsList>
          <TabsTrigger value="moderation" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Modération
            {reportedContent.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {reportedContent.length}
              </Badge>
            )}
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
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : reportedContent.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Aucun contenu signalé pour le moment.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {reportedContent.map((item) => (
                <Card 
                  key={`${item.contentType}-${item.contentId}`} 
                  className="border-l-4 border-l-red-500 hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="capitalize">
                            {item.contentType === 'ideas' ? 'Projet' : 'Post'}
                          </Badge>
                          <Badge variant="destructive">
                            {item.reportCount} signalement{item.reportCount > 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <button
                          onClick={() => handleViewContent(item.contentType, item.contentId)}
                          className="text-left hover:text-[#4f75ff] transition-colors group w-full"
                        >
                          <CardTitle className="text-lg flex items-center gap-2">
                            {/* Pour les projets : afficher le titre */}
                            {item.contentType === 'ideas' && (item.content?.title || 'Projet sans titre')}
                            {/* Pour les posts : afficher un extrait du texte comme titre */}
                            {item.contentType === 'posts' && (() => {
                              const text = item.content?.text || item.content?.content || '';
                              if (!text) return 'Post sans contenu';
                              return text.length > 80 ? text.substring(0, 80) + '...' : text;
                            })()}
                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </CardTitle>
                        </button>
                        <p className="text-sm text-gray-500 mt-1">
                          Premier signalement: {new Date(item.firstReportedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Pour les posts : afficher le texte complet */}
                    {item.contentType === 'posts' && (() => {
                      const text = item.content?.text || item.content?.content || '';
                      if (text) {
                        return (
                          <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                            {text}
                          </p>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Pour les projets : afficher la description */}
                    {item.contentType === 'ideas' && item.content?.description && (
                      <p className="text-gray-700 mb-4 line-clamp-4">
                        {item.content.description}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(item.contentType, item.contentId)}
                        disabled={processingId === item.contentId}
                        className="flex items-center gap-2"
                      >
                        {processingId === item.contentId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Supprimer le contenu
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => handleIgnore(item.contentType, item.contentId)}
                        disabled={processingId === item.contentId}
                        className="flex items-center gap-2"
                      >
                        {processingId === item.contentId ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Ignorer le signalement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
