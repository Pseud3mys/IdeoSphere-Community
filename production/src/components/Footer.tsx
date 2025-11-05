import { Link } from 'react-router-dom';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { Mail, MessageCircle, Github } from 'lucide-react';
import { clientConfig } from '../config/clientConfig';

interface FooterProps {
  onNavigate?: (page: string) => void; // Conservé pour compatibilité, mais sera ignoré
}

export function Footer({ onNavigate }: FooterProps) {
  // Note : onNavigate n'est plus utilisé avec React Router
  // La navigation se fait automatiquement via les <Link>

  return (
    <footer className="bg-white border-t">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Section principale */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Colonne 1: Marque et description */}
          <div className="lg:col-span-2">
            <h3 className="text-base font-medium text-gray-900 mb-3">{clientConfig.identity.appName}</h3>
            <p className="text-sm text-gray-600 leading-relaxed mb-4 max-w-md">
              {clientConfig.identity.appDescriptionShort}
            </p>
            <div className="text-xs text-gray-500">
              {clientConfig.identity.projectStatus}
            </div>
          </div>

          {/* Colonne 2: Navigation */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">{clientConfig.footer.learnMoreTitle}</h4>
            <div className="space-y-2">
              <Link 
                to="/about" 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {clientConfig.footer.links.about}
              </Link>
              <Link 
                to="/how-it-works" 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {clientConfig.footer.links.howItWorks}
              </Link>
              <Link 
                to="/faq" 
                className="block text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {clientConfig.footer.links.faq}
              </Link>
            </div>
          </div>

          {/* Colonne 3: Contact et communauté */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">{clientConfig.footer.joinUsTitle}</h4>
            <div className="space-y-2">
              <a 
                href={clientConfig.footer.contact.discord.url}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <MessageCircle size={14} />
                {clientConfig.footer.contact.discord.label}
              </a>
              <a 
                href={clientConfig.footer.contact.email.url}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Mail size={14} />
                {clientConfig.footer.contact.email.label}
              </a>
              <a 
                href={clientConfig.footer.contact.github.url}
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Github size={14} />
                {clientConfig.footer.contact.github.label}
              </a>
            </div>
          </div>
        </div>

        {/* Section footer légal */}
        <div className="pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="text-xs text-gray-500">
              {clientConfig.identity.copyright}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <Link 
                to="/privacy" 
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                {clientConfig.footer.links.privacy}
              </Link>
              <Link 
                to="/terms" 
                className="text-gray-500 hover:text-gray-900 transition-colors"
              >
                {clientConfig.footer.links.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>

  );
}