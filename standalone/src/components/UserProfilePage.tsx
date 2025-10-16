import { useState, useRef } from 'react';
import { User, Idea } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ContactUserDialog } from './ContactUserDialog';
import { 
  User as UserIcon, 
  Edit, 
  Save, 
  X,
  Heart, 
  Lightbulb, 
  Users, 
  Calendar,
  Star,
  Zap,
  MessageSquare,
  TrendingUp,
  ArrowUp,
  Settings,
  Trash2,
  Shield,
  Camera,
  Upload,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { resizeImageTo200x200, validateImageFile, uploadUserAvatar } from '../api/avatarService';

interface UserProfilePageProps {
  user: User;
  isOwnProfile?: boolean;
  onUpdateProfile?: (user: Partial<User>) => void;
  onBack: () => void;
}

export function UserProfilePage({ 
  user, 
  isOwnProfile = false, 
  onUpdateProfile,
  onBack 
}: UserProfilePageProps) {
  // Récupération des données depuis l'Entity Store
  const { getAllIdeas, actions } = useEntityStoreSimple();
  const ideas = getAllIdeas();

  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(user.bio || '');
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statistiques élogieuses de l'utilisateur
  const userIdeas = ideas.filter(i => i.creators?.some(c => c.id === user.id));
  const supportedIdeas = ideas.filter(i => i.supporters?.some(s => s.id === user.id));
  const collaboratedIdeas = ideas.filter(i => 
    i.creators?.some(c => c.id === user.id) || 
    i.ratings?.some(r => r.userId === user.id)
  );
  
  const stats = {
    ideasCreated: userIdeas.length,
    totalSupports: userIdeas.reduce((sum, idea) => sum + (idea.supporters?.length || 0), 0),
    ideasSupported: supportedIdeas.length,
    collaborations: collaboratedIdeas.length,
    avgRating: userIdeas.length > 0 
      ? userIdeas.reduce((sum, idea) => {
          const ratings = idea.ratings;
          if (ratings.length === 0) return sum;
          const avgForIdea = ratings.reduce((rSum, r) => rSum + r.value, 0) / ratings.length;
          return sum + avgForIdea;
        }, 0) / userIdeas.length 
      : 0
  };

  // Activités récentes simulées
  const recentActivities = [
    {
      id: '1',
      type: 'idea_created',
      description: `A créé l'idée "${userIdeas[0]?.title || 'Nouvelle idée'}"`,
      time: 'Il y a 2 jours',
      icon: <Lightbulb className="w-4 h-4 text-blue-600" />
    },
    {
      id: '2', 
      type: 'idea_supported',
      description: 'A soutenu 3 nouvelles idées de la communauté',
      time: 'Il y a 4 jours',
      icon: <Heart className="w-4 h-4 text-green-600" />
    },
    {
      id: '3',
      type: 'collaboration',
      description: 'A rejoint une collaboration sur un projet local',
      time: 'Il y a 1 semaine',
      icon: <Users className="w-4 h-4 text-purple-600" />
    }
  ].slice(0, userIdeas.length > 0 ? 3 : 1);

  const handleSaveProfile = () => {
    if (onUpdateProfile) {
      onUpdateProfile({ bio: editedBio });
      setIsEditing(false);
      toast.success('Profil mis à jour ! 👤');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Valider le fichier
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Fichier invalide');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      
      // Redimensionner l'image
      const resizedImageDataUrl = await resizeImageTo200x200(file);
      setPreviewAvatar(resizedImageDataUrl);
      
      // Simuler l'upload
      const avatarUrl = await uploadUserAvatar(user.id, resizedImageDataUrl);
      
      // Mettre à jour le profil
      if (onUpdateProfile) {
        onUpdateProfile({ avatar: avatarUrl });
        toast.success('Photo de profil mise à jour ! 📸');
      }
      
      setIsEditingAvatar(false);
      setPreviewAvatar(null);
      
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload de la photo');
    } finally {
      setIsUploadingAvatar(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarClick = () => {
    if (!isOwnProfile) return;
    setIsEditingAvatar(true);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteAccount = () => {
    // Action de suppression via le store
    actions.rawActions.removeUser(user.id);
    
    // Si c'est le compte actuel, déconnecter
    if (isOwnProfile) {
      actions.rawActions.setCurrentUserId(null);
      actions.goToTab('welcome');
    }
    
    toast.success('Compte supprimé avec succès');
    onBack();
  };

  const currentUser = user; // Assuming current user for contact dialog

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-6">
          ← Retour
        </Button>
        
        <div className="flex items-start space-x-6">
          <div className="relative">
            <Avatar 
              className={`w-24 h-24 ${isOwnProfile ? 'cursor-pointer transition-opacity hover:opacity-80' : ''} ${isUploadingAvatar ? 'opacity-50' : ''}`}
              onClick={handleAvatarClick}
            >
              <AvatarImage src={previewAvatar || user.avatar} alt={user.name} />
              <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user.name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <>
                {isUploadingAvatar ? (
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Loader2 className="w-3 h-3 text-white animate-spin" />
                  </div>
                ) : (
                  <div className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/80 transition-colors"
                       onClick={handleAvatarClick}>
                    <Camera className="w-3 h-3 text-white" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="mb-2">{user.name}</h1>
                <p className="text-muted-foreground mb-1">
                  {user.location || 'Membre de la communauté'}
                </p>
                <p className="text-sm text-muted-foreground flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {user.isRegistered 
                      ? `Membre depuis ${user.createdAt.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`
                      : 'Visiteur'}
                  </span>
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isOwnProfile && (
                  <ContactUserDialog user={user} currentUser={currentUser} />
                )}
                
                {isOwnProfile && (
                  <>
                    {isEditing ? (
                      <>
                        <Button onClick={handleSaveProfile} size="sm">
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setIsEditing(false);
                            setEditedBio(user.bio || '');
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Modifier
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4">
              {isEditing ? (
                <Textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  placeholder="Partagez quelques mots sur vous, vos passions, ce qui vous motive..."
                  rows={3}
                  className="resize-none"
                />
              ) : (
                <p className="text-muted-foreground">
                  {user.bio || "Cet utilisateur n'a pas encore ajouté de description."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques élogieuses */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <span>Contribution à la communauté</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                <Lightbulb className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-2xl text-primary mb-1">{stats.ideasCreated}</div>
              <div className="text-sm text-muted-foreground">Idées créées</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                <ArrowUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl text-green-600 mb-1">{stats.totalSupports}</div>
              <div className="text-sm text-muted-foreground">Soutiens reçus</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                <Heart className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-2xl text-purple-600 mb-1">{stats.ideasSupported}</div>
              <div className="text-sm text-muted-foreground">Idées soutenues</div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-2xl text-orange-600 mb-1">{stats.collaborations}</div>
              <div className="text-sm text-muted-foreground">Collaborations</div>
            </div>
          </div>

          {/* Message élogieux basé sur les stats */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Star className="w-4 h-4 text-primary" />
              </div>
              <div>
                {/* Remarques sur le profil supprimées */}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span>Activité récente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}

            {userIdeas.length === 0 && supportedIdeas.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune activité récente</p>
                <p className="text-sm">Commencez par créer une idée ou soutenir la communauté !</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres du compte - Uniquement pour son propre profil ET utilisateur enregistré */}
      {isOwnProfile && user.isRegistered && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-gray-600" />
              <span>Paramètres du compte</span>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Section Suppression de compte */}
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="w-4 h-4 text-red-600" />
                <Label className="font-medium text-red-800">Zone dangereuse</Label>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-red-700">
                  La suppression de votre compte est définitive et ne peut pas être annulée.
                </p>
                
                {/* Suppression de compte */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Supprimer mon compte
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer votre compte</AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>
                          <strong>Cette action est irréversible.</strong> En supprimant votre compte :
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          <li>Toutes vos données personnelles seront effacées</li>
                          <li>Vos idées et contributions resteront visibles mais anonymisées</li>
                          <li>Vous ne pourrez plus accéder à votre compte</li>
                          <li>Cette action ne peut pas être annulée</li>
                        </ul>
                        <p className="text-sm text-gray-600">
                          Êtes-vous sûr(e) de vouloir continuer ?
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteAccount}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Oui, supprimer mon compte
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Info légale */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note :</strong> Conformément au RGPD, vous avez le droit de consulter, 
                modifier ou supprimer vos données personnelles. Pour toute question, 
                contactez-nous à privacy@ideosphere.org
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dialog pour modifier l'avatar */}
      {isEditingAvatar && (
        <AlertDialog open={isEditingAvatar} onOpenChange={setIsEditingAvatar}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Modifier votre photo de profil</AlertDialogTitle>
              <AlertDialogDescription>
                Téléchargez une nouvelle photo de profil. Elle sera automatiquement redimensionnée en 200x200 pixels.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={previewAvatar || user.avatar} alt="Aperçu" />
                  <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    {user.name.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Button 
                    onClick={handleUploadClick} 
                    variant="outline" 
                    className="w-full"
                    disabled={isUploadingAvatar}
                  >
                    {isUploadingAvatar ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Choisir une photo
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés : JPG, PNG, WebP (max 5MB)
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Conseil :</strong> Utilisez une photo où votre visage est bien visible et centré. 
                  L'image sera automatiquement recadrée en carré et redimensionnée.
                </p>
              </div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setIsEditingAvatar(false);
                  setPreviewAvatar(null);
                }}
                disabled={isUploadingAvatar}
              >
                Fermer
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}