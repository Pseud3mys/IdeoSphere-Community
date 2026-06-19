import { useState } from 'react';
import { useEntityStoreSimple, useGroupActions, useNavigationActions } from '../hooks';
import { Group, Location } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { clientConfig, getGroupTypes } from '../config/clientConfig';
import { toast } from 'sonner@2.0.3';
import { GroupTypeBadge } from './group/GroupTypeBadge';
import { LocationSearch } from './LocationSearch';
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from 'lucide-react';

type Step = 1 | 2;

export function AdminDirectGroupCreationTab() {
  const { currentUser } = useEntityStoreSimple();
  const { createDirectGroup } = useGroupActions();
  const { goToGroup } = useNavigationActions();

  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<Group | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Group['type']>('community');
  const [location, setLocation] = useState<Location | string>('');
  const [tags, setTags] = useState('');

  const resetForm = () => {
    setStep(1);
    setIsLoading(false);
    setCreatedGroup(null);
    setName('');
    setDescription('');
    setType('community');
    setLocation('');
    setTags('');
  };

  const handleNext = () => {
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

  const handleCreate = async () => {
    if (!currentUser || !currentUser.isRegistered) {
      toast.error('Vous devez être enregistré pour valider un groupe');
      return;
    }

    setIsLoading(true);

    try {
      const locationData: Location =
        typeof location === 'string' || !location
          ? { label: '', lon: 0, lat: 0 }
          : location;

      const group = await createDirectGroup({
        name,
        description,
        shortDescription: description,
        type,
        location: locationData,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
      });

      setCreatedGroup(group);
      toast.success('Groupe validé et activé avec succès');
    } catch (error) {
      console.error('❌ [AdminDirectGroupCreationTab] Erreur création directe groupe:', error);
      toast.error('Erreur lors de la validation du groupe');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewGroup = () => {
    if (createdGroup) {
      goToGroup(createdGroup.id);
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Validation directe d'un groupe
        </CardTitle>
        <CardDescription>
          Création immédiate par un admin, sans étape de co-fondateurs.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {!createdGroup ? (
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                1
              </div>
              <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                2
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <Label htmlFor="admin-group-name" className="mb-2 block">Nom du groupe *</Label>
                  <Input
                    id="admin-group-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={clientConfig.examples.group.namePlaceholder}
                    maxLength={100}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-group-description" className="mb-2 block">Description *</Label>
                  <Textarea
                    id="admin-group-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Décrivez brièvement les objectifs et activités du groupe..."
                    rows={3}
                    maxLength={300}
                  />
                  <p className="text-sm text-gray-500 mt-1">{description.length}/300 caractères</p>
                </div>

                <div>
                  <Label htmlFor="admin-group-type" className="mb-2 block">Type de groupe *</Label>
                  <Select value={type} onValueChange={(value) => setType(value as Group['type'])}>
                    <SelectTrigger id="admin-group-type">
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
                    {getGroupTypes().find(groupType => groupType.id === type)?.description}
                  </p>
                </div>

                <div>
                  <Label htmlFor="admin-group-location" className="mb-2 block">Localisation (optionnel)</Label>
                  <LocationSearch
                    initialLocation={location}
                    onLocationSelect={(loc) => setLocation(loc || '')}
                    placeholder={clientConfig.examples.group.locationPlaceholder}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-group-tags" className="mb-2 block">Tags (optionnel, séparés par des virgules)</Label>
                  <Input
                    id="admin-group-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder={clientConfig.examples.group.tagsPlaceholder}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={resetForm}>
                    Réinitialiser
                  </Button>
                  <Button onClick={handleNext}>
                    Suivant
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
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
                    <div className="text-sm text-gray-600">Tags</div>
                    <div className="text-sm">{tags.trim() ? tags : 'Aucun tag'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Validation</div>
                    <div className="text-sm">Création directe d'un groupe actif par un administrateur</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm">
                    Ce groupe sera activé immédiatement après validation. Aucun co-fondateur n'est requis.
                  </p>
                </div>

                <div className="flex justify-between gap-2 pt-2">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                  <Button onClick={handleCreate} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Validation...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Valider le groupe
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-green-600" />
            </div>

            <div>
              <h3 className="text-xl mb-2">Groupe validé avec succès</h3>
              <p className="text-gray-600">
                Le groupe est désormais actif et visible immédiatement dans l'application.
              </p>
            </div>

            <div className="bg-slate-50 border rounded-lg p-4 text-left">
              <div className="text-sm space-y-1">
                <div><strong>Groupe :</strong> {createdGroup.name}</div>
                <div><strong>Statut :</strong> Actif</div>
                <div><strong>Type :</strong> {createdGroup.type}</div>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" onClick={resetForm}>
                Créer un autre groupe
              </Button>
              <Button onClick={handleViewGroup}>
                Voir le groupe
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}