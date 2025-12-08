import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Lightbulb, MessageSquare, Users, Sparkles } from 'lucide-react';

interface HowItWorksPageProps {
  onNavigateBack?: () => void;
}

export function HowItWorksPage({ onNavigateBack }: HowItWorksPageProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-6 text-gray-600 hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h1>
            <p className="text-xl text-gray-600">
              Partagez vos idées, enrichissez celles des autres
            </p>
          </div>
        </div>

        {/* Introduction simple */}
        <Card className="mb-12 bg-blue-50/50 border-blue-100">
          <CardContent className="p-8">
            <p className="text-lg text-gray-700 leading-relaxed text-center">
              <strong>IdeoSphere</strong> est une plateforme où chacun peut partager ses idées 
              et collaborer pour les améliorer ensemble. 
              <span className="block mt-2 text-gray-600">Simple, transparent et collaboratif.</span>
            </p>
          </CardContent>
        </Card>

        {/* 3 étapes principales */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            En 3 étapes simples
          </h2>
          
          <div className="space-y-8">
            {/* Étape 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-blue-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  1
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Partagez une idée</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Vous avez une idée pour améliorer votre ville, votre quartier ? 
                  Partagez-la en quelques mots. Pas besoin d'un plan détaillé au début !
                </p>
              </div>
            </div>

            {/* Étape 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-purple-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  2
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Échangez avec la communauté</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  D'autres membres lisent votre idée, la commentent et proposent des améliorations. 
                  Ensemble, vous affinez le projet.
                </p>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-green-500 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg">
                  3
                </div>
              </div>
              <div className="flex-1 pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-6 h-6 text-green-600" />
                  <h3 className="text-xl font-semibold text-gray-900">Collaborez sur les projets</h3>
                </div>
                <p className="text-gray-600 leading-relaxed text-lg">
                  Les meilleures idées deviennent des projets concrets. 
                  Rejoignez les projets qui vous intéressent pour les faire avancer.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Ce que vous pouvez faire */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Ce que vous pouvez faire
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Explorer les idées</h3>
                    <p className="text-gray-600 text-sm">
                      Découvrez ce que proposent les autres membres de votre communauté
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Commenter et discuter</h3>
                    <p className="text-gray-600 text-sm">
                      Donnez votre avis, posez des questions, proposez des améliorations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Publier vos idées</h3>
                    <p className="text-gray-600 text-sm">
                      Partagez vos propositions pour améliorer votre territoire
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Rejoindre des groupes</h3>
                    <p className="text-gray-600 text-sm">
                      Collaborez avec d'autres personnes sur des thématiques communes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Principes clés */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Les principes clés
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-gray-700 text-lg">
                  <strong>Ouvert à tous :</strong> Pas besoin d'être expert, toutes les idées comptent
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-gray-700 text-lg">
                  <strong>Collaboratif :</strong> Les meilleures idées naissent de l'échange
                </p>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs">✓</span>
                </div>
                <p className="text-gray-700 text-lg">
                  <strong>Transparent :</strong> Tout le monde voit l'évolution des projets
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to action */}
        <div className="mt-12 text-center">
          <Button 
            onClick={handleBack}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg"
          >
            Commencer à explorer
          </Button>
        </div>
      </div>
    </div>
  );
}