import React, { useMemo } from 'react';
import { Idea, User } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { CreateVersionDialog } from './CreateVersionDialog';
import { 
  GitBranch,
  ThumbsUp,
  Star,
  Eye,
  Calendar,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  FileText,
  MessageSquare,
  ExternalLink,
  Crown,
  Users,
  TrendingUp,
  Lock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface IdeaVersionsTabProps {
  idea: Idea;
  currentUser: User;
  allIdeas: Idea[]; // Toutes les idées pour trouver les versions
  isSupported: boolean;
}

export function IdeaVersionsTab({
  idea,
  currentUser,
  allIdeas,
  isSupported,
}: IdeaVersionsTabProps) {
  // Utilisation du store pour les actions
  const { actions, getAllPosts, getAllDiscussionTopics } = useEntityStoreSimple();
  const allPosts = getAllPosts();
  const allDiscussions = getAllDiscussionTopics();

  // Trouver toutes les idées qui sont des versions de cette idée
  const versionIdeas = useMemo(() => 
    allIdeas.filter(otherIdea => 
      otherIdea.sourceIdeas?.includes(idea.id) && otherIdea.id !== idea.id
    )
  , [allIdeas, idea.id]);

  // Calculer les soutiens pour toutes les versions en une seule fois
  const versionSupports = useMemo(() => {
    const supports: {[key: string]: boolean} = {};
    versionIdeas.forEach(versionIdea => {
      supports[versionIdea.id] = versionIdea.supporters?.some(s => s.id === currentUser.id) || false;
    });
    return supports;
  }, [versionIdeas, currentUser.id]);

  const handleSupport = (versionId: string) => {
    actions.toggleIdeaSupport(versionId);
  };

  const isCreator = idea.creators?.some(c => c.id === currentUser.id) || false;

  // Récupérer les discussions pour cette idée depuis le store
  const discussionTopics = allDiscussions.filter(topic => 
    idea.discussionIds?.includes(topic.id)
  );
  
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <h3 className="text-base md:text-lg">Versions ({versionIdeas.length})</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {isSupported ? (
            <CreateVersionDialog 
              idea={idea}
            >
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Nouvelle version
              </Button>
            </CreateVersionDialog>
          ) : (
            <div className="bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">Création restreinte</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Pour proposer une nouvelle version, vous devez d'abord soutenir cette idée.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Informations sur l'origine de cette idée si applicable */}
      {((idea.sourceIdeas && idea.sourceIdeas.length > 0) || (idea.sourcePosts && idea.sourcePosts.length > 0) || (idea.sourceDiscussions && idea.sourceDiscussions.length > 0)) && (
        <Card className="bg-purple-50/50 border-purple-200">
          <CardHeader className="p-4">
            <CardTitle className="flex items-center space-x-2 text-base">
              <GitBranch className="w-4 h-4 text-purple-600" />
              <span>Cette idée est basée sur</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-4 pt-0">
            {/* Afficher les idées parentes */}
            {idea.sourceIdeas && idea.sourceIdeas.map((parentId: string, index: number) => {
              const parentIdea = allIdeas.find(i => i.id === parentId);
              if (!parentIdea) return null;
              
              return (
                <div key={`idea-${index}`} className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors" onClick={() => actions.viewVersion(parentId)}>
                  <div className="flex-shrink-0">
                    <GitBranch className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-purple-900">{parentIdea.title}</p>
                    <p className="text-xs text-purple-700 mt-1">{parentIdea.summary}</p>
                    <div className="flex items-center space-x-3 text-xs text-purple-600 mt-2">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{parentIdea.supporters?.length || 0} soutiens</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{parentIdea.createdAt.toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                    Idée originale
                  </Badge>
                </div>
              );
            })}
            
            {/* Afficher les posts parents */}
            {idea.sourcePosts && idea.sourcePosts.map((parentId: string, index: number) => {
              const parentPost = allPosts.find(p => p.id === parentId);
              if (!parentPost) return null;
              
              return (
                <div key={`post-${index}`} className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors" onClick={() => actions.goToPost(parentId)}>
                  <div className="flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-purple-900">Post de {parentPost.author.name}</p>
                    <p className="text-xs text-purple-700 mt-1 line-clamp-2">{parentPost.content}</p>
                    <div className="flex items-center space-x-3 text-xs text-purple-600 mt-2">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{parentPost.supporters?.length || 0} soutiens</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{parentPost.createdAt.toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                    Post original
                  </Badge>
                </div>
              );
            })}
            
            {/* Afficher les discussions sources */}
            {idea.sourceDiscussions && idea.sourceDiscussions.map((discussionId: string, index: number) => {
              const sourceDiscussion = allDiscussions.find(d => d.id === discussionId);
              if (!sourceDiscussion) return null;
              
              return (
                <div key={`discussion-${index}`} className="flex items-center space-x-3 p-3 bg-white/60 rounded-lg cursor-pointer hover:bg-white/80 transition-colors">
                  <div className="flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-purple-900">{sourceDiscussion.title}</p>
                    <p className="text-xs text-purple-700 mt-1">Intègre les améliorations proposées dans cette discussion</p>
                    <div className="flex items-center space-x-3 text-xs text-purple-600 mt-2">
                      <div className="flex items-center space-x-1">
                        <ThumbsUp className="w-3 h-3" />
                        <span>{sourceDiscussion.upvotes?.length || 0} votes</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{sourceDiscussion.timestamp?.toLocaleDateString('fr-FR') || 'Date inconnue'}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs bg-purple-100 text-purple-700 border-purple-300">
                    Discussion source
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Versions List - maintenant ce sont des idées normales */}
      <div className="space-y-4">
        {versionIdeas.map(versionIdea => {
          const isAuthor = versionIdea.creators?.some(c => c.id === currentUser.id) || false;
          const hasSupported = versionSupports[versionIdea.id] || false;

          return (
            <Card 
              key={versionIdea.id} 
              className="transition-all hover:border-primary/20 hover:shadow-sm"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <GitBranch className="w-4 h-4 text-blue-600" />
                      <h4 
                        className="font-medium hover:text-primary cursor-pointer"
                        onClick={() => {
                          actions.viewVersion(versionIdea.id);
                        }}
                      >
                        {versionIdea.title}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        Idée basée
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={versionIdea.creators[0]?.avatar} alt={versionIdea.creators[0]?.name} />
                        <AvatarFallback className="text-xs">{versionIdea.creators[0]?.name.slice(0, 1)}</AvatarFallback>
                      </Avatar>
                      <span>
                        {versionIdea.creators.length === 1 
                          ? versionIdea.creators[0].name
                          : versionIdea.creators.length === 2
                            ? `${versionIdea.creators[0].name} et ${versionIdea.creators[1].name}`
                            : `${versionIdea.creators[0].name} et ${versionIdea.creators.length - 1} autre${versionIdea.creators.length > 2 ? 's' : ''}`
                        }
                      </span>
                      <span>•</span>
                      <Calendar className="w-3 h-3" />
                      <span>{versionIdea.createdAt.toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                {/* Description en pleine largeur */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {versionIdea.summary}
                </p>
              </CardHeader>

              {/* Statistiques de la version */}
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{versionIdea.supporters?.length || 0} soutiens</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <GitBranch className="w-3 h-3" />
                      <span>Basée sur cette idée</span>
                    </div>
                    {isAuthor && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="w-3 h-3 mr-1" />
                        Votre version
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSupport(versionIdea.id)}
                      className={`flex items-center space-x-1 ${hasSupported ? 'text-primary' : ''}`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${hasSupported ? 'fill-current' : ''}`} />
                      {hasSupported && (
                        <span className="text-xs">{versionIdea.supporters?.length || 0}</span>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        actions.viewVersion(versionIdea.id);
                      }}
                      className="flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span className="text-xs">Voir</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Message si pas de versions */}
        {versionIdeas.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Aucune version alternative pour le moment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Les versions permettent d'améliorer et faire évoluer cette idée de manière collaborative.
              </p>
              {isSupported ? (
                <CreateVersionDialog 
                  idea={idea}
                >
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Créer la première version
                  </Button>
                </CreateVersionDialog>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Soutenez cette idée pour proposer des améliorations
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Informations sur les versions */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">À propos des versions</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                Les versions sont des idées à part entière basées sur cette idée originale. 
                Elles peuvent être soutenues, évaluées et discutées comme n'importe quelle autre idée.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Debug Panel - Désactivé en production */}
      {/* <StoreDebugPanel 
        idea={idea} 
        allIdeas={allIdeas} 
        allPosts={allPosts}
        versionIdeas={versionIdeas}
      /> */}
    </div>
  );
}

interface StoreDebugPanelProps {
  idea: Idea;
  allIdeas: Idea[];
  allPosts: any[];
  versionIdeas: Idea[];
}

function StoreDebugPanel({ idea, allIdeas, allPosts, versionIdeas }: StoreDebugPanelProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { store } = useEntityStoreSimple();

  // Préparer les données pour l'affichage
  const debugData = {
    currentIdea: {
      id: idea.id,
      title: idea.title,
      sourceIdeas: idea.sourceIdeas || [],
      sourcePosts: idea.sourcePosts || [],
    },
    sourceIdeasInStore: allIdeas.filter(i => idea.sourceIdeas?.includes(i.id)).map(i => ({
      id: i.id,
      title: i.title,
      summary: i.summary
    })),
    sourcePostsInStore: allPosts.filter(p => idea.sourcePosts?.includes(p.id)).map(p => ({
      id: p.id,
      content: p.content.substring(0, 50) + '...',
      author: p.author.name
    })),
    versionsInStore: versionIdeas.map(v => ({
      id: v.id,
      title: v.title,
      sourceIdeas: v.sourceIdeas || []
    })),
    storeCounts: {
      totalIdeas: allIdeas.length,
      totalPosts: allPosts.length,
      versionsFound: versionIdeas.length
    },
    fullStore: {
      ideas: store.ideas,
      posts: store.posts,
      users: store.users
    }
  };

  return (
    <Card className="bg-gray-50 border-gray-300">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <span className="font-mono">🐛</span>
            <span>Debug: État du Store</span>
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4 mr-1" />
                Masquer
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-1" />
                Afficher
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4 pt-2">
          <div className="space-y-4">
            {/* Résumé rapide */}
            <div className="bg-white p-3 rounded border border-gray-200">
              <p className="text-xs font-mono mb-2 text-gray-600">Résumé :</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-gray-600">Idées sources attendues:</span>
                  <span className="ml-2 font-semibold">{idea.sourceIdeas?.length || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Idées sources dans store:</span>
                  <span className="ml-2 font-semibold text-green-600">{debugData.sourceIdeasInStore.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Posts sources attendus:</span>
                  <span className="ml-2 font-semibold">{idea.sourcePosts?.length || 0}</span>
                </div>
                <div>
                  <span className="text-gray-600">Posts sources dans store:</span>
                  <span className="ml-2 font-semibold text-green-600">{debugData.sourcePostsInStore.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Versions trouvées:</span>
                  <span className="ml-2 font-semibold text-blue-600">{versionIdeas.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total idées store:</span>
                  <span className="ml-2 font-semibold">{allIdeas.length}</span>
                </div>
              </div>
            </div>

            {/* JSON complet */}
            <div className="bg-gray-900 text-green-400 p-4 rounded overflow-auto max-h-96 text-xs font-mono">
              <pre>{JSON.stringify(debugData, null, 2)}</pre>
            </div>

            {/* Bouton pour copier */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(JSON.stringify(debugData, null, 2));
                toast('JSON copié dans le presse-papier ! 📋');
              }}
              className="w-full"
            >
              📋 Copier le JSON
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}