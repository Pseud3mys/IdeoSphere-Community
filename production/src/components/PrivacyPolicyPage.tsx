import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onNavigateBack: () => void;
}

export function PrivacyPolicyPage({ onNavigateBack }: PrivacyPolicyPageProps) {
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
            Politique de confidentialité
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Comment nous protégeons et utilisons vos données personnelles
          </p>
          <p className="text-sm text-gray-500">
            <strong>Dernière mise à jour :</strong> Janvier 2025
          </p>
        </div>

        {/* Résumé */}
        <Card className="mb-8 border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">En résumé</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• Nous collectons uniquement les données nécessaires au fonctionnement de la plateforme</li>
              <li>• Nous ne vendons jamais vos données personnelles</li>
              <li>• Vous contrôlez la visibilité de vos contributions</li>
              <li>• Vous pouvez supprimer votre compte à tout moment</li>
              <li>• Nous sommes transparents sur nos pratiques</li>
            </ul>
          </CardContent>
        </Card>

        {/* Collecte des données */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Quelles données collectons-nous ?</h2>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Données d'inscription :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Nom d'utilisateur (pseudonyme accepté)</li>
                <li>Adresse email (pour la connexion et notifications)</li>
                <li>Mot de passe (chiffré dans notre base de données)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Contenu publié :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Idées et projets que vous publiez</li>
                <li>Commentaires et discussions</li>
                <li>Évaluations et votes</li>
                <li>Informations de profil (description, avatar)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Données techniques :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Adresse IP (pour la sécurité)</li>
                <li>Type de navigateur et appareil</li>
                <li>Pages visitées et actions effectuées</li>
                <li>Horodatage des activités</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Utilisation des données */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Comment utilisons-nous vos données ?</h2>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Fonctionnement de la plateforme :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Permettre votre connexion et authentification</li>
                <li>Afficher vos contributions et interactions</li>
                <li>Faciliter la collaboration entre utilisateurs</li>
                <li>Calculer les scores et classements</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Amélioration du service :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Analyser l'utilisation pour améliorer l'expérience</li>
                <li>Détecter et corriger les problèmes techniques</li>
                <li>Développer de nouvelles fonctionnalités</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Communication :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Notifications importantes sur votre compte</li>
                <li>Alertes sur les réponses à vos contributions</li>
                <li>Informations sur les évolutions de la plateforme</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Partage des données */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Partage et visibilité des données</h2>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Données publiques :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Nom d'utilisateur et informations de profil</li>
                <li>Idées, projets et commentaires publiés</li>
                <li>Évaluations données (anonymisées)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Données privées :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Adresse email (jamais affichée publiquement)</li>
                <li>Mot de passe (chiffré)</li>
                <li>Données techniques de navigation</li>
              </ul>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">Important :</h4>
              <p className="text-sm">
                Nous ne vendons, louons ou partageons jamais vos données personnelles avec des tiers 
                à des fins commerciales. Aucune donnée n'est transmise à des annonceurs ou courtiers en données.
              </p>
            </div>
          </div>
        </div>

        {/* Sécurité */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Sécurité et protection</h2>
          
          <div className="space-y-3 text-gray-700">
            <p className="text-sm">
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Chiffrement HTTPS pour toutes les communications</li>
              <li>Stockage sécurisé avec chiffrement des mots de passe</li>
              <li>Accès limité aux données par l'équipe technique</li>
              <li>Sauvegardes régulières et sécurisées</li>
              <li>Surveillance continue contre les intrusions</li>
              <li>Authentification à deux facteurs disponible</li>
            </ul>
          </div>
        </div>

        {/* Vos droits */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-gray-900 mb-4">Vos droits et contrôles</h2>
          
          <div className="space-y-6 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Vous avez le droit de :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li><strong>Accéder</strong> à toutes vos données personnelles</li>
                <li><strong>Modifier</strong> vos informations de profil</li>
                <li><strong>Supprimer</strong> votre compte et vos données</li>
                <li><strong>Exporter</strong> vos données (portabilité)</li>
                <li><strong>Limiter</strong> le traitement de certaines données</li>
                <li><strong>Vous opposer</strong> à certains usages</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Comment exercer vos droits :</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Paramètres de votre compte pour les modifications de base</li>
                <li>Contact à <a href="mailto:contact@holonsystems.org" className="text-gray-600 underline hover:text-gray-900">contact@holonsystems.org</a> pour les demandes spécifiques</li>
                <li>Réponse garantie sous 30 jours maximum</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-gray-900">Questions sur cette politique ?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-gray-700">
              Pour toute question concernant cette politique de confidentialité ou vos données personnelles, 
              n'hésitez pas à nous contacter :
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" asChild>
                <a href="mailto:contact@holonsystems.org">
                  Nous écrire
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="https://discord.gg/WuUY5dtB" target="_blank" rel="noopener noreferrer">
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