/**
 * PendingGroupCard - Affiche un groupe en attente avec statut des confirmations
 * 
 * Utilisé dans MyGroupsPage pour afficher les groupes pending
 */

import { PendingGroupCreation } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { GroupTypeBadge } from './group/GroupTypeBadge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Users, Clock, Check, AlertCircle } from 'lucide-react';

interface PendingGroupCardProps {
  pendingGroup: PendingGroupCreation;
  onConfirm?: () => void;
  onViewDetails?: () => void;
}

export function PendingGroupCard({ pendingGroup, onConfirm, onViewDetails }: PendingGroupCardProps) {
  const { getUserById, currentUser, getPendingGroupStatus } = useEntityStoreSimple();

  const status = currentUser ? getPendingGroupStatus(pendingGroup.id, currentUser.id) : null;
  const progressPercentage = status ? (status.confirmationCount / status.totalFounders) * 100 : 0;
  
  const hasConfirmed = status?.hasConfirmed ?? false;
  const isComplete = status?.isComplete ?? false;
  const isInitiator = currentUser?.id === pendingGroup.initiatorId;

  // Calculer le temps restant
  const now = new Date();
  const expiresAt = new Date(pendingGroup.expiresAt);
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining <= 2;
  const isExpired = daysRemaining < 0;

  return (
    <Card className={`${isExpired ? 'opacity-60' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 md:gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2 mb-2">
              <CardTitle className="line-clamp-1">{pendingGroup.name}</CardTitle>
              {isInitiator && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded w-fit">
                  Initiateur
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <GroupTypeBadge type={pendingGroup.type} />
              {pendingGroup.location && (
                <span className="text-gray-500">
                  {typeof pendingGroup.location === 'string' ? pendingGroup.location : pendingGroup.location.label}
                </span>
              )}
            </div>
            <CardDescription className="line-clamp-2">
              {pendingGroup.shortDescription}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Statut des confirmations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Confirmations</span>
              <span className="md:hidden">Confirm.</span>
            </span>
            <span>
              {status?.confirmationCount || 0} / {status?.totalFounders || 0}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Liste des fondateurs */}
        <div>
          <div className="text-gray-600 mb-2">Co-fondateurs</div>
          <div className="flex flex-wrap gap-2">
            {pendingGroup.founders.map(founderId => {
              const founder = getUserById(founderId);
              const hasFounderConfirmed = pendingGroup.confirmations.includes(founderId);
              
              return founder ? (
                <div
                  key={founderId}
                  className={`flex items-center gap-1.5 bg-gray-50 border rounded-full px-2.5 py-1 ${
                    hasFounderConfirmed ? 'border-green-500 bg-green-50' : ''
                  }`}
                  title={hasFounderConfirmed ? 'A confirmé' : 'En attente'}
                >
                  <Avatar className="w-5 h-5">
                    <AvatarFallback className="text-xs">{founder.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{founder.name}</span>
                  {hasFounderConfirmed && (
                    <Check className="w-3 h-3 text-green-600" />
                  )}
                </div>
              ) : null;
            })}
          </div>
        </div>

        {/* Temps restant */}
        <div className={`flex items-center gap-2 ${isExpiringSoon ? 'text-amber-600' : 'text-gray-600'} ${isExpired ? 'text-red-600' : ''}`}>
          {isExpired ? (
            <>
              <AlertCircle className="w-4 h-4" />
              <span>Expiré</span>
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              <span>
                {daysRemaining === 0 && "Expire aujourd'hui"}
                {daysRemaining === 1 && "Expire demain"}
                {daysRemaining > 1 && `${daysRemaining} jours restants`}
              </span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 pt-2">
          {!hasConfirmed && !isExpired && (
            <Button onClick={onConfirm} size="sm" className="flex-1 w-full">
              <Check className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Confirmer ma participation</span>
              <span className="md:hidden">Confirmer</span>
            </Button>
          )}
          {hasConfirmed && !isComplete && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded flex-1 justify-center">
              <Check className="w-4 h-4" />
              <span>Vous avez confirmé</span>
            </div>
          )}
          {isComplete && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded flex-1 justify-center">
              <Check className="w-4 h-4" />
              <span>Tous les fondateurs ont confirmé</span>
            </div>
          )}
          <Button variant="outline" onClick={onViewDetails} size="sm">
            Détails
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
