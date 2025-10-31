import React, { useState } from 'react';
import { ArrowLeft, Users, MapPin, Calendar, Tag, Settings, Crown, Shield, User, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { IdeaCard } from './IdeaCard';
import { PostCard } from './PostCard';

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
  local: 'Équipe de quartier',
  project: 'Groupe projet',
  education: 'Formation',
  event: 'Événement'
};

const RoleIcons = {
  admin: Crown,
  moderator: Shield,
  member: User
};

const RoleLabels = {
  admin: 'Administrateur',
  moderator: 'Modérateur',
  member: 'Membre'
};

interface CommunityDetailPageProps {
  communityId?: string;  // ID de la communauté à afficher
  onBack?: () => void;
}

export function CommunityDetailPage({ communityId, onBack }: CommunityDetailPageProps = {}) {
  const {
    getCommunityById,
    getCommunityMembers,
    getCurrentUser,
    isUserMemberOfCommunity,
    getCommunityMembership,
    getAllIdeas,
    getAllPosts,
    actions
  } = useEntityStoreSimple();
  const navigation = useNavigationActions();
  
  const [activeTab, setActiveTab] = useState('feed');
  
  const community = communityId ? getCommunityById(communityId) : null;
  const currentUser = getCurrentUser();
  
  if (!community) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Communauté non trouvée.</p>
          {onBack && (
            <Button 
              variant="outline" 
              onClick={onBack}
              className="mt-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux communautés
            </Button>
          )}
        </div>
      </div>
    );
  }
  
  const members = getCommunityMembers(community.id);
  const isJoined = currentUser ? isUserMemberOfCommunity(currentUser.id, community.id) : false;
  const membership = currentUser ? getCommunityMembership(currentUser.id, community.id) : null;
  
  // Filtrer les idées et posts liés à cette communauté (simulation)
  // Dans une vraie app, les idées/posts auraient un champ communityId
  const communityIdeas = getAllIdeas().filter(idea => 
    idea.tags?.some(tag => community.tags.includes(tag)) ||
    idea.location === community.location
  ).slice(0, 6);
  
  const communityPosts = getAllPosts().filter(post => 
    post.tags?.some(tag => community.tags.includes(tag)) ||
    post.location === community.location
  ).slice(0, 6);

  const handleJoinCommunity = () => {
    if (currentUser?.isRegistered) {
      actions.joinCommunity(community.id);
    } else {
      navigation.goToSignup();
    }
  };

  const handleLeaveCommunity = () => {
    actions.leaveCommunity(community.id);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header avec image de bannière */}
      <div className="relative">
        {community.banner && (
          <div 
            className="w-full h-48 rounded-lg bg-cover bg-center"
            style={{ backgroundImage: `url(${community.banner})` }}
          />
        )}
        
        {onBack && (
          <div className="absolute top-4 left-4">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={onBack}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>
        )}
      </div>

      {/* Informations principales */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-start gap-4">
            <div 
              className="w-20 h-20 rounded-xl bg-cover bg-center flex-shrink-0 ring-4 ring-background"
              style={{ backgroundImage: `url(${community.avatar})` }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-semibold">{community.name}</h1>
                <Badge variant="secondary">
                  {CommunityTypeIcons[community.type]} {CommunityTypeLabels[community.type]}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {community.memberCount} membres
                </div>
                <div>
                  {community.ideaCount} idées
                </div>
                {community.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {community.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Créée le {community.createdAt.toLocaleDateString()}
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">{community.shortDescription}</p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {community.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 md:w-48">
          {isJoined ? (
            <>
              <Button variant="outline" onClick={handleLeaveCommunity}>
                Quitter la communauté
              </Button>
              {membership && (
                <div className="text-sm text-center text-muted-foreground">
                  {RoleLabels[membership.role]}
                  {membership.role !== 'member' && (
                    <Button variant="ghost" size="sm" className="ml-2">
                      <Settings className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </>
          ) : (
            <Button onClick={handleJoinCommunity}>
              Rejoindre la communauté
            </Button>
          )}
        </div>
      </div>

      {/* Description complète */}
      <Card>
        <CardHeader>
          <CardTitle>À propos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{community.description}</p>
        </CardContent>
      </Card>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="ideas">Idées ({communityIdeas.length})</TabsTrigger>
          <TabsTrigger value="members">Membres ({members.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feed" className="space-y-6 mt-6">
          <div className="text-center text-muted-foreground py-8">
            <p>Le feed spécifique à cette communauté sera bientôt disponible.</p>
            <p className="text-sm mt-2">En attendant, découvrez les idées et membres liés à cette communauté.</p>
          </div>
        </TabsContent>
        
        <TabsContent value="ideas" className="space-y-4 mt-6">
          {communityIdeas.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Aucune idée liée à cette communauté pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {communityIdeas.map((idea) => (
                <IdeaCard key={idea.id} idea={idea} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="members" className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {members.map((member) => {
              const userMembership = getCommunityMembership(member.id, community.id);
              const RoleIcon = userMembership ? RoleIcons[userMembership.role] : User;
              
              return (
                <Card key={member.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{member.name}</p>
                        <RoleIcon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      </div>
                      {userMembership && (
                        <p className="text-xs text-muted-foreground">
                          {RoleLabels[userMembership.role]}
                        </p>
                      )}
                      {member.location && (
                        <p className="text-xs text-muted-foreground truncate">
                          {member.location}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => actions.fetchUserProfile(member.id)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}