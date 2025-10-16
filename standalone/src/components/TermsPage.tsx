import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft } from 'lucide-react';

interface TermsPageProps {
  onNavigateBack: () => void;
}

export function TermsPage({ onNavigateBack }: TermsPageProps) {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={onNavigateBack}
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Les règles d'utilisation d'IdeoSphere pour une communauté respectueuse et productive
          </p>
          <p className="text-sm text-gray-500">
            <strong>Dernière mise à jour :</strong> Janvier 2025
          </p>
        </div>

        {/* Résumé */}
        <Card className="mb-8 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Acceptation des conditions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-700">
              En utilisant IdeoSphere, vous acceptez ces conditions d'utilisation dans leur intégralité. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.
            </p>
            <p className="text-sm text-gray-600">
              IdeoSphere est une plateforme de collaboration citoyenne destinée à faciliter l'émergence 
              d'idées et d'actions concrètes pour le changement social et écologique.
            </p>
          </CardContent>
        </Card>

        {/* Utilisation de la plateforme */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Utilisation autorisée</h2>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Objectif de la plateforme :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Partager des idées constructives pour l'amélioration sociale et écologique</li>
                <li>Collaborer sur des projets d'intérêt général</li>
                <li>Participer aux évaluations collectives et discussions</li>
                <li>Contribuer à l'intelligence collective</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Usages encouragés :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Proposer des solutions innovantes aux défis locaux</li>
                <li>Enrichir les idées d'autres utilisateurs par vos commentaires</li>
                <li>Évaluer objectivement les projets selon les critères établis</li>
                <li>Créer des liens et collaborations constructives</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contenu utilisateur */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Votre contenu et nos droits</h2>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Propriété de votre contenu :</h4>
              <p className="text-sm mb-2">
                Vous restez propriétaire de tout le contenu que vous publiez sur IdeoSphere 
                (idées, commentaires, projets, etc.).
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Licence d'utilisation :</h4>
              <p className="text-sm mb-2">
                En publiant du contenu, vous accordez à IdeoSphere et à sa communauté une licence 
                non-exclusive pour :
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Afficher et partager votre contenu sur la plateforme</li>
                <li>Permettre aux autres utilisateurs d'interagir avec vos idées</li>
                <li>Archiver et référencer vos contributions</li>
                <li>Utiliser vos idées comme base de projets collaboratifs</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Note importante :</h4>
              <p className="text-sm">
                Vos idées publiées peuvent être reprises et développées par d'autres membres 
                de la communauté dans l'esprit de collaboration open source.
              </p>
            </div>
          </div>
        </div>

        {/* Comportement attendu */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Comportement attendu</h2>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Nous attendons de vous :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Respecter tous les autres utilisateurs, quelles que soient leurs opinions</li>
                <li>Contribuer de manière constructive aux discussions</li>
                <li>Évaluer les idées de manière objective et bienveillante</li>
                <li>Signaler les contenus inappropriés</li>
                <li>Respecter les lois en vigueur</li>
                <li>Utiliser un langage approprié et respectueux</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Comportements interdits :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Harcèlement, menaces ou intimidation</li>
                <li>Contenu discriminatoire, haineux ou offensant</li>
                <li>Spam, publicité non sollicitée ou contenu commercial</li>
                <li>Usurpation d'identité ou fausses informations</li>
                <li>Violation de droits d'auteur ou de propriété intellectuelle</li>
                <li>Tentatives de piratage ou de perturbation technique</li>
                <li>Utilisation de faux comptes ou manipulation des votes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Modération */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Modération et sanctions</h2>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Processus de modération :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Signalements examinés par l'équipe de modération</li>
                <li>Décisions prises selon ces conditions d'utilisation</li>
                <li>Possibilité de faire appel des décisions</li>
                <li>Transparence sur les actions de modération</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Sanctions possibles :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Avertissement :</strong> Pour les infractions mineures</li>
                <li><strong>Suppression de contenu :</strong> Pour le contenu inapproprié</li>
                <li><strong>Suspension temporaire :</strong> Pour les récidives</li>
                <li><strong>Bannissement définitif :</strong> Pour les violations graves</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Notre approche :</h4>
              <p className="text-sm">
                Nous privilégions toujours le dialogue et la pédagogie avant les sanctions. 
                Notre objectif est de maintenir un environnement bienveillant et productif.
              </p>
            </div>
          </div>
        </div>

        {/* Responsabilité */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Limitation de responsabilité</h2>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">IdeoSphere est fourni "en l'état" :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Nous ne garantissons pas que la plateforme sera toujours disponible</li>
                <li>Nous ne sommes pas responsables du contenu publié par les utilisateurs</li>
                <li>Nous nous efforçons d'assurer la sécurité mais ne pouvons la garantir absolument</li>
                <li>Les interruptions de service peuvent survenir pour maintenance</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Responsabilité des utilisateurs :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Vous êtes responsable de votre contenu et de vos interactions</li>
                <li>Vous devez sauvegarder vos données importantes</li>
                <li>Vous devez maintenir la sécurité de votre compte</li>
                <li>Vous assumez les risques liés à l'utilisation de la plateforme</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Évolutions */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Évolution des conditions</h2>
          
          <div className="space-y-3 text-gray-700">
            <p className="text-sm">
              Nous pouvons modifier ces conditions d'utilisation pour refléter les évolutions 
              de la plateforme ou de la réglementation.
            </p>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">En cas de modification :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Notification par email et sur la plateforme</li>
                <li>Délai de 30 jours avant application</li>
                <li>Possibilité de refuser en supprimant votre compte</li>
                <li>Archivage des versions précédentes</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Questions sur ces conditions ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-700">
              Pour toute question concernant ces conditions d'utilisation ou pour signaler 
              une violation, contactez-nous :
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <a href="mailto:contact@ideosphere.org">
                  Nous écrire
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://discord.gg/ideosphere" target="_blank" rel="noopener noreferrer">
                  Discord
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}