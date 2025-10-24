import { Button } from './ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, HelpCircle, MessageCircle, Mail } from 'lucide-react';

interface FAQPageProps {
  onNavigateBack: () => void;
}

export function FAQPage({ onNavigateBack }: FAQPageProps) {
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
            Questions <span className="text-primary">fréquentes</span>
          </h1>
          <p className="text-lg text-gray-600">
            Trouvez les réponses aux questions les plus courantes sur IdeoSphere.
          </p>
        </div>

        {/* FAQ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              Questions & Réponses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Comment fonctionne la notation des idées ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      Chaque idée est évaluée selon trois critères essentiels :
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Potentiel :</strong> L'impact possible et la valeur ajoutée de l'idée pour la communauté</li>
                      <li><strong>Faisabilité :</strong> La réalisabilité technique, économique et organisationnelle du projet</li>
                      <li><strong>Aboutissement :</strong> L'état d'avancement et le niveau de développement de l'idée</li>
                    </ul>
                    <p>
                      Cette notation collaborative permet aux meilleures idées d'émerger naturellement grâce à l'intelligence collective.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>Quelle est la différence entre un Post et un Projet ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Posts :</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Messages courts et simples</li>
                        <li>Partage rapide d'idées ou de questions</li>
                        <li>Interaction par commentaires</li>
                        <li>Idéal pour le brainstorming et les discussions informelles</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Projets :</h4>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Contenu structuré et détaillé</li>
                        <li>Évaluations selon les 3 critères</li>
                        <li>Collaboration organisée avec équipes</li>
                        <li>Versions et évolutions du projet</li>
                        <li>Idéal pour les initiatives concrètes et structurées</li>
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>Comment rejoindre une communauté ou un groupe de travail ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      Pour rejoindre un groupe de travail :
                    </p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Allez dans l'onglet "Groupes de travail"</li>
                      <li>Explorez les différentes communautés disponibles</li>
                      <li>Cliquez sur une communauté qui vous intéresse</li>
                      <li>Consultez sa description et ses projets en cours</li>
                      <li>Cliquez sur "Rejoindre" ou "Demander à rejoindre"</li>
                    </ol>
                    <p>
                      Certains groupes acceptent automatiquement les nouveaux membres, d'autres nécessitent une validation par les modérateurs.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4">
                <AccordionTrigger>IdeoSphere est-il vraiment open source ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      Oui, IdeoSphere est entièrement open source. Cela signifie que :
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Le code source est accessible et consultable par tous</li>
                      <li>La communauté peut contribuer au développement</li>
                      <li>Les fonctionnalités sont développées de manière transparente</li>
                      <li>Aucune fonctionnalité cachée ou de surveillance secrète</li>
                      <li>Possibilité d'installer sa propre instance</li>
                    </ul>
                    <p>
                      Vous pouvez consulter le code source sur notre dépôt GitHub et même proposer des améliorations.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-5">
                <AccordionTrigger>Comment créer ma première idée ou mon premier projet ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      Pour créer votre première contribution :
                    </p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li><strong>Pour un post :</strong> Cliquez sur "Créer un post" dans le feed principal</li>
                      <li><strong>Pour un projet :</strong> Cliquez sur "Créer une idée" et choisissez "Projet détaillé"</li>
                      <li>Rédigez votre contenu en étant clair et précis</li>
                      <li>Ajoutez des tags pertinents pour faciliter la découverte</li>
                      <li>Publiez et engagez la conversation avec la communauté</li>
                    </ol>
                    <p>
                      N'hésitez pas à commencer par un post simple pour vous familiariser avec la plateforme.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6">
                <AccordionTrigger>Mes données personnelles sont-elles protégées ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      La protection de vos données est une priorité absolue :
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Nous collectons uniquement les données nécessaires au fonctionnement</li>
                      <li>Aucune vente ou commercialisation de données personnelles</li>
                      <li>Chiffrement des communications et stockage sécurisé</li>
                      <li>Vous contrôlez la visibilité de vos contributions</li>
                      <li>Droit à l'effacement : vous pouvez supprimer votre compte à tout moment</li>
                    </ul>
                    <p>
                      Consultez notre politique de confidentialité pour plus de détails.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7">
                <AccordionTrigger>Comment signaler un contenu inapproprié ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      Si vous rencontrez du contenu inapproprié :
                    </p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Cliquez sur les trois points (⋯) à côté du contenu</li>
                      <li>Sélectionnez "Signaler"</li>
                      <li>Choisissez la raison du signalement</li>
                      <li>Ajoutez des détails si nécessaire</li>
                      <li>Validez votre signalement</li>
                    </ol>
                    <p>
                      Notre équipe de modération examine tous les signalements dans les plus brefs délais.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8">
                <AccordionTrigger>Puis-je utiliser IdeoSphere pour mon organisation ?</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 text-sm">
                    <p>
                      Absolument ! IdeoSphere est conçu pour différents types d'organisations :
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Collectivités :</strong> Intégration dans les sites municipaux</li>
                      <li><strong>Associations :</strong> Mobilisation des membres</li>
                      <li><strong>Listes citoyennes :</strong> Organisation des actions locales</li>
                      <li><strong>Entreprises :</strong> Innovation participative interne</li>
                    </ul>
                    <p>
                      Contactez-nous pour discuter de vos besoins spécifiques et des modalités d'intégration.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Contact pour autres questions */}
        <div className="border-t pt-12">
          <h2 className="text-xl font-medium text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full"></span>
            Vous n'avez pas trouvé votre réponse ?
          </h2>
          <p className="text-primary/70 mb-6">Notre équipe est là pour vous aider</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 p-6 border rounded-lg">
              <MessageCircle className="h-8 w-8 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Discord</h4>
                <p className="text-sm text-gray-600 mb-3">Discussions en temps réel avec la communauté</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://discord.gg/WuUY5dtB" target="_blank" rel="noopener noreferrer">
                    Rejoindre Discord
                  </a>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 border rounded-lg">
              <Mail className="h-8 w-8 text-gray-600" />
              <div>
                <h4 className="font-medium text-gray-900">Email</h4>
                <p className="text-sm text-gray-600 mb-3">Support direct pour vos questions</p>
                <Button variant="outline" size="sm" asChild>
                  <a href="mailto:contact@holonsystems.org">
                    Nous écrire
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}