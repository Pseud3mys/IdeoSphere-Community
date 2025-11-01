import React, { useState } from 'react';
import { Search, Users, MapPin, Tag, Info, Clock, UserCheck } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { Community } from '../types';

const CommunityTypeIcons = {
  association: '👥',
  thematic: '💡',
  local: '🏘️',
  project: '🚧',
  education: '📚',
  event: '📅'
};

const CommunityTypeLabels = {
  association: 'Groupe de travail',
  thematic: 'Commission thématique',
  local: 'Comité de quartier',
  project: 'Équipe projet',
  education: 'Formation citoyenne',
  event: 'Événement participatif'
};

interface CommunityCardProps {
  community: Community;
  isJoined: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onViewDetails: () => void;
}

function CommunityCard({ community, isJoined, onJoin, onLeave, onViewDetails }: CommunityCardProps) {
  return (
    <Card className="opacity-60 cursor-not-allowed">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-lg bg-cover bg-center flex-shrink-0"
              style={{ backgroundImage: `url(${community.avatar})` }}
            />
            <div>
              <CardTitle className="text-lg">{community.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm">
                  {CommunityTypeIcons[community.type]} {CommunityTypeLabels[community.type]}
                </span>
                {community.isVerified && (
                  <UserCheck className="w-4 h-4 text-blue-500" title="Groupe vérifié" />
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled
              className="text-xs cursor-not-allowed"
            >
              Bientôt
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled
              className="text-xs cursor-not-allowed"
            >
              <Info className="w-3 h-3 mr-1" />
              Détails
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <CardDescription className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {community.description}
        </CardDescription>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {community.location}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {community.memberCount} membres
          </div>
          <div>
            {community.ideaCount} idées
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {community.tags.slice(0, 4).map((tag, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </Badge>
          ))}
          {community.tags.length > 4 && (
            <Badge variant="outline" className="text-xs">
              +{community.tags.length - 4}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CommunitiesPage() {
  const {
    getAllCommunities,
    searchCommunities,
    getCurrentUser,
    isUserMemberOfCommunity,
    actions
  } = useEntityStoreSimple();
  const navigation = useNavigationActions();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<Community['type'] | 'all'>('all');

  
  const currentUser = getCurrentUser();
  const allCommunities = getAllCommunities();
  
  // Filtrer les communautés
  const filteredCommunities = searchQuery 
    ? searchCommunities(searchQuery)
    : allCommunities;
    
  const finalCommunities = filterType === 'all' 
    ? filteredCommunities
    : filteredCommunities.filter(c => c.type === filterType);
  
  // Séparer les communautés rejointes et non rejointes
  const joinedCommunities = finalCommunities.filter(community => 
    currentUser ? isUserMemberOfCommunity(currentUser.id, community.id) : false
  );
  
  const availableCommunities = finalCommunities.filter(community => 
    currentUser ? !isUserMemberOfCommunity(currentUser.id, community.id) : true
  );

  const handleJoinCommunity = (communityId: string) => {
    if (currentUser?.isRegistered) {
      actions.joinCommunity(communityId);
    } else {
      navigation.goToSignup();
    }
  };

  const handleLeaveCommunity = (communityId: string) => {
    actions.leaveCommunity(communityId);
  };

  const handleViewDetails = (communityId: string) => {
    navigation.goToCommunity(communityId);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6 relative">
      {/* Bandeau discret "Fonctionnalité à venir" */}
      <div className="sticky top-0 z-30 mb-4">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-center gap-3">
            <Clock className="w-5 h-5 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-primary">
                Fonctionnalité bientôt disponible
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                L'espace communautaire sera activé quand nous aurons suffisamment de membres actifs
              </p>
            </div>
            <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/30">
              À venir
            </Badge>
          </div>
        </div>
      </div>

      {/* Contenu gelé en attendant l'activation */}
      <div className="opacity-70">
        {/* Header explicatif */}
      <div className="text-center space-y-4 mb-8">
        <h1 className="text-2xl font-semibold">Communauté & Groupes de travail</h1>
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-4 border border-blue-200/50 dark:border-blue-700/50">
            <p className="text-muted-foreground mb-2">
              <strong>Notre collectif :</strong> Collectif Blancois citoyen - Le Blanc
            </p>
            <p className="text-muted-foreground text-sm">
              Participez aux groupes de travail thématiques, commissions et équipes projet de notre liste. 
              Chaque espace dispose de discussions ouvertes et permet à tous les citoyens et associations de contribuer et développer leurs propres projets.
            </p>
          </div>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un groupe, commission, comité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            disabled
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Filtres par type */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
              disabled
              className="cursor-not-allowed"
            >
              Toutes
            </Button>
          {Object.entries(CommunityTypeLabels).map(([type, label]) => (
            <Button
              key={type}
              variant={filterType === type ? 'default' : 'outline'}
              size="sm"
              disabled
              className="cursor-not-allowed"
            >
              {CommunityTypeIcons[type as Community['type']]} {label}
            </Button>
          ))}
          </div>
        </div>
      </div>

      {/* Mes groupes de travail */}
      {joinedCommunities.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium flex items-center gap-2">
            <Users className="w-5 h-5" />
            Mes groupes ({joinedCommunities.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {joinedCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                isJoined={true}
                onJoin={() => handleJoinCommunity(community.id)}
                onLeave={() => handleLeaveCommunity(community.id)}
                onViewDetails={() => handleViewDetails(community.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Groupes de travail disponibles */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">
          {joinedCommunities.length > 0 ? 'Autres groupes disponibles' : 'Groupes disponibles'} 
          ({availableCommunities.length})
        </h2>
        
        {availableCommunities.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun groupe trouvé pour votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableCommunities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                isJoined={false}
                onJoin={() => handleJoinCommunity(community.id)}
                onLeave={() => handleLeaveCommunity(community.id)}
                onViewDetails={() => handleViewDetails(community.id)}
              />
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}