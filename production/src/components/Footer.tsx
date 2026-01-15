import { Link } from 'react-router-dom';
import { 
  Github, 
  Mail, 
  MessageCircle, // Pour Discord (souvent utilisé si pas d'icone dédiée)
  Linkedin, 
  Facebook, 
  Instagram, 
  Twitter, 
  Globe // Pour le site web par défaut
} from 'lucide-react';
import { clientConfig } from '../config/clientConfig';

interface FooterProps {
  onNavigate?: (page: string) => void; // Conservé pour compatibilité, mais sera ignoré
}

export function Footer({ onNavigate }: FooterProps) {
  // Note : onNavigate n'est plus utilisé avec React Router
  // La navigation se fait automatiquement via les <Link>

  // Fonction utilitaire pour déterminer l'icône
  const getSocialIcon = (link: { url: string; network?: string }) => {
    const url = link.url.toLowerCase();
    const network = link.network?.toLowerCase();

    if (network === 'github' || url.includes('github.com')) return <Github size={14} />;
    if (network === 'email' || url.startsWith('mailto:')) return <Mail size={14} />;
    if (network === 'discord' || url.includes('discord.gg') || url.includes('discord.com')) return <MessageCircle size={14} />;
    if (network === 'linkedin' || url.includes('linkedin.com')) return <Linkedin size={14} />;
    if (network === 'facebook' || url.includes('facebook.com')) return <Facebook size={14} />;
    if (network === 'instagram' || url.includes('instagram.com')) return <Instagram size={14} />;
    if (network === 'twitter' || url.includes('twitter.com') || url.includes('x.com')) return <Twitter size={14} />;
    
    // Icône par défaut pour le site web ou lien générique
    return <Globe size={14} />;
  };

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
            <ul className="space-y-2">
              {clientConfig.footer.socialLinks.map((link, index) => (
                <li key={index}>
                  <a 
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {/* Icône automatique */}
                    {getSocialIcon(link)}
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
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