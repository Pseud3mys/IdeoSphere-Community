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
 */
export function CartographyPage({ onNavigateBack }: CartographyPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 sm:pb-8">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        
        {/* Visualisation Kumu */}
        {clientConfig.integrations.kumu.enabled && clientConfig.integrations.kumu.embedUrl ? (
          <div className="space-y-3">
            {/* Titre et lien plein écran */}
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-gray-600">
                Explorer les idées et les connexions. La carte se met à jour toutes les 24h.
              </p>
              {clientConfig.integrations.kumu.projectUrl && (
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <a 
                    href={clientConfig.integrations.kumu.projectUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Plein écran
                  </a>
                </Button>
              )}
            </div>

            {/* Carte */}
            <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <iframe
                src={clientConfig.integrations.kumu.embedUrl}
                width="100%"
                height={clientConfig.integrations.kumu.height || "600"}
                style={{ border: 0, display: 'block', minHeight: '70vh' }}
                title="Cartographie"
                className="w-full"
              />
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                La cartographie n'est pas encore disponible.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
