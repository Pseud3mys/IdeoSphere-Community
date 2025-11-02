import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Idea, User, DiscussionTopic } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { RatingSection } from './RatingSection';
import { ShareDialog } from './ShareDialog';
import { IdeaDescriptionTab } from './IdeaDescriptionTab';
import { IdeaDiscussionsTab } from './IdeaDiscussionsTab';
import { IdeaVersionsTab } from './IdeaVersionsTab';
import { getValidAvatar } from '../api/avatarService';

import { 
  ArrowLeft, 
  Heart, 
  Calendar,
  MessageSquare,
  GitBranch,
  FileText,
  Zap,
  Share
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface IdeaDetailPageProps {
  idea: Idea;
  onBack: () => void;
  onPostClick?: (postId: string) => void;
}

export function IdeaDetailPage({ 
  idea, 
  onBack,
  onPostClick
}: IdeaDetailPageProps) {
  // Récupération des données depuis l'Entity Store
  const {
    getCurrentUser,
    getUserById,
    getAllIdeas,
    getAllDiscussionTopics,
    getIdeaById,
    actions
  } = useEntityStoreSimple();

  const currentUser = getCurrentUser();
  const allIdeas = getAllIdeas();
  const discussions = getAllDiscussionTopics();
  
  // Récupérer l'idée la plus récente depuis le store
  const latestIdea = getIdeaById(idea.id) || idea;

  // ✅ Résoudre les créateurs depuis les IDs
  const resolvedCreators = useMemo(() => 
    (latestIdea.creatorIds || [])
      .map(id => getUserById(id))
      .filter(Boolean) as User[]
  , [latestIdea.creatorIds, getUserById]);

  // ✅ Utiliser unknownUser comme fallback pour les invités
  const effectiveUser = currentUser || { id: 'unknown', name: 'Invité', email: '' } as any;

  const [activeTab, setActiveTab] = useState('description');
  
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
  };

  // State pour suivre les onglets déjà chargés
  const loadedTabsRef = useRef<Set<string>>(new Set());
  
  // Fonction memoized pour charger les données selon l'onglet
  const loadTabData = useCallback(async (tab: string, ideaId: string) => {
    const tabKey = `${ideaId}-${tab}`;
    
    // Éviter de recharger les données déjà chargées
    if (loadedTabsRef.current.has(tabKey)) {
      return;
    }
    
    try {
      // Note: Les discussions sont déjà chargées par goToIdea dans navigationActions.ts
      // On ne charge que les onglets qui ne sont pas chargés au démarrage
      if (tab === 'evaluation') {
        await actions.loadIdeaRatings(ideaId);
      } else if (tab === 'versions') {
        await actions.loadIdeaTabData(ideaId, 'versions');
      }
      // L'onglet 'discussions' n'a pas besoin de chargement supplémentaire
      
      // Marquer l'onglet comme chargé
      loadedTabsRef.current.add(tabKey);
    } catch (error) {
      console.error(`❌ Erreur lors du chargement de l'onglet ${tab}:`, error);
    }
  }, []); // Retirer 'actions' des dépendances - actions est stable

  // Chargement progressif des données selon l'onglet actif
  useEffect(() => {
    loadTabData(activeTab, latestIdea.id);
  }, [activeTab, latestIdea.id]); // Retirer loadTabData des dépendances car elle ne change pas vraiment

  const isSupported = useMemo(() => {
    return latestIdea.supporters?.includes(currentUser.id) || false; // ✅ supporters est maintenant string[]
  }, [latestIdea.supporters, currentUser.id]);
  
  const supportCount = useMemo(() => {
    return latestIdea.supporters?.length || 0;
  }, [latestIdea.supporters]);
  
  // Récupérer les discussions liées à cette idée depuis le store
  const discussionTopics = discussions.filter(discussion => 
    latestIdea.discussionIds?.includes(discussion.id)
  );
  
  // Compter les versions (idées basées sur cette idée, pas les sources)
  const versionCount = allIdeas.filter(otherIdea => 
    otherIdea.sourceIdeas?.includes(latestIdea.id) && otherIdea.id !== latestIdea.id
  ).length;

  // Séparer les questions résolues des discussions actives
  const resolvedQuestions = discussionTopics.filter(discussion => 
    discussion.type === 'question' && 
    discussion.posts?.some(post => post.isAnswer === true)
  );
  
  const activeDiscussions = discussionTopics?.filter(topic => {
    if (topic.type === 'question') {
      // Vérifier si cette question a une réponse résolue
      const hasResolvedAnswer = topic.posts?.some(post => post.isAnswer === true);
      return !hasResolvedAnswer; // Exclure si elle a déjà une réponse résolue
    }
    return true; // Garder tous les autres types de discussions
  }) || [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        
        {/* Version mobile optimisée */}
        <div className="block md:hidden mb-6">
          <div className="mb-4">
            <div className="flex items-start space-x-2 mb-2">
              <h1 className="flex-1 leading-tight">{latestIdea.title}</h1>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs flex-shrink-0">
                Projet
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mb-3 leading-relaxed">{latestIdea.summary}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {latestIdea.tags?.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          </div>

          {/* Bouton soutenir mobile - pleine largeur */}
          <Button 
            variant={isSupported ? "default" : "outline"}
            onClick={() => actions.toggleIdeaSupport(latestIdea.id)}
            className="w-full flex items-center justify-center space-x-2 h-11"
          >
            <Heart className={`w-4 h-4 ${isSupported ? 'fill-current' : ''}`} />
            <span>{isSupported ? 'Soutenu' : 'Soutenir'}</span>
            {isSupported && (
              <Badge variant="secondary" className="ml-2">
                {supportCount}
              </Badge>
            )}
          </Button>
          
          {/* Bouton partager mobile */}
          <ShareDialog contentId={latestIdea.id} contentTitle={latestIdea.title} contentType="idea">
            <Button variant="outline" className="w-full flex items-center justify-center space-x-2 h-11 mt-2">
              <Share className="w-4 h-4" />
              <span>Partager</span>
            </Button>
          </ShareDialog>
        </div>

        {/* Version desktop */}
        <div className="hidden md:block">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="mr-4">{latestIdea.title}</h1>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Projet
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{latestIdea.summary}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {latestIdea.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 ml-6">
              <Button 
                variant={isSupported ? "default" : "outline"}
                onClick={() => actions.toggleIdeaSupport(latestIdea.id)}
                className="flex items-center space-x-2"
              >
                <Heart className={`w-4 h-4 ${isSupported ? 'fill-current' : ''}`} />
                <span>{isSupported ? 'Soutenu' : 'Soutenir'}</span>
                {isSupported && (
                  <Badge variant="secondary" className="ml-2">
                    {supportCount}
                  </Badge>
                )}
              </Button>
              
              <ShareDialog contentId={latestIdea.id} contentTitle={latestIdea.title} contentType="idea">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Share className="w-4 h-4" />
                  <span>Partager</span>
                </Button>
              </ShareDialog>
            </div>
          </div>
        </div>

        {/* Creator and co-creators - Version mobile */}
        <div className="block md:hidden mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={getValidAvatar(resolvedCreators[0]?.name || '', resolvedCreators[0]?.avatar)} alt={resolvedCreators[0]?.name} />
              <AvatarFallback>{resolvedCreators[0]?.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {resolvedCreators.length === 0
                  ? 'Créateur inconnu'
                  : resolvedCreators.length === 1 
                    ? resolvedCreators[0].name
                    : resolvedCreators.length === 2
                      ? `${resolvedCreators[0].name} et ${resolvedCreators[1].name}`
                      : `${resolvedCreators[0].name} et ${resolvedCreators.length - 1} autre${resolvedCreators.length > 2 ? 's' : ''}`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {resolvedCreators.length === 1 ? 'Créateur' : 'Créateurs'}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {latestIdea.createdAt.toLocaleDateString('fr-FR')}
            </div>
          </div>
        </div>

        {/* Creator and co-creators - Version desktop */}
        <div className="hidden md:flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={getValidAvatar(resolvedCreators[0]?.name || '', resolvedCreators[0]?.avatar)} alt={resolvedCreators[0]?.name} />
              <AvatarFallback>{resolvedCreators[0]?.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm">
                {resolvedCreators.length === 1 
                  ? resolvedCreators[0].name
                  : resolvedCreators.length === 2
                    ? `${resolvedCreators[0].name} et ${resolvedCreators[1].name}`
                    : `${resolvedCreators[0].name} et ${resolvedCreators.length - 1} autre${resolvedCreators.length > 2 ? 's' : ''}`
                }
              </p>
              <p className="text-xs text-muted-foreground">
                {resolvedCreators.length === 1 ? 'Créateur' : 'Créateurs'}
              </p>
            </div>
          </div>
          
          <Separator orientation="vertical" className="h-8" />
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {latestIdea.createdAt.toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        {/* Tabs mobile - icônes uniquement */}
        <TabsList className="grid w-full grid-cols-4 md:hidden h-16 p-1 bg-gray-100">
          <TabsTrigger value="description" className="flex items-center justify-center h-full relative">
            <FileText className="w-6 h-6" />
            {resolvedQuestions && resolvedQuestions.length > 0 && (
              <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] w-4 h-4 p-0 flex items-center justify-center">
                {resolvedQuestions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center justify-center h-full">
            <Zap className="w-6 h-6" />
          </TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center justify-center h-full relative">
            <MessageSquare className="w-6 h-6" />
            {activeDiscussions && activeDiscussions.length > 0 && (
              <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] w-4 h-4 p-0 flex items-center justify-center">
                {activeDiscussions.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center justify-center h-full relative">
            <GitBranch className="w-6 h-6" />
            {versionCount > 0 && (
              <Badge variant="secondary" className="absolute -top-1 -right-1 text-[10px] w-4 h-4 p-0 flex items-center justify-center">
                {versionCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tabs desktop - texte complet */}
        <TabsList className="hidden md:grid w-full grid-cols-4 h-11 p-1">
          <TabsTrigger value="description" className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>Description</span>
              {resolvedQuestions && resolvedQuestions.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {resolvedQuestions.length}
                </Badge>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center justify-center h-full">Évaluation</TabsTrigger>
          <TabsTrigger value="discussions" className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>Discussions</span>
              {activeDiscussions && activeDiscussions.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {activeDiscussions.length}
                </Badge>
              )}
            </div>
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-1">
              <GitBranch className="w-4 h-4" />
              <span>Versions</span>
              {versionCount > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {versionCount}
                </Badge>
              )}
            </div>
          </TabsTrigger>
        </TabsList>

        {/* Description Tab */}
        <TabsContent value="description">
          <IdeaDescriptionTab
            idea={latestIdea}
            currentUser={currentUser}
            onSwitchToDiscussions={() => setActiveTab('discussions')}
          />
        </TabsContent>

        {/* Evaluation Tab */}
        <TabsContent value="evaluation">
          <RatingSection
            project={latestIdea}
            currentUser={currentUser}
          />
        </TabsContent>

        {/* Discussions Tab */}
        <TabsContent value="discussions">
          <IdeaDiscussionsTab
            idea={latestIdea}
            currentUser={currentUser}
            discussions={discussionTopics}
            isSupported={isSupported}
            onSwitchToVersions={() => setActiveTab('versions')}
          />
        </TabsContent>

        {/* Versions Tab */}
        <TabsContent value="versions">
          <IdeaVersionsTab
            idea={latestIdea}
            currentUser={currentUser}
            allIdeas={allIdeas}
            isSupported={isSupported}
            onPostClick={onPostClick}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}