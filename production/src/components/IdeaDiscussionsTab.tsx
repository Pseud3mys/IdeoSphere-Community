import { useState } from 'react';
import { Idea, User, DiscussionTopic, DiscussionPost } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CreateVersionDialog } from './CreateVersionDialog';
import { 
  Heart, 
  MessageSquare,
  ThumbsUp,
  Pin,
  HelpCircle,
  Lightbulb,
  Settings,
  PlusCircle,
  GitBranch,
  Lock,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Check
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface IdeaDiscussionsTabProps {
  idea: Idea;
  currentUser: User;
  discussions: DiscussionTopic[];
  isSupported: boolean;
  onSwitchToVersions?: () => void; // Ajouter cette fonction pour changer d'onglet
}

export function IdeaDiscussionsTab({
  idea,
  currentUser,
  discussions,
  isSupported,
  onSwitchToVersions
}: IdeaDiscussionsTabProps) {
  // Utilisation du store pour les actions et données
  const { actions, getAllDiscussionTopics } = useEntityStoreSimple();
  
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicType, setNewTopicType] = useState<'general' | 'question' | 'suggestion' | 'technical'>('general');
  const [newPostContent, setNewPostContent] = useState<{[key: string]: string}>({});
  const [showNewTopic, setShowNewTopic] = useState(false);
  const [expandedTopics, setExpandedTopics] = useState<{[key: string]: boolean}>({});

  // Utiliser les discussions passées en prop (chargées par l'API)
  const allDiscussionTopicsFromStore = getAllDiscussionTopics();
  
  // Priorité aux discussions passées en prop, sinon fallback sur le store
  const discussionTopicsData = discussions && discussions.length > 0 
    ? discussions 
    : allDiscussionTopicsFromStore.filter(topic => idea.discussionIds?.includes(topic.id));

  // Fonction locale pour calculer les questions résolues
  const getResolvedQuestions = () => {
    return discussionTopicsData.filter(discussion => 
      discussion.type === 'question' && 
      discussion.posts.some(post => post.isAnswer === true)
    );
  };

  // Filtrer les questions qui ont déjà une réponse choisie (résolues)
  const filteredDiscussionTopics = discussionTopicsData?.filter(topic => {
    if (topic.type === 'question') {
      // Vérifier si cette question a une réponse résolue
      const hasResolvedAnswer = topic.posts?.some(post => post.isAnswer === true);
      return !hasResolvedAnswer; // Exclure si elle a déjà une réponse résolue
    }
    return true; // Garder tous les autres types de discussions
  });
  
  const allDiscussionTopics = filteredDiscussionTopics || [];

  const topicIcons = {
    general: <MessageSquare className="w-4 h-4" />,
    question: <HelpCircle className="w-4 h-4" />,
    suggestion: <Lightbulb className="w-4 h-4" />,
    technical: <Settings className="w-4 h-4" />
  };

  const topicColors = {
    general: 'bg-blue-100 text-blue-800',
    question: 'bg-orange-100 text-orange-800',
    suggestion: 'bg-green-100 text-green-800',
    technical: 'bg-purple-100 text-purple-800'
  };

  const handleUpvote = (type: 'topic' | 'post' | 'reply', id: string, topicId?: string, postId?: string) => {
    if (type === 'topic') {
      actions.upvoteDiscussionTopic(id);
    } else if (type === 'post' && topicId) {
      actions.upvoteDiscussionPost(topicId, id);
    } else if (type === 'reply' && topicId && postId) {
      // Reply upvotes in discussions are handled differently - for now just a placeholder
    }
  };

  const handleCreateTopic = () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim()) {
      toast.error('Veuillez remplir le titre et le contenu');
      return;
    }

    // Utiliser l'action du store
    actions.createNewDiscussionTopic(idea.id, {
      title: newTopicTitle,
      content: newTopicContent,
      type: newTopicType
    });

    // Succès et nettoyage
    toast.success('Nouveau sujet créé ! 💬');
    setNewTopicTitle('');
    setNewTopicContent('');
    setShowNewTopic(false);
  };

  const handleCreatePost = (topicId: string) => {
    // Vérification stricte du type de topicId
    if (typeof topicId !== 'string') {
      console.error('❌ [handleCreatePost] topicId n\'est pas une string:', typeof topicId, topicId);
      toast.error('Erreur: ID de topic invalide');
      return;
    }
    
    if (!newPostContent[topicId]?.trim()) {
      toast.error('Veuillez écrire un message');
      return;
    }

    console.log('[handleCreatePost] Appel de createDiscussionPost avec topicId:', topicId, '(type:', typeof topicId, ')');
    
    // Utiliser l'action du store
    actions.createDiscussionPost(topicId, newPostContent[topicId]);

    // Vider le champ de saisie
    setNewPostContent(prev => ({ ...prev, [topicId]: '' }));
    
    // Si le topic n'était pas étendu, l'étendre automatiquement pour voir la nouvelle réponse
    if (!expandedTopics[topicId]) {
      setExpandedTopics(prev => ({ ...prev, [topicId]: true }));
    }

    toast.success('Réponse ajoutée ! 💬');
  };

  const toggleTopicExpansion = (topicId: string) => {
    setExpandedTopics(prev => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  // Fonction pour marquer une réponse comme acceptée
  const handleMarkAsAnswer = (topicId: string, postId: string) => {
    actions.markDiscussionPostAsAnswer(topicId, postId);
    toast.success('Réponse sélectionnée ! ✅');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <h3 className="text-base md:text-lg">Discussions ({allDiscussionTopics?.length || 0})</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {isSupported ? (
            <>
              <CreateVersionDialog 
                idea={idea}
              >
                <Button variant="outline" size="sm">
                  <GitBranch className="w-4 h-4 mr-2" />
                  Nouvelle version
                </Button>
              </CreateVersionDialog>
              <Button onClick={() => setShowNewTopic(true)}>
                <PlusCircle className="w-4 h-4 mr-2" />
                Nouveau sujet
              </Button>
            </>
          ) : (
            <div className="bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Lock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">Participation restreinte</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Pour participer aux discussions et proposer des versions, vous devez d'abord soutenir cette idée.
              </p>
              <Button 
                variant="default"
                size="sm"
                onClick={() => actions.toggleIdeaSupport(idea.id)}
                className="flex items-center space-x-2"
              >
                <Heart className="w-4 h-4" />
                <span>Soutenir pour participer</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Incitation à créer une nouvelle version */}
      {isSupported && allDiscussionTopics && allDiscussionTopics.length >= 1 && (() => {
        const resolvedQuestions = getResolvedQuestions();
        return resolvedQuestions.length > 0;
      })() && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg">
                <GitBranch className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-purple-900 mb-2">
                  💡 Cette idée évolue grâce aux échanges !
                </h4>
                <p className="text-sm text-purple-800 mb-3 leading-relaxed">
                  Avec {allDiscussionTopics.length} discussion{allDiscussionTopics.length > 1 ? 's' : ''} active{allDiscussionTopics.length > 1 ? 's' : ''} et {getResolvedQuestions().length} question{getResolvedQuestions().length > 1 ? 's' : ''} résolue{getResolvedQuestions().length > 1 ? 's' : ''}, 
                  c'est le moment idéal pour créer une nouvelle version qui intègre ces améliorations.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <CreateVersionDialog 
                    idea={idea}
                  >
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      <GitBranch className="w-4 h-4 mr-2" />
                      Créer une version améliorée
                    </Button>
                  </CreateVersionDialog>
                  <Button variant="outline" size="sm" className="text-purple-700 border-purple-300 hover:bg-purple-100" onClick={onSwitchToVersions}>
                    <GitBranch className="w-4 h-4 mr-2" />
                    Voir les versions déjà proposées
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Topic Form */}
      {showNewTopic && isSupported && (
        <Card className="border-2 border-dashed">
          <CardHeader>
            <CardTitle className="text-lg">Créer un nouveau sujet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic-title">Titre du sujet</Label>
                <Input
                  id="topic-title"
                  value={newTopicTitle}
                  onChange={(e) => setNewTopicTitle(e.target.value)}
                  placeholder="Ex: Question sur la mise en œuvre..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic-type">Type de sujet</Label>
                <select
                  id="topic-type"
                  value={newTopicType}
                  onChange={(e) => setNewTopicType(e.target.value as any)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                >
                  <option value="general">Discussion générale</option>
                  <option value="question">Question</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="technical">Technique</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-content">Message</Label>
              <Textarea
                id="topic-content"
                value={newTopicContent}
                onChange={(e) => setNewTopicContent(e.target.value)}
                placeholder="Décrivez votre question ou sujet de discussion..."
                rows={4}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewTopic(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateTopic}>
                Créer le sujet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Discussion Topics */}
      <div className="space-y-4">
        {allDiscussionTopics?.map(topic => {
          // Récupérer la version la plus récente du topic depuis le store pour les upvotes
          const latestTopic = allDiscussionTopicsFromStore.find(t => t.id === topic.id) || topic;
          
          const hasAcceptedAnswer = latestTopic.type === 'question' && 
            latestTopic.posts?.some(post => post.isAnswer);
          
          return (
          <Card key={latestTopic.id} className={latestTopic.isPinned ? 'border-yellow-200 bg-yellow-50/30' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {latestTopic.isPinned && <Pin className="w-4 h-4 text-yellow-600" />}
                    <Badge className={topicColors[latestTopic.type]}>
                      {topicIcons[latestTopic.type]}
                      <span className="ml-1 capitalize">{latestTopic.type}</span>
                    </Badge>
                    <h4 className="font-medium">{latestTopic.title}</h4>
                    {hasAcceptedAnswer && (
                      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Résolue
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={latestTopic.author.avatar} alt={latestTopic.author.name} />
                      <AvatarFallback className="text-xs">{latestTopic.author.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <span>{latestTopic.author.name}</span>
                    <span>•</span>
                    <span>{latestTopic.timestamp.toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              {/* Description en pleine largeur */}
              <p className="text-sm mb-4">{latestTopic.content}</p>
            </CardHeader>

            {/* Posts in topic */}
            {latestTopic.posts && latestTopic.posts.length > 0 ? (
              <CardContent className="pt-0">
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleTopicExpansion(latestTopic.id)}
                      className="flex items-center space-x-2 h-9 px-3 sm:h-8 sm:px-2"
                    >
                      {expandedTopics[latestTopic.id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {expandedTopics[latestTopic.id] ? 'Masquer' : 'Afficher'} les réponses ({latestTopic.posts.length})
                      </span>
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleUpvote('topic', latestTopic.id)}
                      className={`flex items-center space-x-1 h-9 px-3 sm:h-8 sm:px-2 ${
                        latestTopic.upvotes?.includes(currentUser.id) 
                          ? 'text-primary hover:text-primary/80' 
                          : ''
                      }`}
                    >
                      <ThumbsUp className={`w-3 h-3 ${
                        latestTopic.upvotes?.includes(currentUser.id) ? 'fill-current' : ''
                      }`} />
                      <span className="text-xs">{latestTopic.upvotes?.length || 0}</span>
                    </Button>
                  </div>

                  {expandedTopics[latestTopic.id] && (
                    <div className="space-y-3 mb-4 mt-3">
                      {latestTopic.posts.map((post, index) => {
                        const isAuthorOfTopic = latestTopic.author.id === currentUser.id;
                        const isQuestionTopic = latestTopic.type === 'question';
                        const canSelectAnswer = isAuthorOfTopic && isQuestionTopic;
                        const isSelectedAnswer = post.isAnswer;
                        
                        return (
                          <div 
                            key={post.id} 
                            className={`rounded-lg p-3 transition-all duration-300 ${
                              isSelectedAnswer
                                ? 'bg-green-50 border border-green-300 shadow-sm'
                                : 'bg-muted/30'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <Avatar className="w-5 h-5">
                                <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                <AvatarFallback className="text-xs">{post.author.name.slice(0, 1)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium">{post.author.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {post.timestamp.toLocaleDateString('fr-FR')}
                              </span>
                              {isSelectedAnswer && (
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Réponse choisie
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm mb-2">{post.content}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleUpvote('post', post.id, latestTopic.id)}
                                  className={`flex items-center space-x-1 h-8 px-2 ${
                                    post.upvotes?.includes(currentUser.id) 
                                      ? 'text-primary hover:text-primary/80' 
                                      : ''
                                  }`}
                                >
                                  <ThumbsUp className={`w-3 h-3 ${
                                    post.upvotes?.includes(currentUser.id) ? 'fill-current' : ''
                                  }`} />
                                  <span className="text-xs">{post.upvotes?.length || 0}</span>
                                </Button>
                              </div>
                              
                              {canSelectAnswer && !isSelectedAnswer && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleMarkAsAnswer(latestTopic.id, post.id)}
                                  className="flex items-center space-x-1 text-green-700 border-green-300 hover:bg-green-50 h-8 px-2"
                                >
                                  <Check className="w-3 h-3" />
                                  <span className="text-xs">Choisir cette réponse</span>
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Add new post - Only visible after expanding topics */}
                  {isSupported && expandedTopics[latestTopic.id] && (
                    <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
                      <Label className="text-sm font-medium text-gray-700">
                        Ajouter votre réponse
                      </Label>
                      <Textarea
                        value={newPostContent[latestTopic.id] || ''}
                        onChange={(e) => setNewPostContent(prev => ({
                          ...prev,
                          [latestTopic.id]: e.target.value
                        }))}
                        placeholder="Partagez votre point de vue, posez une question ou apportez des précisions..."
                        rows={3}
                        className="text-sm"
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={() => handleCreatePost(latestTopic.id)}
                          disabled={!newPostContent[latestTopic.id]?.trim()}
                          className="h-10 px-4 sm:h-9 sm:px-3"
                        >
                          <MessageSquare className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                          Publier la réponse
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            ) : (
              /* Si pas de posts mais utilisateur soutient l'idée, permettre d'ajouter le premier */
              isSupported ? (
                <CardContent className="pt-0">
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">
                        Soyez le premier à répondre
                      </Label>
                      <Textarea
                        value={newPostContent[latestTopic.id] || ''}
                        onChange={(e) => setNewPostContent(prev => ({
                          ...prev,
                          [latestTopic.id]: e.target.value
                        }))}
                        placeholder="Lancez la discussion en partageant votre point de vue..."
                        rows={3}
                        className="text-sm"
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={() => handleCreatePost(latestTopic.id)}
                          disabled={!newPostContent[latestTopic.id]?.trim()}
                          className="h-10 px-4 sm:h-9 sm:px-3"
                        >
                          <MessageSquare className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                          Première réponse
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              ) : null
            )}
          </Card>
          );
        })}

        {/* Message si pas de discussions */}
        {(!allDiscussionTopics || allDiscussionTopics.length === 0) && (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Aucune discussion pour le moment</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Soyez le premier à lancer une discussion sur cette idée !
              </p>
              {isSupported ? (
                <Button onClick={() => setShowNewTopic(true)} className="h-10 px-4 sm:h-9 sm:px-3">
                  <PlusCircle className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                  Créer le premier sujet
                </Button>
              ) : (
                <Button onClick={() => actions.toggleIdeaSupport(idea.id)} className="h-10 px-4 sm:h-9 sm:px-3">
                  <Heart className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                  Soutenir pour participer
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}