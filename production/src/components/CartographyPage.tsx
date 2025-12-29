import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { ExternalLink, Share2 } from 'lucide-react';
import { clientConfig } from '../config/clientConfig';

interface CartographyPageProps {
  onNavigateBack?: () => void;
}

/**
 * CartographyPage
 * Page dédiée à la visualisation de la cartographie Kumu
 * Affiche l'iframe embarqué et un lien discret vers le plein écran
 */
export function CartographyPage({ onNavigateBack }: CartographyPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cartographie</h1>
        </div>

        {/* Visualisation Kumu */}
        {clientConfig.integrations.kumu.enabled && clientConfig.integrations.kumu.embedUrl ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardDescription>
                    Explorez les connexions entre les membres, idées et groupes de la communauté
                  </CardDescription>
                </div>
                {clientConfig.integrations.kumu.projectUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={clientConfig.integrations.kumu.projectUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Ouvrir en plein écran</span>
                      <span className="sm:hidden">Plein écran</span>
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                <iframe
                  src={clientConfig.integrations.kumu.embedUrl}
                  width="100%"
                  height={clientConfig.integrations.kumu.height || "600"}
                  style={{ border: 0, display: 'block', minHeight: '500px' }}
                  title="Visualisation Kumu"
                  className="w-full"
                />
              </div>
              <p className="text-xs text-gray-500 mt-3">
                💡 Interagissez avec le graphe : cliquez et glissez les nœuds, zoomez, explorez les connexions.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cartographie non configurée
              </h3>
              <p className="text-gray-600">
                La visualisation de la cartographie n'est pas encore disponible pour cette communauté.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
