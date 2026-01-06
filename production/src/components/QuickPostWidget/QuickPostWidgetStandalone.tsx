import { useEffect, useState } from 'react';
import { QuickPostWidget, QuickPostWidgetProps } from './QuickPostWidget';

/**
 * Composant wrapper pour utilisation en iframe.
 * Parse les paramètres URL et les passe au QuickPostWidget.
 * 
 * Exemple d'URL:
 * /widget/quick-post?groups=groups/123,groups/456&tags=%23FAQ,%23Support&showFeed=true&feedSize=6&showContact=false
 */
export function QuickPostWidgetStandalone() {
  const [config, setConfig] = useState<QuickPostWidgetProps | null>(null);

  useEffect(() => {
    // Parser les paramètres URL
    const params = new URLSearchParams(window.location.search);
    
    const parsedConfig: QuickPostWidgetProps = {
      // Groupes (séparés par virgule)
      defaultGroupIds: params.get('groups')?.split(',').filter(Boolean) || [],
      
      // Tags (séparés par virgule, décodés depuis l'URL)
      defaultTags: params.get('tags')?.split(',').map(tag => decodeURIComponent(tag)).filter(Boolean) || [],
      
      // Options d'affichage
      showFeedAfterPost: params.get('showFeed') === 'true',
      feedSize: parseInt(params.get('feedSize') || '6') as 4 | 6,
      showContactFields: params.get('showContact') === 'true',
      
      // Placeholder personnalisé
      placeholder: params.get('placeholder') || undefined,
      
      // Mode standalone activé
      standalone: true,
      
      // Callbacks
      onPostCreated: (post) => {
        console.log('✅ Post créé en mode standalone:', post.id);
        // Le widget gère déjà le postMessage
      },
      onClose: () => {
        console.log('🔒 Widget fermé');
        // Notifier le parent si dans une iframe
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'quickpost_closed'
          }, '*');
        }
      }
    };

    setConfig(parsedConfig);

    // Log pour debugging
    console.log('🔧 QuickPostWidget Standalone configuré:', parsedConfig);
  }, []);

  // Attendre que la config soit prête
  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Chargement...</div>
      </div>
    );
  }

  return <QuickPostWidget {...config} />;
}
