import { useEffect, useState } from 'react';
import { User } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, MapPin, Calendar, Target, Heart, MessageSquare } from 'lucide-react';
import { fetchUserStats, UserStats } from '../api/userService';

interface UserProfilePagePublicProps {
  userId: string;
  onBack: () => void;
}

export function UserProfilePagePublic({ userId, onBack }: UserProfilePagePublicProps) {
  const { getCurrentUser, getUserById } = useEntityStoreSimple();
  const currentUser = getCurrentUser();
  const user = getUserById(userId);

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoadingStats(true);
    fetchUserStats(userId).then((data) => {
      if (isMounted) {
        setStats(data);
        setLoadingStats(false);
      }
    });
    return () => { isMounted = false; };
  }, [userId]);

  // getUserById retourne unknownUser si non trouvé, vérifier si c'est un vrai utilisateur
  if (!user || user.id === 'unknown') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <div className="text-center py-12">
          <p className="text-gray-500">Utilisateur non trouvé</p>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  // Format de date de création du compte
  const formatMemberSince = (date: Date) => {
    return date.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header avec retour */}
      <Button variant="ghost" onClick={onBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      {/* Profil principal */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar et infos de base */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {user.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">{user.name}</h1>
              
              {user.location && (
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{user.location.label}</span>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                <span>
                  {user.isRegistered 
                    ? `Membre depuis ${formatMemberSince(user.createdAt)}`
                    : 'Visiteur'}
                </span>
              </div>

              {isOwnProfile && (
                <Button variant="outline" size="sm">
                  Modifier
                </Button>
              )}
            </div>

            {/* Description et statistiques */}
            <div className="flex-1">
              {user.bio && (
                <div className="mb-6">
                  <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Statistiques de contribution (API) */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Contribution à la communauté</h3>
                {loadingStats ? (
                  <div className="text-center text-gray-400">Chargement des statistiques...</div>
                ) : stats ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                        <Target className="w-4 h-4" />
                        <span className="text-xl font-semibold">{stats.ideasCount}</span>
                      </div>
                      <p className="text-sm text-gray-600">posts publiés</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-purple-600 mb-1">
                        <Heart className="w-4 h-4" />
                        <span className="text-xl font-semibold">{stats.supportsReceived}</span>
                      </div>
                      <p className="text-sm text-gray-600">Soutiens reçus</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 text-green-600 mb-1">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-xl font-semibold">{stats.ideasSupported}</span>
                      </div>
                      <p className="text-sm text-gray-600">Idées soutenues</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">Aucune statistique disponible</div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}