import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, ArrowRight, ArrowLeft, Lightbulb, MessageCircle, Users, Star, Heart, Eye } from 'lucide-react';

interface OnboardingTourProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OnboardingTour({ isVisible, onClose, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Bienvenue dans votre communauté !",
      description: "Vous êtes maintenant dans IdeoSphere, l'espace collaboratif de votre ville.",
      icon: Users,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#4f75ff] to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🎉</span>
            </div>
            <p className="text-gray-600">
              Ici, vous découvrirez les idées de vos concitoyens et pourrez partager les vôtres. 
              Prenons quelques minutes pour vous orienter !
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Deux types de contenus",
      description: "IdeoSphere distingue les Posts (messages courts) et les Projets (propositions détaillées).",
      icon: MessageCircle,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-sm text-blue-900">Posts</h3>
              </div>
              <p className="text-xs text-blue-700">
                Messages courts, réactions rapides, questions ou suggestions simples
              </p>
              <Badge className="mt-2 text-xs bg-blue-100 text-blue-800">Spontané</Badge>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center mb-2">
                <Lightbulb className="w-5 h-5 text-purple-600 mr-2" />
                <h3 className="text-sm text-purple-900">Projets</h3>
              </div>
              <p className="text-xs text-purple-700">
                Propositions détaillées avec titre, résumé, description et évaluations
              </p>
              <Badge className="mt-2 text-xs bg-purple-100 text-purple-800">Structuré</Badge>
            </div>
          </div>
          
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              💡 <strong>Astuce :</strong> Un post peut devenir un projet ! 
              Commencez simple, puis développez si votre proposition prend de l'ampleur.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Comment soutenir un projet",
      description: "Votre opinion compte ! Plusieurs façons d'exprimer votre soutien.",
      icon: Heart,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <Heart className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm text-blue-900">Soutenir</h4>
                <p className="text-xs text-blue-700">Montrez votre approbation d'un post ou projet rapidement</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Star className="w-5 h-5 text-yellow-500 mt-0.5" />
              <div>
                <h4 className="text-sm text-yellow-900">Noter un projet</h4>
                <p className="text-xs text-yellow-700">Évaluer sur 3 critères : Potentiel, Faisabilité, Originalité</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <MessageCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="text-sm text-green-900">Participer</h4>
                <p className="text-xs text-green-700">Commentez, discutez et créez des posts pour enrichir les échanges</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Navigation et filtres",
      description: "Trouvez facilement ce qui vous intéresse avec les outils de navigation.",
      icon: Eye,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="text-sm text-blue-900 mb-1">🔍 Page Découverte</h4>
              <p className="text-xs text-blue-700">
                Tous les projets et posts de la communauté, triés par pertinence
              </p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="text-sm text-green-900 mb-1">📝 Mes contributions</h4>
              <p className="text-xs text-green-700">
                Vos projets et posts, avec leurs statistiques de performance
              </p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="text-sm text-purple-900 mb-1">✨ Créer</h4>
              <p className="text-xs text-purple-700">
                Partagez un nouveau projet ou développez un post existant
              </p>
            </div>
          </div>
          
          <div className="text-center bg-gray-50 p-3 rounded-lg">
            <p className="text-xs text-gray-600">
              💡 <strong>Conseil :</strong> Utilisez les filtres et le tri pour trouver 
              exactement ce qui vous intéresse !
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Vous êtes prêt !",
      description: "Commencez à explorer les projets de votre communauté.",
      icon: Lightbulb,
      content: (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4f75ff] to-purple-600 rounded-xl flex items-center justify-center mx-auto">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-3">
            <p className="text-gray-700">
              Vous disposez maintenant de tous les outils nécessaires pour contribuer 
              efficacement à votre communauté.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Eye className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-blue-900">Explorez</p>
                <p className="text-xs text-blue-700 mt-1">les projets</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <Heart className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-sm text-red-900">Soutenez</p>
                <p className="text-xs text-red-700 mt-1">les initiatives</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <Lightbulb className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-sm text-purple-900">Créez</p>
                <p className="text-xs text-purple-700 mt-1">du contenu</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border">
            <p className="text-sm text-gray-700">
              <strong>Information :</strong> Cette aide reste accessible à tout moment 
              depuis votre profil utilisateur.
            </p>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const IconComponent = currentStepData.icon;

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#4f75ff] bg-opacity-10 rounded-lg flex items-center justify-center">
                <IconComponent className="w-5 h-5 text-[#4f75ff]" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentStepData.title}</CardTitle>
                <CardDescription className="text-sm">
                  {currentStepData.description}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Progress indicator */}
          <div className="flex space-x-2 mt-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-[#4f75ff]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        
        <CardContent>
          {currentStepData.content}
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Précédent
            </Button>
            
            <div className="text-sm text-gray-500">
              {currentStep + 1} / {steps.length}
            </div>
            
            {currentStep < steps.length - 1 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-[#4f75ff] hover:bg-[#4f75ff]/90 flex items-center"
              >
                Suivant
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={onComplete}
                className="bg-green-600 hover:bg-green-700 flex items-center"
              >
                Commencer !
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}