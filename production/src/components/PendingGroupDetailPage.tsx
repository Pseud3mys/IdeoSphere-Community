/**
 * PendingGroupDetailPage - Page de détails d'un groupe en attente
 * 
 * Affiche les informations complètes du groupe pending et permet de               {pendingGroup.location && (
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {typeof pendingGroup.location === 'string' ? pendingGroup.location : pendingGroup.location.label}
                  </span>
                </div>
              )}mer
 * sa participation en tant que co-fondateur
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useGroupActions } from '../hooks/useGroupActions';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { GroupTypeBadge } from './group/GroupTypeBadge';
import { Loader2, Users, Clock, Check, AlertCircle, ArrowLeft, MapPin, Tag } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ensureGroupPrefix } from '../utils/idUtils';

export function PendingGroupDetailPage() {
  const { pendingId: urlPendingId } = useParams<{ pendingId: string }>();
  // Ajouter le préfixe "groups/" si nécessaire
  const pendingId = urlPendingId ? ensureGroupPrefix(urlPendingId) : undefined;
  const navigate = useNavigate();
  const { getPendingGroupCreationById, getUserById, currentUser, getPendingGroupStatus } = useEntityStoreSimple();
  const { loadPendingGroupDetails, confirmGroupFounder } = useGroupActions();
  const { goToGroups } = useNavigationActions();

  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!pendingId) return;

      setIsLoading(true);
      try {
        await loadPendingGroupDetails(pendingId);
      } catch (error) {
        console.error('❌ [PendingGroupDetailPage] Erreur chargement:', error);
        toast.error('Erreur lors du chargement des détails');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [pendingId]);

  const pendingGroup = pendingId ? getPendingGroupCreationById(pendingId) : null;
  const status = pendingId && currentUser ? getPendingGroupStatus(pendingId, currentUser.id) : null;

  const hasConfirmed = status?.hasConfirmed ?? false;
  const isComplete = status?.isComplete ?? false;
  const progressPercentage = status ? (status.confirmationCount / status.totalFounders) * 100 : 0;

  // Calculer le temps restant
  const now = new Date();
  const expiresAt = pendingGroup ? new Date(pendingGroup.expiresAt) : null;
  const daysRemaining = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const isExpiringSoon = daysRemaining <= 2;
  const isExpired = daysRemaining < 0;

  const isInitiator = currentUser?.id === pendingGroup?.initiatorId;
  const isFounder = currentUser && pendingGroup?.founders.includes(currentUser.id);

  const handleConfirm = async () => {
    if (!pendingId || !currentUser) return;

    setIsConfirming(true);
    try {
      await confirmGroupFounder(pendingId);
      toast.success('Confirmation enregistrée !', {
        description: isComplete 
          ? 'Le groupe sera activé automatiquement.' 
          : 'En attente des autres co-fondateurs.'
      });
    } catch (error) {
      console.error('❌ [PendingGroupDetailPage] Erreur confirmation:', error);
      toast.error('Erreur lors de la confirmation');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!pendingGroup) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl mb-2">Groupe introuvable</h2>
          <p className="text-gray-600 mb-4">
            Ce groupe en attente n'existe pas ou a expiré.
          </p>
          <Button onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Bouton retour */}
      <Button variant="ghost" onClick={handleBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-4">
          {pendingGroup.avatar && (
            <div className="text-5xl">{pendingGroup.avatar}</div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1>{pendingGroup.name}</h1>
              {isInitiator && (
                <Badge variant="outline">Initiateur</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mb-3">
              <GroupTypeBadge type={pendingGroup.type} />
              {pendingGroup.location && (
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">
                    {typeof pendingGroup.location === 'string' ? pendingGroup.location : pendingGroup.location.label}
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-700">{pendingGroup.shortDescription}</p>
          </div>
        </div>

        {/* Tags */}
        {pendingGroup.tags && pendingGroup.tags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <Tag className="w-4 h-4 text-gray-500" />
            {pendingGroup.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Alerte expiration */}
      {isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-red-900">Ce groupe a expiré</div>
            <div className="text-sm text-red-700">
              La période de confirmation est terminée. Le groupe n'a pas été activé.
            </div>
          </div>
        </div>
      )}

      {isExpiringSoon && !isExpired && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-amber-900">Confirmation urgente requise</div>
            <div className="text-sm text-amber-700">
              {daysRemaining === 0 && "Ce groupe expire aujourd'hui."}
              {daysRemaining === 1 && "Ce groupe expire demain."}
              {daysRemaining === 2 && "Ce groupe expire dans 2 jours."}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        {/* Statut des confirmations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5" />
              Statut des confirmations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Progression</span>
                <span>
                  {status?.confirmationCount || 0} / {status?.totalFounders || 0} confirmé{(status?.confirmationCount || 0) > 1 ? 's' : ''}
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {isComplete && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                <div className="text-sm text-green-900">
                  <div>Tous les co-fondateurs ont confirmé !</div>
                  <div className="text-green-700">Le groupe sera activé automatiquement.</div>
                </div>
              </div>
            )}

            {!isComplete && !isExpired && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div className="text-sm text-blue-900">
                  <div>En attente de confirmation</div>
                  <div className="text-blue-700">
                    {daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''} pour que tous les fondateurs confirment.
                  </div>
                </div>
              </div>
            )}

            {/* Action de confirmation */}
            {isFounder && !hasConfirmed && !isExpired && (
              <Button onClick={handleConfirm} disabled={isConfirming} className="w-full">
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirmation...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmer ma participation
                  </>
                )}
              </Button>
            )}

            {isFounder && hasConfirmed && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="text-green-900">Vous avez confirmé votre participation</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Co-fondateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Co-fondateurs ({pendingGroup.founders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingGroup.founders.map(founderId => {
                const founder = getUserById(founderId);
                const hasFounderConfirmed = pendingGroup.confirmations.includes(founderId);
                const isThisUserInitiator = founderId === pendingGroup.initiatorId;
                
                return founder ? (
                  <div key={founderId} className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{founder.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span>{founder.name}</span>
                        {isThisUserInitiator && (
                          <Badge variant="outline" className="text-xs">Initiateur</Badge>
                        )}
                        {founderId === currentUser?.id && (
                          <Badge variant="outline" className="text-xs">Vous</Badge>
                        )}
                      </div>
                      {founder.location && (
                        <div className="text-sm text-gray-500">
                          {typeof founder.location === 'string' ? founder.location : founder.location.label}
                        </div>
                      )}
                    </div>
                    <div>
                      {hasFounderConfirmed ? (
                        <div className="flex items-center gap-1 text-green-600 text-sm">
                          <Check className="w-4 h-4" />
                          <span>Confirmé</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>En attente</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </CardContent>
        </Card>

        {/* Description complète */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">{pendingGroup.description}</p>
          </CardContent>
        </Card>

        {/* Informations complémentaires */}
        <Card>
          <CardHeader>
            <CardTitle>Informations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date de création</span>
              <span>{new Date(pendingGroup.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Date d'expiration</span>
              <span className={isExpiringSoon ? 'text-amber-600' : ''}>
                {new Date(pendingGroup.expiresAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Type de groupe</span>
              <GroupTypeBadge type={pendingGroup.type} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
