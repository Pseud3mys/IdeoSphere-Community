/**
 * CreateGroupFlow - Flux de création de groupe avec Noyau Initial (Phase 2)
 * 
 * 3 étapes :
 * 1. Formulaire de base (nom, description, type)
 * 2. Sélection de 2+ co-fondateurs
 * 3. Confirmation et état d'attente
 */

import { useState } from 'react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useGroupActions } from '../hooks/useGroupActions';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { Group, User } from '../types';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { clientConfig } from '../config/clientConfig';
import { Checkbox } from './ui/checkbox';
import { toast } from 'sonner@2.0.3';
import { GroupTypeBadge } from './group/GroupTypeBadge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Users, Lightbulb, ArrowRight, ArrowLeft, Check, Loader2, Mail, X } from 'lucide-react';
import { getGroupTypes } from '../config/clientConfig';

interface CreateGroupFlowProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 1 | 2 | 3;

export function CreateGroupFlow({ isOpen, onClose }: CreateGroupFlowProps) {
  const { getAllUsers, currentUser } = useEntityStoreSimple();
  const { createPendingGroup } = useGroupActions();
  const { goToGroups } = useNavigationActions();

  // État du formulaire
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // Step 1 : Informations de base
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Group['type']>('community');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('');
  
  // Step 2 : Co-fondateurs
  const [selectedFounders, setSelectedFounders] = useState<string[]>([]);
  const [founderEmails, setFounderEmails] = useState<string[]>([]); // Emails manuels
  const [emailInput, setEmailInput] = useState('');
  
  // Step 3 : Résultat
  const [createdPendingGroupId, setCreatedPendingGroupId] = useState<string | null>(null);

  const allUsers = getAllUsers();
  const availableUsers = allUsers.filter(u => u.id !== currentUser?.id);

  const handleReset = () => {
    setStep(1);
    setName('');
    setDescription('');
    setType('community');
    setLocation('');
    setTags('');
    setSelectedFounders([]);
    setFounderEmails([]);
    setEmailInput('');
    setCreatedPendingGroupId(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleStep1Next = () => {
    if (!name.trim()) {
      toast.error('Veuillez saisir un nom pour le groupe');
      return;
    }
    if (!description.trim()) {
      toast.error('Veuillez saisir une description');
      return;
    }
    setStep(2);
  };

  const handleStep2Next = () => {
    const totalFounders = selectedFounders.length + founderEmails.length;
    if (totalFounders < 2) {
      toast.error('Veuillez sélectionner au moins 2 co-fondateurs (sélection ou email)');
      return;
    }
    setStep(3);
  };

  const handleCreateGroup = async () => {
    if (!currentUser || !currentUser.isRegistered) {
      toast.error('Vous devez être enregistré pour créer un groupe');
      return;
    }

    setIsLoading(true);
    try {
      const pendingGroup = await createPendingGroup(
        {
          name,
          description,
          shortDescription: description, // Utiliser la même valeur
          type,
          location,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        },
        selectedFounders,
        founderEmails // Passer les emails en paramètre supplémentaire
      );

      setCreatedPendingGroupId(pendingGroup.id);
      toast.success('Groupe créé ! En attente de confirmation des co-fondateurs.');
      
      console.log(`✅ [CreateGroupFlow] Groupe pending ${pendingGroup.id} créé avec succès`);
    } catch (error) {
      console.error('❌ [CreateGroupFlow] Erreur création groupe:', error);
      toast.error('Erreur lors de la création du groupe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMyGroups = () => {
    handleClose();
    if (goToGroups) {
      goToGroups();
    }
  };

  const toggleFounder = (userId: string) => {
    setSelectedFounders(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;
    
    // Validation basique d'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Veuillez saisir un email valide');
      return;
    }

    // Vérifier si déjà ajouté
    if (founderEmails.includes(email)) {
      toast.error('Cet email a déjà été ajouté');
      return;
    }

    // Vérifier si correspond à un utilisateur sélectionné
    const userWithEmail = allUsers.find(u => u.email.toLowerCase() === email);
    if (userWithEmail && selectedFounders.includes(userWithEmail.id)) {
      toast.error('Cet utilisateur est déjà sélectionné dans la liste');
      return;
    }

    setFounderEmails(prev => [...prev, email]);
    setEmailInput('');
    toast.success('Email ajouté (sera vérifié lors de la création)');
  };

  const removeEmail = (email: string) => {
    setFounderEmails(prev => prev.filter(e => e !== email));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Créer un Groupe
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Informations de base du groupe"}
            {step === 2 && `Sélectionnez au moins 2 co-fondateurs (${selectedFounders.length + founderEmails.length} au total)`}
            {step === 3 && "Récapitulatif et confirmation"}
          </DialogDescription>
        </DialogHeader>

        {/* Indicateur de progression */}
        <div className="flex items-center justify-center gap-2 my-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {step > 1 ? <Check className="w-4 h-4" /> : '1'}
          </div>
          <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            {step > 2 ? <Check className="w-4 h-4" /> : '2'}
          </div>
          <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
            3
          </div>
        </div>

        {/* Step 1 : Informations de base */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nom du groupe *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={clientConfig.examples.group.namePlaceholder}
                maxLength={100}
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Décrivez brièvement les objectifs et activités du groupe..."
                rows={3}
                maxLength={300}
              />
              <p className="text-sm text-gray-500 mt-1">{description.length}/300 caractères</p>
            </div>

            <div>
              <Label htmlFor="type">Type de groupe *</Label>
              <Select value={type} onValueChange={(v) => setType(v as Group['type'])}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getGroupTypes().map(groupType => (
                    <SelectItem key={groupType.id} value={groupType.id}>
                      <div className="flex items-center gap-2">
                        <span>{groupType.icon}</span>
                        <span>{groupType.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {getGroupTypes().find(t => t.id === type)?.description}
              </p>
            </div>

            <div>
              <Label htmlFor="location">Localisation (optionnel)</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={clientConfig.examples.group.locationPlaceholder}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (optionnel, séparés par des virgules)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={clientConfig.examples.group.tagsPlaceholder}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleStep1Next}>
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2 : Sélection des co-fondateurs */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm">
                <strong>Noyau Initial :</strong> Pour créer un groupe, vous devez inviter au moins 2 autres personnes comme co-fondateurs. 
                Tous les fondateurs devront confirmer leur participation avant que le groupe soit activé. 
                Vous deviendrez tous animateurs du groupe.
              </p>
            </div>

            {/* Ajout par email */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <Label htmlFor="emailInput">Inviter par email</Label>
                <p className="text-sm text-gray-600 mb-2">
                  Saisissez l'email d'une personne ayant un compte. La vérification sera effectuée lors de la création.
                </p>
                <div className="flex gap-2">
                  <Input
                    id="emailInput"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddEmail()}
                    placeholder="email@exemple.com"
                  />
                  <Button type="button" onClick={handleAddEmail} size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
              </div>

              {/* Liste des emails ajoutés */}
              {founderEmails.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm">Emails ajoutés ({founderEmails.length}) :</div>
                  <div className="flex flex-wrap gap-2">
                    {founderEmails.map(email => (
                      <div key={email} className="flex items-center gap-2 bg-white border rounded-full px-3 py-1">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span className="text-sm">{email}</span>
                        <button
                          onClick={() => removeEmail(email)}
                          className="hover:bg-gray-100 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sélection dans la liste */}
            <div>
              <Label>Ou sélectionnez dans la liste des utilisateurs</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto mt-2">
                {availableUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleFounder(user.id)}
                  >
                    <Checkbox
                      checked={selectedFounders.includes(user.id)}
                      onCheckedChange={() => toggleFounder(user.id)}
                    />
                    <Avatar>
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div>{user.name}</div>
                      {user.location && (
                        <div className="text-sm text-gray-500">{user.location}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              <Button onClick={handleStep2Next}>
                Suivant
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 : Récapitulatif et création */}
        {step === 3 && !createdPendingGroupId && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <div className="text-sm text-gray-600">Nom</div>
                <div>{name}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Type</div>
                <GroupTypeBadge type={type} />
              </div>
              <div>
                <div className="text-sm text-gray-600">Description</div>
                <div className="text-sm">{description}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Co-fondateurs ({selectedFounders.length + founderEmails.length})</div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedFounders.map(userId => {
                    const user = allUsers.find(u => u.id === userId);
                    return user ? (
                      <div key={userId} className="flex items-center gap-2 bg-white border rounded-full px-3 py-1">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.name}</span>
                      </div>
                    ) : null;
                  })}
                  {founderEmails.map(email => (
                    <div key={email} className="flex items-center gap-2 bg-white border rounded-full px-3 py-1">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{email}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm">
                <strong>Prochaines étapes :</strong> Une fois le groupe créé, les co-fondateurs recevront un email pour confirmer leur participation. 
                Le groupe sera activé automatiquement dès que tous auront confirmé (dans un délai de 7 jours).
              </p>
            </div>

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
              <Button onClick={handleCreateGroup} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Créer le groupe
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 : Succès */}
        {step === 3 && createdPendingGroupId && (
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-xl mb-2">Groupe créé avec succès !</h3>
              <p className="text-gray-600">
                Les co-fondateurs vont recevoir un email pour confirmer leur participation.
                Vous pouvez suivre l'avancement dans "Mes Groupes".
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div className="text-sm space-y-1">
                <div><strong>Groupe :</strong> {name}</div>
                <div><strong>Co-fondateurs :</strong> {selectedFounders.length + founderEmails.length} invité{selectedFounders.length + founderEmails.length > 1 ? 's' : ''}</div>
                <div><strong>Statut :</strong> En attente de confirmation</div>
                <div><strong>Expiration :</strong> Dans 7 jours</div>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-4">
              <Button variant="outline" onClick={handleClose}>
                Fermer
              </Button>
              <Button onClick={handleViewMyGroups}>
                <Lightbulb className="w-4 h-4 mr-2" />
                Voir mes groupes
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}