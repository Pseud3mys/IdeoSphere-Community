import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Mail, MessageCircle, Github } from 'lucide-react';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const handleNavigation = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <footer className="bg-white border-t">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Section principale */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Colonne 1: Marque et description */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-medium text-gray-900 mb-3">IdeoSphere</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-md">
              Un système nerveux pour l'intelligence collective. Nous connectons les énergies militantes 
              et facilitons l'émergence d'actions concrètes pour le changement social et écologique.
            </p>
            <div className="text-xs text-gray-500">
              Projet open source
            </div>
          </div>

          {/* Colonne 2: Navigation */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">En savoir plus</h4>
            <div className="space-y-2">
              <button 
                onClick={() => handleNavigation('about')} 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                À propos
              </button>
              <button 
                onClick={() => handleNavigation('how-it-works')} 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Comment ça marche
              </button>
              <button 
                onClick={() => handleNavigation('faq')} 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                FAQ
              </button>
            </div>
          </div>

          {/* Colonne 3: Contact et communauté */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Nous rejoindre</h4>
            <div className="space-y-2">
              <a 
                href="https://discord.gg/WuUY5dtB" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <MessageCircle size={14} />
                Discord
              </a>
              <a 
                href="mailto:contact@holonsystems.org" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Mail size={14} />
                Email
              </a>
              <a 
                href="https://github.com/Pseud3mys/IdeoSphere-Community" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github size={14} />
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Section footer légal */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-xs text-gray-500">
              © 2025 IdeoSphere. Tous droits réservés.
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <button 
                onClick={() => handleNavigation('privacy')} 
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                Confidentialité
              </button>
              <button 
                onClick={() => handleNavigation('terms')} 
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                CGU
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>

  );
}