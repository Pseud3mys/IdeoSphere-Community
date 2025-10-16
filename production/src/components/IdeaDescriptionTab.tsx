import { Idea, User, DiscussionTopic } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Separator } from './ui/separator';
import { MessageSquare, HelpCircle, CheckCircle } from 'lucide-react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import Markdown from 'react-markdown';

interface IdeaDescriptionTabProps {
  idea: Idea;
  currentUser: User;
  onSwitchToDiscussions: () => void;
}

export function IdeaDescriptionTab({ 
  idea, 
  currentUser, 
  onSwitchToDiscussions 
}: IdeaDescriptionTabProps) {
  // Récupérer les discussions depuis le store
  const { getAllDiscussionTopics } = useEntityStoreSimple();
  const discussions = getAllDiscussionTopics();
  
  // Récupérer les discussions liées à cette idée
  const discussionTopics = discussions.filter(discussion => 
    idea.discussionIds?.includes(discussion.id)
  );
  
  // Séparer les questions résolues des discussions actives
  const resolvedQuestions = discussionTopics.filter(discussion => 
    discussion.type === 'question' && 
    discussion.posts?.some(post => post.isAnswer === true)
  );

  // Simple function to format time distance
  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'À l\'instant';
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)} jour${Math.floor(diffInSeconds / 86400) > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short'
    });
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Indication des questions résolues si il y en a */}
      {resolvedQuestions.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">
                  {resolvedQuestions.length} question{resolvedQuestions.length > 1 ? 's' : ''} résolue{resolvedQuestions.length > 1 ? 's' : ''} disponible{resolvedQuestions.length > 1 ? 's' : ''} en bas de cette description
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // Scroll vers la section questions-réponses
                  const qaSection = document.getElementById('questions-reponses');
                  if (qaSection) {
                    qaSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-green-700 border-green-300 hover:bg-green-100"
              >
                Voir les Q&R
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description complète */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="prose prose-sm max-w-none">
            <Markdown>{idea.description}</Markdown>
          </div>
        </CardContent>
      </Card>

      {/* Section Questions-Réponses */}
      {resolvedQuestions.length > 0 && (
        <Card id="questions-reponses">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <HelpCircle className="w-5 h-5 text-green-600" />
              <span>Questions résolues</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {resolvedQuestions.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-6">
              {resolvedQuestions.map((question, index) => {
                // Trouver la réponse marquée comme correcte
                const resolvedAnswer = question.posts.find(post => post.isAnswer === true);
                
                return (
                  <div key={question.id}>
                    {index > 0 && <Separator className="mb-6" />}
                    
                    {/* Question */}
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-blue-900">{question.title}</h4>
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-200">
                              Question
                            </Badge>
                          </div>
                          <div className="prose prose-sm">
                            <Markdown>{question.content}</Markdown>
                          </div>
                          <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
                            <Avatar className="w-4 h-4">
                              <AvatarImage src={question.author.avatar} alt={question.author.name} />
                              <AvatarFallback className="text-[10px]">{question.author.name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <span>{question.author.name}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(question.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Réponse résolue */}
                      {resolvedAnswer && (
                        <div className="ml-11 border-l-2 border-green-200 pl-4">
                          <div className="bg-green-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-green-800">Réponse validée</span>
                            </div>
                            <div className="prose prose-sm">
                              <Markdown>{resolvedAnswer.content}</Markdown>
                            </div>
                            <div className="flex items-center space-x-2 mt-3 text-xs text-muted-foreground">
                              <Avatar className="w-4 h-4">
                                <AvatarImage src={resolvedAnswer.author.avatar} alt={resolvedAnswer.author.name} />
                                <AvatarFallback className="text-[10px]">{resolvedAnswer.author.name.slice(0, 2)}</AvatarFallback>
                              </Avatar>
                              <span>{resolvedAnswer.author.name}</span>
                              <span>•</span>
                              <span>{formatTimeAgo(resolvedAnswer.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Bouton pour voir toutes les discussions */}
            <div className="mt-6 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={onSwitchToDiscussions}
                className="w-full flex items-center justify-center space-x-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Voir toutes les discussions</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
