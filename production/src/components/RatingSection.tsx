import { useState } from 'react';
import { Idea, User, RatingCriterion, Rating } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Edit3 } from 'lucide-react';
import { motion } from 'motion/react';

interface RatingSectionProps {
  project: Idea;
  currentUser: User;
}

export function RatingSection({ project, currentUser }: RatingSectionProps) {
  // Récupérer les actions directement depuis l'Entity Store
  const { actions } = useEntityStoreSimple();
  
  const [selectedCriterion, setSelectedCriterion] = useState<string | null>(null);

  // ✅ S'assurer que ratings existe toujours (peut être undefined si pas encore de notes)
  const ratings = project.ratings || [];

  const calculateAverageRating = (criterionId: string): number => {
    const criterionRatings = ratings.filter(r => r.criterionId === criterionId);
    if (criterionRatings.length === 0) return 0;
    const sum = criterionRatings.reduce((acc, rating) => acc + rating.value, 0);
    return sum / criterionRatings.length;
  };

  const getUserRating = (criterionId: string): Rating | undefined => {
    return ratings.find(r => r.criterionId === criterionId && r.userId === currentUser.id);
  };

  const getRatingCount = (criterionId: string): number => {
    return ratings.filter(r => r.criterionId === criterionId).length;
  };

  const getLabelForValue = (criterion: RatingCriterion, value: number): string => {
    const scaleItem = criterion.scale.find(s => s.value === Math.round(value));
    return scaleItem ? scaleItem.label : '';
  };

  const getProgressColor = (criterionId: string, value: number): string => {
    if (criterionId === 'potential') {
      if (value >= 4) return 'bg-blue-500';
      if (value >= 3) return 'bg-blue-400';
      return 'bg-blue-300';
    }
    if (criterionId === 'feasibility') {
      if (value >= 4) return 'bg-green-500';
      if (value >= 3) return 'bg-green-400';
      return 'bg-green-300';
    }
    if (criterionId === 'completion') {
      if (value >= 4) return 'bg-purple-500';
      if (value >= 3) return 'bg-purple-400';
      return 'bg-purple-300';
    }
    return 'bg-gray-400';
  };

  const averageCompletion = calculateAverageRating('completion');
  const isReadyForProject = averageCompletion >= 4.5;

  const handleRate = (criterionId: string, value: number) => {
    actions.rateIdea(project.id, criterionId, value);
    setSelectedCriterion(null);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Évaluation</CardTitle>
          {isReadyForProject && (
            <Badge variant="default" className="bg-green-600 text-xs">
              🚀 Prête
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {project.ratingCriteria.map((criterion) => {
          const averageRating = calculateAverageRating(criterion.id);
          const userRating = getUserRating(criterion.id);
          const ratingCount = getRatingCount(criterion.id);
          const progressValue = (averageRating / 5) * 100;
          const progressColor = getProgressColor(criterion.id, averageRating);
          // Afficher la moyenne si elle existe
          const showAverage = averageRating > 0;

          return (
            <div 
              key={criterion.id} 
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">{criterion.name}</span>
                  {showAverage && (
                    <div>
                      <Badge variant="outline" className="text-xs px-2 py-0 hidden md:inline-flex">
                        {getLabelForValue(criterion, averageRating)}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {showAverage && (
                    <span className="text-sm font-medium text-gray-900">
                      {averageRating.toFixed(1)}/5
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCriterion(
                      selectedCriterion === criterion.id ? null : criterion.id
                    )}
                    className="h-8 w-8 sm:h-6 sm:w-6 p-0"
                  >
                    <Edit3 className="w-4 h-4 sm:w-3 sm:h-3" />
                  </Button>
                </div>
              </div>

              {showAverage ? (
                <div className="relative">
                  <Progress value={progressValue} className="h-2" />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full transition-all ${progressColor}`}
                    style={{ width: `${progressValue}%` }}
                  />
                </div>
              ) : (
                <div className="relative">
                  <Progress value={0} className="h-2" />
                  <div className="absolute top-0 left-0 h-2 rounded-full bg-gray-200 w-full" />
                </div>
              )}

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{criterion.description}</span>
                {showAverage && (
                  <span>
                    {ratingCount} éval{ratingCount > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {userRating && (
                <div className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1 inline-block">
                  Votre note : {userRating.value}/5 ({getLabelForValue(criterion, userRating.value)})
                </div>
              )}

              {selectedCriterion === criterion.id && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">Cliquez pour noter :</p>
                  <div className="grid grid-cols-5 gap-2 sm:gap-1">
                    {criterion.scale.map((scaleItem) => (
                      <button
                        key={scaleItem.value}
                        onClick={() => handleRate(criterion.id, scaleItem.value)}
                        className={`p-3 sm:p-2 rounded text-xs transition-colors border min-h-[48px] sm:min-h-auto ${
                          userRating?.value === scaleItem.value
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-accent border-border'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-medium">{scaleItem.value}</div>
                          <div className="text-xs opacity-75 hidden md:block">{scaleItem.label}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {isReadyForProject && (
          <div 
            className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4"
          >
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-green-600">🎉</span>
              <h4 className="text-sm text-green-800">Prête pour financement</h4>
            </div>
            <p className="text-xs text-green-700">
              Niveau de complétude suffisant pour devenir un projet financé.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}