import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Home, User, Plus, Users2 } from 'lucide-react';

/**
 * Navigation
 * Composant de navigation principal utilisant React Router
 * Détecte automatiquement la page active via useLocation()
 */
export function Navigation() {
  const location = useLocation();
  
  // Déterminer la page active depuis l'URL
  const getActivePath = () => {
    const path = location.pathname;
    if (path.startsWith('/my-contributions')) return '/my-contributions';
    if (path.startsWith('/my-ideas')) return '/my-ideas';
    if (path.startsWith('/create-idea')) return '/create-idea';
    if (path.startsWith('/groups')) return '/groups';
    if (path.startsWith('/communities')) return '/communities';
    if (path.startsWith('/discovery')) return '/discovery';
    // Si on est sur une autre page (admin, profile, content, etc.), ne rien sélectionner
    return null;
  };

  const activePath = getActivePath();

  const tabs = [
    {
      path: '/discovery',
      label: 'Explorer',
      icon: Home,
      description: 'Explorer les idées de la communauté',
    },
    {
      path: '/my-contributions',
      label: 'Mes contributions',
      icon: User,
      description: 'Gérer vos idées et collaborations',
    },
    {
      path: '/create-idea',
      label: 'Partager une idée',
      icon: Plus,
      description: 'Créer et publier une nouvelle idée',
    },
    {
      path: '/groups',
      label: 'Groupes',
      icon: Users2,
      description: 'Rejoindre et participer aux groupes',
    }
  ];

  return (
    <>
      {/* Navigation Desktop - en haut */}
      <nav className="hidden sm:block border-b border-gray-200 bg-white sticky top-[57px] z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePath === tab.path;
              
              return (
                <Link key={tab.path} to={tab.path}>
                  <Button
                    variant="ghost"
                    className={`flex items-center space-x-2 px-4 py-3 rounded-none border-b-2 transition-all duration-200 ${
                      isActive 
                        ? 'border-[#4f75ff] text-[#4f75ff] bg-[#e8f0ff]/50' 
                        : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Navigation Mobile - en bas (style réseau social) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
        <div className="flex items-center justify-around px-2 py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePath === tab.path;
            
            // Fonction pour raccourcir les labels sur mobile
            const getMobileLabel = (label: string) => {
              if (label === 'Fil d\'idées') return 'Idées';
              if (label === 'Mes contributions') return 'Mes idées';
              if (label === 'Partager une idée') return 'Créer';
              if (label === 'Groupes de travail') return 'Groupes';
              return label;
            };
            
            return (
              <Link key={tab.path} to={tab.path} className="flex-1 max-w-[80px]">
                <Button
                  variant="ghost"
                  className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-0 w-full ${
                    isActive 
                      ? 'text-[#4f75ff] bg-[#e8f0ff]/70' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-[#4f75ff]' : ''}`} />
                  <span className={`text-xs leading-tight text-center ${isActive ? 'font-medium text-[#4f75ff]' : ''}`}>
                    {getMobileLabel(tab.label)}
                  </span>
                </Button>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}