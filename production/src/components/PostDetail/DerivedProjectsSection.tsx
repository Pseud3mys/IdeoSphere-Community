import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Lightbulb, ExternalLink } from 'lucide-react';
import { Idea, User } from '../../types';
import { UserLink } from '../UserLink';
import { formatTimeAgo } from './formatTimeAgo';

interface DerivedProjectsSectionProps {
  derivedIdeas: (Idea | undefined)[];
  hasComments: boolean;
  getUserById: (userId: string) => User | undefined;
  onIdeaClick: (ideaId: string) => void;
  onPromoteToIdea: () => void;
}

/**
 * Composant dédié pour afficher la section des projets dérivés d'un post.
 * Affiche :
 * - La liste des projets existants (si present)
 * - Le bouton "Créer un projet" (si au moins un commentaire)
 */
export function DerivedProjectsSection({
  derivedIdeas,
  hasComments,
  getUserById,
  onIdeaClick,
  onPromoteToIdea
}: DerivedProjectsSectionProps) {
  // Debug: afficher les valeurs
  console.log('🔍 DerivedProjectsSection - derivedIdeas.length:', derivedIdeas.length, 'hasComments:', hasComments);
  
  // Ne rien afficher si pas de projets ET pas de commentaires
  if (derivedIdeas.length === 0 && !hasComments) {
    console.log('❌ DerivedProjectsSection - Pas d\'affichage (pas de projets ET pas de commentaires)');
    return null;
  }

  console.log('✅ DerivedProjectsSection - Affichage de la section');

  return (
    <div className="mt-6" data-section="derived-projects">
      {/* Titre de la section - uniquement si des projets existent */}
      {derivedIdeas.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-gray-500" />
          <h3 className="text-base font-medium text-gray-900">
            Projets issus de cette discussion ({derivedIdeas.length})
          </h3>
        </div>
      )}

      {/* Liste des projets existants */}
      {derivedIdeas.length > 0 && (
        <div className="space-y-3 mb-4">
          {derivedIdeas.map(idea => {
            const firstCreator = idea?.creatorIds?.[0] ? getUserById(idea.creatorIds[0]) : null;
            
            return (
              <Card 
                key={idea?.id}
                className="border-gray-200 hover:border-purple-300 hover:bg-purple-50/30 cursor-pointer transition-all"
                onClick={() => idea && onIdeaClick(idea.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
                          Projet
                        </Badge>
                        <span className="text-xs text-gray-500">
                          par <UserLink user={firstCreator || undefined} className="text-gray-700 hover:text-purple-600 font-medium" />
                        </span>
                        <span className="text-xs text-gray-400">• {idea && formatTimeAgo(idea.createdAt)}</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">{idea?.title}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{idea?.summary}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                        <span>{idea?.supporters?.length || 0} soutiens</span>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Bouton "Créer un projet" - Toujours visible si commentaires */}
      {hasComments && (
        <button
          className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50/30 transition-colors text-left group"
          onClick={onPromoteToIdea}
        >
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-gray-400 group-hover:text-purple-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 mb-0.5">Structurer en projet complet</p>
              <p className="text-sm text-gray-600">
                Transformer cette discussion en idée aboutie avec description détaillée et évaluations
              </p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
