import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageSquare, Lightbulb, MessageCircle, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';
import { createPostOnApi } from '../../api/contentService';
import apiClient from '../../api/apiClient';
import { Post } from '../../types';
import { useEntityStoreSimple } from '../../hooks/useEntityStoreSimple';

interface QuickPostComposerProps {
  groupIds?: string[];
  tags?: string[]; // Tags par défaut (ex: ['#FAQ'])
  showContactFields?: boolean;
  onPostCreated?: (post: Post) => void;
  placeholder?: string;
}

type PostType = 'question' | 'suggestion' | 'other';

export function QuickPostComposer({ 
  groupIds = [], 
  tags = [],
  showContactFields = false,
  onPostCreated,
  placeholder = "Partagez votre question, suggestion ou remarque..."
}: QuickPostComposerProps) {
  // Récupération de l'utilisateur connecté depuis l'Entity Store
  const { getCurrentUser } = useEntityStoreSimple();
  const currentUser = getCurrentUser();
  
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>('question');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [guestUserId, setGuestUserId] = useState<string | null>(null);
  const [guestUserData, setGuestUserData] = useState<{ name: string; email: string } | null>(null);

  // Charger les données du compte invité depuis l'API
  const loadGuestUserData = async (userId: string) => {
    try {
      const cleanKey = userId.replace('users/', '');
      const response = await apiClient.get(`/users/${cleanKey}`);
      
      if (response.data) {
        const userData = {
          name: response.data.name || '',
          email: response.data.email || ''
        };
        setGuestUserData(userData);
        
        // Préremplir les champs
        // L'email : Seulement si ce n'est pas un email auto-généré
        if (userData.email && !userData.email.includes('@temp.ideosphere.org')) {
          setEmail(userData.email);
        }
        // Le nom : Seulement si ce n'est pas "Invité"
        if (userData.name && userData.name !== 'Invité') {
          setFirstName(userData.name);
        }
        
        console.log('✅ [QuickPostComposer] Données du compte invité chargées et préremplies:', userData);
      }
    } catch (error) {
      console.error('❌ [QuickPostComposer] Erreur lors du chargement des données invité:', error);
    }
  };

  // Vérifier si on a déjà un utilisateur (connecté ou invité créé précédemment)
  useEffect(() => {
    // Si l'utilisateur est connecté ET enregistré (pas juste le mock "Visiteur")
    if (currentUser && currentUser.isRegistered) {
      console.log('✅ [QuickPostComposer] Utilisateur enregistré connecté:', currentUser.id);
    }
    // Sinon, vérifier si on a déjà un guestUserId stocké en localStorage
    else {
      const storedGuestId = localStorage.getItem('quickpost_guest_user_id');
      if (storedGuestId) {
        setGuestUserId(storedGuestId);
        console.log('✅ [QuickPostComposer] Compte invité existant trouvé:', storedGuestId);
        // Charger les données de ce compte pour préremplir les champs
        loadGuestUserData(storedGuestId);
      } else {
        console.log('ℹ️ [QuickPostComposer] Aucun compte invité trouvé (utilisateur mock ou non connecté)');
      }
    }
  }, [currentUser]);

  const postTypes: { value: PostType; label: string; icon: any; color: string }[] = [
    { value: 'question', label: 'Question', icon: MessageSquare, color: 'text-blue-600' },
    { value: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-amber-600' },
    { value: 'other', label: 'Autre', icon: MessageCircle, color: 'text-gray-600' }
  ];

  /**
   * Crée un utilisateur invité sur le backend
   * Si l'email existe déjà, récupère l'utilisateur existant
   */
  const createGuestUser = async (): Promise<string | null> => {
    const guestData = {
      name: firstName.trim() || 'Invité',
      email: email.trim() || `guest_${Date.now()}@temp.ideosphere.org`,
      isRegistered: false,
      createdAt: new Date()
    };

    try {
      console.log('🔄 Création d\'un utilisateur invité...', guestData);
      const response = await apiClient.post('/users', guestData);
      
      if (response.data && response.data._id) {
        const userId = response.data._id; // L'API retourne déjà "users/123"
        console.log('✅ Utilisateur invité créé:', userId);
        return userId;
      }
      
      console.error('❌ Réponse invalide de l\'API:', response.data);
      return null;
    } catch (error: any) {
      console.error('❌ Erreur lors de la création de l\'utilisateur invité:', error);
      
      // Vérifier si c'est une erreur de doublon d'email
      const errorMessage = error?.response?.data?.message || '';
      if (errorMessage.includes('existe déjà') && guestData.email) {
        console.log('ℹ️ [QuickPost] Email existe déjà, recherche de l\'utilisateur...');
        
        // Essayer de trouver l'utilisateur avec cet email
        try {
          const searchResponse = await apiClient.get(`/users?email=${encodeURIComponent(guestData.email)}`);
          
          if (searchResponse.data && searchResponse.data.length > 0) {
            const existingUser = searchResponse.data[0];
            const userId = existingUser._id;
            console.log('✅ [QuickPost] Utilisateur existant trouvé avec cet email:', userId);
            
            // Stocker les données de cet utilisateur
            setGuestUserData({
              name: existingUser.name || '',
              email: existingUser.email || ''
            });
            
            return userId;
          }
        } catch (searchError) {
          console.error('❌ [QuickPost] Erreur lors de la recherche de l\'utilisateur:', searchError);
        }
      }
      
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }

    if (showContactFields && email.trim() && !isValidEmail(email)) {
      toast.error('Veuillez saisir un email valide');
      return;
    }

    setIsSubmitting(true);

    try {
      let userId: string;

      // 1. Déterminer quel utilisateur utiliser
      if (currentUser && currentUser.isRegistered) {
        // Utilisateur VRAIMENT connecté (pas le mock "Visiteur")
        userId = currentUser.id;
        console.log('✅ [QuickPost] Utilisation de l\'utilisateur enregistré connecté:', userId);
      } else if (guestUserId && guestUserData) {
        // Vérifier si les données ont changé
        const currentEmail = email.trim() || `guest_${Date.now()}@temp.ideosphere.org`;
        const currentName = firstName.trim() || 'Invité';
        
        const emailChanged = currentEmail !== guestUserData.email && !currentEmail.includes('@temp.ideosphere.org');
        const nameChanged = currentName !== guestUserData.name && currentName !== 'Invité';
        
        if (emailChanged || nameChanged) {
          // Les données ont changé, créer un nouveau compte invité
          console.log('🔄 [QuickPost] Données modifiées, création d\'un nouveau compte invité...');
          console.log('   Ancien:', guestUserData);
          console.log('   Nouveau:', { name: currentName, email: currentEmail });
          
          const newGuestId = await createGuestUser();
          
          if (!newGuestId) {
            toast.error('Erreur lors de la création du nouveau profil');
            setIsSubmitting(false);
            return;
          }
          
          // Remplacer l'ancien compte par le nouveau
          localStorage.setItem('quickpost_guest_user_id', newGuestId);
          setGuestUserId(newGuestId);
          setGuestUserData({ name: currentName, email: currentEmail });
          userId = newGuestId;
          console.log('✅ [QuickPost] Nouveau compte invité créé:', userId);
        } else {
          // Utiliser le compte existant
          userId = guestUserId;
          console.log('✅ [QuickPost] Utilisation du compte invité existant:', userId);
        }
      } else if (guestUserId) {
        // On a un guestUserId mais pas les données chargées, on utilise quand même
        userId = guestUserId;
        console.log('✅ [QuickPost] Utilisation du compte invité existant (données non chargées):', userId);
      } else {
        // Créer un nouvel utilisateur invité
        console.log('🔄 [QuickPost] Création d\'un nouveau compte invité...');
        const newGuestId = await createGuestUser();
        
        if (!newGuestId) {
          toast.error('Erreur lors de la création du profil');
          setIsSubmitting(false);
          return;
        }
        
        // Stocker l'ID en localStorage pour réutilisation
        localStorage.setItem('quickpost_guest_user_id', newGuestId);
        setGuestUserId(newGuestId);
        userId = newGuestId;
        console.log('✅ [QuickPost] Nouveau compte invité créé et stocké:', userId);
      }

      // 2. Créer le post
      console.log('🔄 [QuickPost] Création du post avec authorId:', userId);
      const newPost = await createPostOnApi({
        authorId: userId,
        content: content.trim(),
        type: mapPostTypeToApiType(postType),
        groupIds: groupIds.length > 0 ? groupIds : undefined,
        tags: tags.length > 0 ? tags : undefined
      });

      if (newPost) {
        console.log('✅ [QuickPost] Post créé avec succès:', newPost.id);
        toast.success('Votre contribution a été publiée !');
        
        // Réinitialiser le formulaire
        setContent('');
        setFirstName('');
        setEmail('');
        setPostType('question');
        
        // Callback
        if (onPostCreated) {
          onPostCreated(newPost);
        }
      } else {
        console.error('❌ [QuickPost] Échec de la création du post');
        toast.error('Erreur lors de la publication');
      }
    } catch (error: any) {
      console.error('❌ [QuickPost] Erreur lors de la soumission:', error);
      
      // Afficher le message d'erreur du backend si disponible
      const errorMessage = error?.response?.data?.message || error?.message || 'Une erreur est survenue';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mapPostTypeToApiType = (type: PostType): 'general' | 'question' | 'suggestion' | 'technical' => {
    switch (type) {
      case 'question':
        return 'question';
      case 'suggestion':
        return 'suggestion';
      case 'other':
      default:
        return 'general';
    }
  };

  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Partagez votre contribution</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Textarea principale */}
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Sélection du type de post */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Type de contribution</Label>
            <div className="flex gap-2">
              {postTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.value}
                    type="button"
                    variant={postType === type.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPostType(type.value)}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    <Icon className={`h-4 w-4 mr-1 ${postType === type.value ? '' : type.color}`} />
                    {type.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Champs optionnels de contact */}
          {showContactFields && (
            <div className="space-y-3 pt-3 border-t">
              {currentUser && currentUser.isRegistered ? (
                // Utilisateur VRAIMENT connecté (pas juste le mock "Visiteur")
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-green-600" />
                    <p className="text-sm font-medium text-green-800">
                      Connecté en tant que : <span className="font-bold">{currentUser.name}</span>
                    </p>
                  </div>
                </div>
              ) : (
                // Utilisateur non connecté (ou visiteur anonyme) - Afficher champs
                <div className="space-y-3">
                  <p className="text-xs text-gray-600">
                    Optionnel : laissez vos coordonnées pour suivre l'évolution
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="text-xs">Prénom</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Votre prénom"
                        disabled={isSubmitting}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="votre@email.com"
                        disabled={isSubmitting}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bouton de soumission */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Publication...
              </>
            ) : (
              'Publier'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
