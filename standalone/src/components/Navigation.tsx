import { TabType } from '../types';
import { Button } from './ui/button';
import { Home, User, Plus, Users2 } from 'lucide-react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const { actions } = useEntityStoreSimple();
  
  const handleCreateClick = () => {
    // Les invités peuvent créer des posts, mais la page create-idea les bloquera pour les idées
    onTabChange('create');
  };

  const tabs = [
    {
      id: 'discovery' as TabType,
      label: 'Fil d\'idées',
      icon: Home,
      description: 'Découvrir les idées de la communauté',
      onClick: () => onTabChange('discovery')
    },
    {
      id: 'my-ideas' as TabType,
      label: 'Mes contributions',
      icon: User,
      description: 'Gérer vos idées et collaborations',
      onClick: () => onTabChange('my-ideas')
    },
    {
      id: 'create' as TabType,
      label: 'Partager une idée',
      icon: Plus,
      description: 'Créer et publier une nouvelle idée',
      onClick: handleCreateClick
    },
    {
      id: 'communities' as TabType,
      label: 'Groupes de travail',
      icon: Users2,
      description: 'Rejoindre les groupes de travail thématiques internes',
      onClick: () => onTabChange('communities')
    }
  ];

  return (
    <>
      {/* Navigation Desktop - en haut */}
      <nav className="hidden sm:block border-b border-gray-200 bg-white sticky top-[73px] z-40">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={tab.onClick}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-none border-b-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-[#4f75ff] text-[#4f75ff] bg-[#e8f0ff]/50' 
                      : 'border-transparent text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Button>
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
            const isActive = activeTab === tab.id;
            
            // Fonction pour raccourcir les labels sur mobile
            const getMobileLabel = (label: string) => {
              if (label === 'Fil d\'idées') return 'Idées';
              if (label === 'Mes contributions') return 'Mes idées';
              if (label === 'Partager une idée') return 'Créer';
              if (label === 'Groupes de travail') return 'Groupes';
              return label;
            };
            
            return (
              <Button
                key={tab.id}
                variant="ghost"
                onClick={tab.onClick}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-0 flex-1 max-w-[80px] ${
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
            );
          })}
        </div>
      </nav>
    </>
  );
}