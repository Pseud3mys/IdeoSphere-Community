import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { ArrowLeft, Lightbulb, Users, Target, Building2 } from 'lucide-react';
import { clientConfig } from '../config/clientConfig';

interface AboutPageProps {
  onNavigateBack?: () => void;
}

export function AboutPage({ onNavigateBack }: AboutPageProps) {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              À propos d'IdeoSphere
            </h1>
            <p className="text-lg text-gray-600">
              Une plateforme pour transformer vos idées en projets concrets
            </p>
          </div>
        </div>

        {/* Notre vision */}
        <Card className="mb-12 bg-blue-50/50 border-blue-100">
          <CardContent className="p-8">
            <div className="flex items-start gap-3 mb-3">
              <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <h2 className="text-xl font-semibold text-gray-900">Notre vision</h2>
            </div>
            <p className="text-gray-700 leading-relaxed ml-8">
              {clientConfig.identity.appMission}
            </p>
          </CardContent>
        </Card>

        {/* L'histoire du projet */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-gray-900">L'histoire du projet</h2>
          </div>
          
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              IdeoSphere est né en <strong>juin 2025</strong>, à l'issue d'un stage de recherche en sciences sociales 
              réalisé par <strong>Alexandre Hersent</strong>, étudiant en ingénierie. 
            </p>
            
            <p>
              Face au constat que de nombreuses bonnes idées citoyennes ne trouvaient pas d'espace pour être 
              partagées, enrichies et concrétisées collectivement, Alexandre a imaginé un outil simple et accessible 
              permettant à chacun de contribuer à l'amélioration de son territoire.
            </p>

            <Card className="bg-slate-50 border-slate-200 mt-5">
              <CardContent className="p-6">
                <p className="text-gray-700 italic mb-2">
                  « L'idée était de créer un espace où l'intelligence collective peut s'exprimer librement, 
                  où les bonnes idées émergent naturellement grâce à la collaboration de tous. »
                </p>
                <p className="text-sm text-gray-600">— Alexandre Hersent, créateur d'IdeoSphere</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Où en sommes-nous */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Où en sommes-nous ?</h2>
          
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Développement actif (septembre 2024 - mars 2025)</h3>
              <p>
                Alexandre a pris une <strong>césure de 6 mois</strong> pour travailler à plein temps sur le projet, 
                de manière bénévole, afin de développer et tester la plateforme avec différentes communautés.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Phase de test et retours terrain</h3>
              <p>
                La plateforme est actuellement en phase de test avec plusieurs communautés pour 
                valider son utilité et l'améliorer grâce aux retours des utilisateurs.
              </p>
            </div>
          </div>
        </div>

        {/* L'avenir du projet */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-semibold text-gray-900">L'avenir du projet</h2>
          </div>
          
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              <strong>Mars 2025</strong> marquera un tournant important pour IdeoSphere, avec la fin de la césure 
              d'Alexandre et les élections municipales.
            </p>

            <Card className="bg-emerald-50/50 border-emerald-200 mt-5">
              <CardContent className="p-8">
                <div className="flex items-start gap-3 mb-4">
                  <Users className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900">
                    Un projet véritablement collectif et pérenne
                  </h3>
                </div>
                <div className="space-y-3 text-gray-700 ml-8">
                  <p>
                    Si la plateforme démontre son utilité auprès des communautés qui l'utilisent, 
                    le projet évoluera vers une <strong>Société Coopérative d'Intérêt Collectif (SCIC)</strong>.
                  </p>
                  <p>
                    Cette structure permettra à <strong>tous les acteurs</strong> qui ont contribué au projet de 
                    devenir co-propriétaires : mairies partenaires, associations utilisatrices, et membres 
                    actifs de la communauté.
                  </p>
                  <p className="font-medium text-gray-900">
                    IdeoSphere ne sera pas juste un outil collaboratif, mais un projet véritablement 
                    porté collectivement par ses utilisateurs.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Pour qui ? */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Pour qui ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Collectivités locales</h3>
              <p className="text-gray-600">
                Mairies et instances publiques qui souhaitent impliquer leurs citoyens dans les décisions locales
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Associations</h3>
              <p className="text-gray-600">
                Organisations citoyennes qui mobilisent leurs membres autour de projets collectifs
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Listes citoyennes</h3>
              <p className="text-gray-600">
                Mouvements participatifs qui organisent et coordonnent des actions locales
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Citoyens engagés</h3>
              <p className="text-gray-600">
                Toute personne qui souhaite contribuer à l'amélioration de son territoire
              </p>
            </div>
          </div>
        </div>

        {/* Open Source */}
        <Card className="bg-amber-50/40 border-amber-200">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Engagement Open Source</h2>
            <p className="text-gray-700 mb-6 leading-relaxed">
              IdeoSphere est <strong>open source</strong>. Nous croyons que les outils de démocratie 
              participative doivent être transparents, auditables et améliorables par tous.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href={clientConfig.footer.contact.github.url} target="_blank" rel="noopener noreferrer">
                  Voir le code source
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={clientConfig.footer.contact.github.url} target="_blank" rel="noopener noreferrer">
                  Contribuer au projet
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}