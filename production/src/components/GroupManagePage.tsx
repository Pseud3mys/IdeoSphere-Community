/**
 * GroupManagePage - Page de gestion d'un groupe (animateurs uniquement)
 * 
 * Onglets :
 * - Informations : Modification des infos du groupe
 * - Membres : Liste et gestion des membres (promotion)
 * 
 * Phase 3 de la migration des groupes
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useGroupActions } from '../hooks/useGroupActions';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card } from './ui/card';
import { clientConfig } from '../config/clientConfig';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Users, 
  Settings, 
  UserPlus,
  Crown,
  User as UserIcon,
  Network
} from 'lucide-react';
import { GroupTypeBadge } from './group/GroupTypeBadge';
import { GroupLinksModule } from './group/GroupLinksModule';
import { UserLink } from './UserLink';
import { toast } from 'sonner@2.0.3';
import { Group } from '../types';

interface GroupManagePageProps {
  groupId: string;
}

export function GroupManagePage({ groupId }: GroupManagePageProps) {
  const navigate = useNavigate();
  const { 
    getGroupById, 
    currentUser, 
    isUserAnimatorOfGroup,
    getGroupMembers,
    getGroupAnimators,
    getUserById
  } = useEntityStoreSimple();
  const { updateGroupInfo, promoteToAnimator, loadGroupDetails } = useGroupActions();
  const { goToGroup } = useNavigationActions();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state pour les informations
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    shortDescription: string;
    type: Group['type'];
    avatar?: string;
    banner?: string;
    location?: string;
    tags: string;
  }>({
    name: '',
    description: '',
    shortDescription: '',
    type: 'community',
    avatar: '',
    banner: '',
    location: '',
    tags: '',
  });

  const group = getGroupById(groupId);
  const isAnimator = currentUser ? isUserAnimatorOfGroup(currentUser.id, groupId) : false;

  // Charger les détails du groupe au montage
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await loadGroupDetails(groupId);
      } catch (error) {
        console.error('❌ [GroupManagePage] Erreur chargement:', error);
        toast.error('Erreur lors du chargement du groupe');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [groupId]);

  // Initialiser le formulaire avec les données du groupe
  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description,
        shortDescription: group.shortDescription,
        type: group.type,
        avatar: group.avatar || '',
        banner: group.banner || '',
        location: group.location || '',
        tags: group.tags.join(', '),
      });
    }
  }, [group]);

  // Gestion de la sauvegarde
  const handleSaveInfo = async () => {
    if (!group) return;

    setIsSaving(true);
    try {
      await updateGroupInfo(groupId, {
        name: formData.name,
        description: formData.description,
        shortDescription: formData.shortDescription,
        type: formData.type,
        avatar: formData.avatar || undefined,
        banner: formData.banner || undefined,
        location: formData.location || undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      
      toast.success('Groupe mis à jour avec succès !');
    } catch (error: any) {
      console.error('❌ [GroupManagePage] Erreur sauvegarde:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  // Gestion de la promotion
  const handlePromote = async (userId: string) => {
    try {
      await promoteToAnimator(groupId, userId);
      toast.success('Membre promu en animateur !');
    } catch (error: any) {
      console.error('❌ [GroupManagePage] Erreur promotion:', error);
      toast.error(error.message || 'Erreur lors de la promotion');
    }
  };

  // Protection : vérifier que l'utilisateur est animateur
  if (!isLoading && !isAnimator) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-8 text-center">
          <Crown className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="mb-2">Accès réservé aux animateurs</h2>
          <p className="text-muted-foreground mb-4">
            Vous devez être animateur pour accéder à cette page.
          </p>
          <Button onClick={() => navigate(-1)}>
            Retour
          </Button>
        </Card>
      </div>
    );
  }

  if (isLoading || !group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const animators = getGroupAnimators(groupId);
  const members = getGroupMembers(groupId).filter(m => !animators.some(a => a.id === m.id));

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <img src={group.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${group.id}`} alt={group.name} />
          </Avatar>
          <div className="flex-1">
            <h1 className="mb-2">{group.name}</h1>
            <div className="flex items-center gap-2">
              <GroupTypeBadge type={group.type} />
              <span className="text-sm text-muted-foreground">
                Gestion du groupe
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">
            <Settings className="h-4 w-4 mr-2" />
            Informations
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-2" />
            Membres ({group.memberCount})
          </TabsTrigger>
          <TabsTrigger value="links">
            <Network className="h-4 w-4 mr-2" />
            Liens
          </TabsTrigger>
        </TabsList>

        {/* Onglet Informations */}
        <TabsContent value="info" className="space-y-6">
          <Card className="p-6">
            <h3 className="mb-4">Modifier les informations du groupe</h3>
            
            <div className="space-y-4">
              {/* Nom */}
              <div>
                <label className="text-sm mb-2 block">Nom du groupe</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={clientConfig.examples.group.namePlaceholder}
                />
              </div>

              {/* Description courte */}
              <div>
                <label className="text-sm mb-2 block">Description courte</label>
                <Input
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Une phrase qui résume le groupe"
                />
              </div>

              {/* Description complète */}
              <div>
                <label className="text-sm mb-2 block">Description complète</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description détaillée du groupe..."
                  rows={5}
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm mb-2 block">Type de groupe</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Group['type'] })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="community">Communauté</option>
                  <option value="team">Équipe / Service</option>
                  <option value="project">GT / Projet</option>
                  <option value="local">Antenne Locale</option>
                </select>
              </div>

              {/* Localisation */}
              <div>
                <label className="text-sm mb-2 block">Localisation (optionnel)</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder={clientConfig.examples.group.locationPlaceholder}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm mb-2 block">Tags (séparés par des virgules)</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder={clientConfig.examples.group.tagsPlaceholder}
                />
              </div>

              {/* Avatar URL */}
              <div>
                <label className="text-sm mb-2 block">URL de l'avatar (optionnel)</label>
                <Input
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Bannière URL */}
              <div>
                <label className="text-sm mb-2 block">URL de la bannière (optionnel)</label>
                <Input
                  value={formData.banner}
                  onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <Separator className="my-6" />

            <div className="flex justify-end">
              <Button
                onClick={handleSaveInfo}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Enregistrer les modifications
                  </>
                )}
              </Button>
            </div>
          </Card>
        </TabsContent>

        {/* Onglet Membres */}
        <TabsContent value="members" className="space-y-6">
          {/* Section Animateurs */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3>Animateurs ({animators.length})</h3>
            </div>
            
            <div className="space-y-3">
              {animators.map(member => {
                const user = getUserById(member.id);
                if (!user) return null;
                
                return (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <img src={user.avatar} alt={user.name} />
                      </Avatar>
                      <div>
                        <UserLink userId={user.id} />
                        {user.location && (
                          <p className="text-xs text-muted-foreground">{user.location}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Crown className="h-3 w-3 mr-1" />
                      Animateur
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Section Membres */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon className="h-5 w-5" />
              <h3>Membres ({members.length})</h3>
            </div>
            
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun membre pour le moment
              </p>
            ) : (
              <div className="space-y-3">
                {members.map(member => {
                  const user = getUserById(member.id);
                  if (!user) return null;
                  
                  return (
                    <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <img src={user.avatar} alt={user.name} />
                        </Avatar>
                        <div>
                          <UserLink userId={user.id} />
                          {user.location && (
                            <p className="text-xs text-muted-foreground">{user.location}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePromote(user.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Promouvoir
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Onglet Liens */}
        <TabsContent value="links">
          <GroupLinksModule groupId={groupId} isAnimator={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
