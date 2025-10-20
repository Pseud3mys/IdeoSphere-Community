import { ContentChain, ChainNode, getMostRelevantNode, getChainEvolutionSummary } from '../utils/feedChainUtils';
import { Post, Idea, User } from '../types';
import { IdeaCard } from './IdeaCard';
import { PostCard } from './PostCard';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { 
  TrendingUp, 
  GitBranch, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Users,
  MessageSquare,
  Lightbulb,
  ArrowRight
} from 'lucide-react';
import { useState } from 'react';

interface FeedChainProps {
  chain: ContentChain;
  currentUser: User;
  seenItems: Set<string>;
  onIdeaClick: (ideaId: string) => void;
  onPostClick: (postId: string) => void;
  onLike: (postId: string) => void;
  onSupport: (ideaId: string) => void;
  onIgnoreIdea?: (ideaId: string) => void;
  onReportIdea?: (ideaId: string) => void;
  onIgnorePost?: (postId: string) => void;
  onReportPost?: (postId: string) => void;
}

export function FeedChain({
  chain,
  currentUser,
  seenItems,
  onIdeaClick,
  onPostClick,
  onLike,
  onSupport,
  onIgnoreIdea,
  onReportIdea,
  onIgnorePost,
  onReportPost
}: FeedChainProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Obtenir le nœud le plus pertinent à afficher
  const mainNode = getMostRelevantNode(chain, seenItems);
  const evolutionSummary = getChainEvolutionSummary(chain);

  // Si c'est une chaîne d'un seul élément, afficher normalement
  if (chain.totalNodes === 1) {
    return renderSingleNode(mainNode);
  }

  // Affichage d'une chaîne avec plusieurs éléments
  return (
    <div className="space-y-2">
      {/* Indicateur de chaîne */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 text-white p-1.5 rounded-lg">
              <GitBranch className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Chaîne d'inspiration</span>
                {chain.hasUnseen && (
                  <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Nouveau
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-600">{evolutionSummary}</span>
                <span className="text-xs text-gray-400">•</span>
                <div className="flex items-center space-x-1 text-xs text-gray-600">
                  <Users className="w-3 h-3" />
                  <span>{chain.maxSupportCount} soutiens max</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton pour développer/réduire */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Réduire
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Voir la chaîne ({chain.totalNodes})
              </>
            )}
          </Button>
        </div>

        {/* Aperçu de la chaîne (avatars) */}
        {!isExpanded && (
          <div className="flex items-center space-x-2 mt-3 pl-12">
            <div className="flex -space-x-2">
              {chain.nodes.slice(0, 5).map((node, idx) => {
                const author = node.type === 'post' 
                  ? (node.item as Post).author 
                  : (node.item as Idea).creators[0];
                return (
                  <Avatar key={idx} className="w-6 h-6 ring-2 ring-white">
                    <AvatarImage src={author.avatar} alt={author.name} />
                    <AvatarFallback className="text-xs">
                      {author.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                );
              })}
              {chain.totalNodes > 5 && (
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center ring-2 ring-white text-xs text-gray-600">
                  +{chain.totalNodes - 5}
                </div>
              )}
            </div>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              {mainNode.type === 'post' ? (
                <MessageSquare className="w-3 h-3" />
              ) : (
                <Lightbulb className="w-3 h-3" />
              )}
              <span>Dernière contribution</span>
            </div>
          </div>
        )}
      </div>

      {/* Contenu principal (toujours affiché) */}
      {renderSingleNode(mainNode)}

      {/* Chaîne complète (si développée) */}
      {isExpanded && (
        <div className="ml-6 pl-6 border-l-2 border-blue-200 space-y-4">
          <div className="text-sm text-gray-600 mb-3">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Évolution chronologique :
          </div>
          
          {chain.nodes
            .filter(node => node.id !== mainNode.id) // Ne pas afficher le nœud principal deux fois
            .map((node, idx) => (
              <div key={`${node.type}-${node.id}`} className="relative">
                {/* Indicateur de niveau */}
                <div className="absolute -left-9 top-4 flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    node.seenByUser 
                      ? 'bg-gray-200 text-gray-500' 
                      : 'bg-blue-500 text-white'
                  }`}>
                    {node.level}
                  </div>
                </div>

                {/* Carte du contenu */}
                <div className={`${node.seenByUser ? 'opacity-60' : ''}`}>
                  {renderSingleNode(node)}
                </div>

                {/* Badge "Déjà vu" */}
                {node.seenByUser && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="text-xs bg-white">
                      Déjà vu
                    </Badge>
                  </div>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );

  function renderSingleNode(node: ChainNode) {
    if (node.type === 'post') {
      return (
        <PostCard
          key={`post-${node.id}`}
          post={node.item as Post}
          onPostClick={onPostClick}
          onLike={onLike}
          currentUser={currentUser}
          onIgnore={onIgnorePost}
          onReport={onReportPost}
        />
      );
    } else {
      return (
        <IdeaCard
          key={`idea-${node.id}`}
          idea={node.item as Idea}
          onIdeaClick={onIdeaClick}
          onSupport={onSupport}
          currentUser={currentUser}
          onIgnore={onIgnoreIdea}
          onReport={onReportIdea}
        />
      );
    }
  }
}
