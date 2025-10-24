import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, Heart, Target, Users, Zap } from 'lucide-react';

interface AboutPageProps {
  onNavigateBack: () => void;
}

export function AboutPage({ onNavigateBack }: AboutPageProps) {
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
            La plateforme qui <span className="text-primary">démultiplie</span><br />
            l'intelligence collective
          </h1>
          <p className="text-lg text-gray-600">
            IdeoSphere accompagne tous types d'organisations dans la mobilisation de leur communauté 
            et la transformation d'idées en actions concrètes.
          </p>
        </div>

        {/* Mission principale */}
        <Card className="mb-8 border-gray-200">
          <CardContent className="pt-6">
            <p className="text-lg leading-relaxed text-gray-700">
              IdeoSphere est une plateforme collaborative open source conçue pour faciliter l'émergence 
              d'idées et d'actions concrètes au service du changement social et écologique. Notre mission 
              est de créer un "système nerveux" pour l'intelligence collective, permettant aux communautés 
              de rassembler leurs énergies militantes et de transformer les bonnes idées en projets réalisables.
            </p>
          </CardContent>
        </Card>

        {/* Principes et fonctionnement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Comment ça marche
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong className="text-gray-900">Système de notation collaborative :</strong> Chaque idée est évaluée selon trois critères : 
                Potentiel (impact possible), Faisabilité (réalisabilité) et Aboutissement (état d'avancement).
              </p>
              <p>
                <strong className="text-gray-900">Émergence naturelle :</strong> Les meilleures idées remontent naturellement grâce à 
                l'intelligence collective de la communauté.
              </p>
              <p>
                <strong className="text-gray-900">Posts vs Projets :</strong> Les Posts sont des messages courts pour partager rapidement 
                une idée, tandis que les Projets sont des contenus complexes avec évaluations détaillées.
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-primary rounded-full"></span>
              Communautés ciblées
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                <strong className="text-gray-900">Listes citoyennes :</strong> Organisation et coordination des actions locales et projets participatifs.
              </p>
              <p>
                <strong className="text-gray-900">Associations :</strong> Mobilisation des membres et développement de projets collectifs.
              </p>
              <p>
                <strong className="text-gray-900">Fablabs :</strong> Collaboration sur des projets techniques et innovation ouverte.
              </p>
              <p>
                <strong className="text-gray-900">Collectivités :</strong> Intégration dans les sites municipaux pour la démocratie participative.
              </p>
            </div>
          </div>
        </div>

        {/* Architecture et intégration */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Architecture et intégration
          </h2>
          <p className="text-primary/70 mb-6">Une plateforme flexible pour tous types d'organisations</p>
          
          <div className="space-y-6 text-gray-600">
            <p>
              <strong className="text-gray-900">Concept "un groupe principal + sa communauté élargie" :</strong> IdeoSphere s'adapte 
              à différents types d'organisations en permettant à un groupe organisateur de mobiliser et 
              faire participer une communauté plus large.
            </p>
            <p>
              <strong className="text-gray-900">Intégration municipale :</strong> La plateforme est destinée à être intégrée dans 
              les sites web municipaux pour compléter et remplacer les solutions existantes de budgets 
              participatifs et de démocratie directe en ligne.
            </p>
            <p>
              <strong className="text-gray-900">Architecture technique :</strong> Centrée sur le SimpleEntityStore avec toutes les 
              fonctionnalités passant par useEntityStoreSimple.ts, privilégiant le moins de données 
              imbriquées possible pour une meilleure performance et maintenabilité.
            </p>
          </div>
        </div>

        {/* Open Source */}
        <div className="border-t pt-12">
          <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Engagement Open Source
          </h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            IdeoSphere est entièrement open source. Nous croyons que les outils de démocratie participative 
            doivent être transparents, auditables et améliorables par la communauté.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/Pseud3mys/IdeoSphere-Community" target="_blank" rel="noopener noreferrer">
                Voir le code source
              </a>
            </Button>
            <Button variant="outline" size="sm">
              Contribuer au projet
            </Button>
            <Button variant="outline" size="sm">
              Documentation technique
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}