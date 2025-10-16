import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Star, Zap, TrendingUp, Users, MessageSquare, Vote } from 'lucide-react';

interface HowItWorksPageProps {
  onNavigateBack: () => void;
}

export function HowItWorksPage({ onNavigateBack }: HowItWorksPageProps) {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onNavigateBack}
            className="mb-4 text-gray-600 hover:text-primary"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Comment utiliser <span className="text-primary">IdeoSphere</span> ?
          </h1>
          <p className="text-lg text-gray-600">
            Découvrez étape par étape comment partager vos idées, les enrichir collectivement et les transformer 
            en projets concrets grâce à l'intelligence collective.
          </p>
        </div>

        {/* Parcours des idées */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Le parcours des idées sur IdeoSphere
          </h2>
          <p className="text-primary/70 mb-8">
            Comment une simple idée devient un projet concret grâce à l'intelligence collective
          </p>
          
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                  1
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-gray-600" />
                    Post initial
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Tout commence par un <strong>post simple</strong> où quelqu'un partage une idée, une observation ou une question.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                  2
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    Enrichissement collectif
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    La communauté réagit, <strong>enrichit l'idée</strong> par des commentaires, propose des améliorations et identifie le potentiel.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                  3
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-gray-600" />
                    Transformation en idée structurée
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Quand l'intérêt grandit, l'idée est <strong>formalisée en projet structuré</strong> avec description détaillée et objectifs clairs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                  4
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Vote className="h-4 w-4 text-gray-600" />
                    Discussions et évaluations
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    L'idée fait l'objet de <strong>discussions approfondies</strong> et d'évaluations selon les critères Potentiel, Faisabilité, Aboutissement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                  5
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="h-4 w-4 text-gray-600" />
                    Versions et évolutions
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    L'idée évolue en <strong>différentes versions</strong> qui affinent la proposition et la rendent plus réalisable.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-medium">
                  6
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-gray-600" />
                    Inspiration pour de nouveaux posts
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    Les meilleures idées <strong>inspirent de nouveaux posts</strong> qui proposent des applications concrètes, des variantes ou des projets dérivés.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Posts vs Projets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Posts
                <Badge variant="secondary">Simple</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p><strong>Caractéristiques :</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Messages courts et simples</li>
                  <li>Partage rapide d'idées</li>
                  <li>Interaction par commentaires</li>
                  <li>Pas d'évaluation complexe</li>
                </ul>
                <p><strong>Idéal pour :</strong> Brainstorming, questions, suggestions rapides, discussions informelles.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Projets
                <Badge variant="default">Avancé</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p><strong>Caractéristiques :</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Contenu structuré et détaillé</li>
                  <li>Évaluations selon les 3 critères</li>
                  <li>Collaboration organisée</li>
                  <li>Versions et évolutions</li>
                </ul>
                <p><strong>Idéal pour :</strong> Projets concrets, initiatives structurées, propositions de politique publique.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Processus d'émergence */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Processus d'émergence des meilleures idées</CardTitle>
            <CardDescription>
              Comment l'intelligence collective fait remonter les meilleures solutions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-medium">1</span>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Publication et découverte</h4>
                  <p className="text-sm text-gray-600">
                    Une idée est publiée et devient visible dans le feed de découverte de la communauté.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 font-medium">2</span>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Évaluation collaborative</h4>
                  <p className="text-sm text-gray-600">
                    Les membres de la communauté évaluent l'idée selon les trois critères : Potentiel, Faisabilité, Aboutissement.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 font-medium">3</span>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Discussion et enrichissement</h4>
                  <p className="text-sm text-gray-600">
                    Les commentaires et discussions permettent d'enrichir l'idée et de la faire évoluer.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-600 font-medium">4</span>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Émergence naturelle</h4>
                  <p className="text-sm text-gray-600">
                    Les idées les mieux notées et les plus discutées remontent naturellement dans les classements et feeds personnalisés.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 font-medium">5</span>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Action concrète</h4>
                  <p className="text-sm text-gray-600">
                    Les meilleures idées sont transformées en projets concrets avec des équipes de collaboration.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rôle des groupes de travail */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">Rôle des groupes de travail</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-800 mb-4">
              Les groupes de travail permettent de structurer les communautés par thématiques ou projets spécifiques. 
              Ils facilitent la collaboration entre personnes partageant les mêmes centres d'intérêt et expertise.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-green-800 mb-2">Avantages :</h4>
                <ul className="list-disc pl-5 space-y-1 text-green-700">
                  <li>Focus sur des sujets spécifiques</li>
                  <li>Collaboration entre experts</li>
                  <li>Suivi dédié des projets</li>
                  <li>Communication ciblée</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-800 mb-2">Exemples de groupes :</h4>
                <ul className="list-disc pl-5 space-y-1 text-green-700">
                  <li>Écologie et environnement</li>
                  <li>Économie sociale et solidaire</li>
                  <li>Mobilité durable</li>
                  <li>Numérique et innovation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}