# Guide de Configuration Client - IdeoSphere

Ce guide vous aide à configurer IdeoSphere pour votre organisation (mairie, entreprise, association, ONG).

---

## 📋 Table des matières

1. [Contexte de l'application](#contexte-de-lapplication)
2. [Architecture de la configuration](#architecture-de-la-configuration)
3. [Configuration basée sur l'URL](#configuration-basée-sur-lurl)
4. [Guide de modification](#guide-de-modification)
5. [Fonctions utilitaires](#fonctions-utilitaires)

---

## Contexte de l'application

### Qu'est-ce qu'IdeoSphere ?

**IdeoSphere** est une plateforme collaborative open source conçue pour démultiplier l'intelligence collective au sein de communautés diverses. Elle fonctionne comme un **"système nerveux"** pour capturer, enrichir et transformer des idées en actions concrètes.

### Vision et philosophie

IdeoSphere repose sur plusieurs principes fondamentaux :

- **Intelligence collective distribuée** : Chaque membre peut contribuer, évaluer et enrichir les idées des autres
- **Traçabilité et évolution** : Toutes les idées gardent une trace de leur genèse et de leurs transformations (lineage)
- **Évaluation multidimensionnelle** : Les idées sont notées selon 3 axes complémentaires pour une vision complète
- **Flexibilité contextuelle** : L'application s'adapte à différents types d'organisations tout en gardant la même logique

### Architecture fonctionnelle

#### 1. **Deux types de contenus complémentaires**

**Posts** (Messages courts)
- Format léger et spontané pour partager rapidement une pensée, une question, une réaction
- Peuvent contenir un titre optionnel et un contenu texte enrichi
- Idéal pour lancer des discussions, tester des idées, poser des questions
- Peut être localisé géographiquement (ou non, selon le contexte)
- Supporte les hashtags pour catégorisation

**Idées** (Projets structurés)
- Propositions détaillées avec description complète et sections enrichies
- Système de collaboration avec co-créateurs multiples
- Évaluations collaboratives sur 3 critères
- Système de versions pour faire évoluer l'idée
- Lineage (chaîne de parenté) pour tracer l'origine et les dérivations
- Peut être liée à des groupes thématiques

#### 2. **Système d'évaluation tri-dimensionnel**

Chaque idée est évaluée selon 3 critères indépendants :

- **Potentiel** 🎯 : Quel est l'impact possible ? Quelle valeur ajoutée ?
- **Faisabilité** ⚙️ : Est-ce réalisable techniquement, économiquement, politiquement ?
- **Aboutissement** 🚀 : Quel est l'état d'avancement réel du projet ?

Ce système permet de :
- Distinguer les idées à fort impact mais difficiles à réaliser
- Identifier les "quick wins" (faisables et impactantes)
- Suivre la progression réelle des projets
- Éviter le biais du "tout ou rien"

#### 3. **Groupes et communautés thématiques**

Les groupes structurent l'organisation en sous-communautés :

**Types de groupes** :
- **Thématiques** : Environnement, Mobilité, Culture, Innovation produit, etc.
- **Géographiques** : Quartiers, départements, sites, implantations
- **Projets** : Groupes dédiés à un projet spécifique
- **De travail** : Équipes cross-fonctionnelles

**Fonctionnalités** :
- Fil d'actualité filtré par groupe
- Membres avec rôles (créateur, membre)
- Liens utiles partagés (ressources, documentation)
- État du groupe (actif, archivé)
- Système de validation pour créer un groupe (évite la prolifération)

#### 4. **Système de lineage et versions**

**Lineage (chaîne de parenté)** :
- Chaque idée peut dériver d'une autre (relation parent-enfant)
- Permet de tracer l'origine d'une idée à travers ses transformations
- Visualisation sous forme de chaîne avec badges
- Identifie automatiquement si un contenu fait partie d'une chaîne

**Versions** :
- Une idée peut évoluer en plusieurs versions successives
- Chaque version garde la trace de son auteur et de ses modifications
- Permet de voir l'historique d'amélioration d'un projet
- Les anciennes versions restent consultables

#### 5. **Utilisateurs et permissions**

**Trois types d'utilisateurs** :

1. **Utilisateurs authentifiés** :
   - Compte complet avec profil
   - Accès à toutes les fonctionnalités
   - Peut créer des idées, des groupes, voter, commenter
   - Historique de contributions

2. **Invités temporaires (Unknown User)** :
   - Peut publier des posts et des idées sans compte
   - Session temporaire avec identifiant anonyme
   - Peut laisser nom et email optionnels pour suivi
   - Permet de réduire les frictions d'entrée

3. **Co-créateurs d'idées** :
   - Plusieurs personnes peuvent être co-créateurs d'une même idée
   - Système de QR code pour faciliter l'ajout de co-créateurs
   - Permet la collaboration dès la conception

#### 6. **Algorithme de tendance intelligent**

Les idées "en tendance" sont calculées selon :
- Nombre de vues récentes (decay exponentiel)
- Nombre de soutiens avec poids temporel
- Nombre de commentaires actifs
- Votes sur les 3 critères d'évaluation
- Facteur de fraîcheur (boost pour les nouveautés)

Cela évite que les "vieilles" idées populaires monopolisent toujours le haut du feed.

#### 7. **Feed intelligent multi-sources**

Le feed principal agrège et organise :
- Posts récents
- Idées en tendance
- Nouveaux projets
- Idées les mieux notées
- Activité récente dans les groupes

Avec des filtres par :
- Type de contenu (posts, idées, tous)
- Groupes spécifiques
- Hashtags
- Période temporelle

### Cas d'usage typiques

#### **Mairie / Collectivité territoriale**
- Budget participatif citoyen
- Recueil d'idées pour aménagement urbain
- Consultation publique sur projets municipaux
- Mobilisation citoyenne sur thématiques locales

#### **Entreprise / Organisation privée**
- Innovation collaborative interne
- Amélioration continue des process
- Idées produit / nouvelles fonctionnalités
- Initiatives RSE et bien-être au travail
- Projets transverses inter-services

#### **Association / ONG**
- Mobilisation militante et projets collectifs
- Co-construction de campagnes d'actions
- Coordination entre bénévoles et sections locales
- Partage de ressources et bonnes pratiques

#### **Université / Établissement d'enseignement**
- Projets étudiants collaboratifs
- Amélioration de la vie de campus
- Initiatives de recherche participative
- Idées pour innovation pédagogique

### Architecture technique

**Frontend** :
- **React 18** + **TypeScript** : Interface utilisateur moderne et typée
- **Tailwind CSS v4** : Styling utility-first avec tokens CSS personnalisables
- **React Router** : Navigation déclarative avec routes protégées
- **Lucide React** : Bibliothèque d'icônes cohérente

**Gestion d'état** :
- **SimpleEntityStore** : Store centralisé custom (pattern Redux simplifié)
- Entités normalisées (Users, Ideas, Posts, Groups, etc.)
- Sélecteurs optimisés pour éviter les re-renders inutiles
- Cache dynamique avec invalidation intelligente

**Pattern d'architecture** :
```
Composants UI
    ↓
Custom Hooks (useEntityStoreSimple, useNavigationActions, etc.)
    ↓
API Services (feedService, contentService, groupService, etc.)
    ↓
Données mockées (data/*.ts)
```

Ce pattern garantit :
- Séparation claire des responsabilités
- Testabilité de chaque couche
- Facilité de remplacement du backend (actuellement mocké)
- Préparation pour intégration Supabase ou autre backend

---

## Architecture de la configuration

### Principe : Configuration multi-client basée sur l'URL

IdeoSphere utilise maintenant un **système de configuration multi-client** qui permet de servir différentes configurations selon l'URL d'accès. Cela permet de déployer une seule instance de l'application pour plusieurs clients différents.

### Structure des fichiers

```
/config
├── types.ts                    # Interface TypeScript pour toutes les configs
├── clientConfig.ts             # Gestionnaire de configuration (routage URL → config)
└── clients/
    ├── default.ts              # Configuration par défaut
    └── listeCitoyenne.ts       # Configuration pour listes citoyennes
```

### Fonctionnement

Le fichier **`clientConfig.ts`** charge automatiquement la bonne configuration selon le sous-domaine de l'URL :

```typescript
// Mapping sous-domaine → configuration
const configs = {
  'default': defaultConfig,          // localhost, alpha.ideosphere.community
  'localhost': defaultConfig,
  'alpha': defaultConfig,
  
  'liste': listeCitoyenneConfig,     // liste.ideosphere.community
  'demo-liste': listeCitoyenneConfig,
  'liste-citoyenne': listeCitoyenneConfig,
};
```

**Exemples d'URLs** :
- `http://localhost:3000` → Configuration par défaut
- `https://alpha.ideosphere.community` → Configuration par défaut
- `https://liste.ideosphere.community` → Configuration liste citoyenne
- `https://demo-liste.ideosphere.community` → Configuration liste citoyenne

---

## Configuration basée sur l'URL

### Ajouter une nouvelle configuration client

**Étape 1 : Créer un nouveau fichier de configuration**

Créez un fichier dans `/config/clients/monClient.ts` :

```typescript
import { ClientConfig } from '../types';

export const monClientConfig: ClientConfig = {
  identity: {
    appName: 'MonApp',
    appTagline: 'Ma tagline personnalisée',
    // ... reste de la config
  },
  // ... toutes les sections requises par l'interface ClientConfig
};
```

**Étape 2 : Importer et mapper la configuration**

Dans `/config/clientConfig.ts`, ajoutez votre configuration :

```typescript
import { monClientConfig } from './clients/monClient';

const configs: Record<string, ClientConfig> = {
  'default': defaultConfig,
  // ... configs existantes
  
  // Nouvelle configuration
  'mon-sous-domaine': monClientConfig,
  'demo-client': monClientConfig,
};
```

**Étape 3 : Tester**

Accédez à `http://mon-sous-domaine.ideosphere.community` et votre configuration sera automatiquement chargée !

### Configurations disponibles

#### 1. **Configuration par défaut** (`/config/clients/default.ts`)
- Type de client : **Mairie**
- Terminologie : citoyens, commune, participation citoyenne
- Localisation : activée (Le Blanc)
- Utilisation : Collectivités territoriales, mairies, conseils citoyens

#### 2. **Configuration Liste Citoyenne** (`/config/clients/listeCitoyenne.ts`)
- Type de client : **Liste citoyenne**
- Terminologie : membres, liste citoyenne, participation collective
- Localisation : activée (Notre Commune)
- Utilisation : Listes citoyennes, mouvements politiques locaux
- Spécificités :
  - Accent sur la co-construction du programme
  - Vocabulaire politique et démocratique
  - Groupes de type "commission thématique" et "action collective"

---

## Guide de modification

### Démarche pour personnaliser une configuration existante

1. **Identifier le fichier de configuration** : `/config/clients/default.ts` ou `/config/clients/listeCitoyenne.ts`
2. **Adapter la terminologie** : Remplacer "citoyen" par "collaborateur", "commune" par "entreprise", etc.
3. **Personnaliser les textes** : Hero, descriptions, exemples, placeholders
4. **Configurer les contacts** : Email, Discord, GitHub, etc.
5. **Activer/désactiver les features** : Localisation, bannière bêta, newsletters, etc.

### Structure de la configuration

Chaque configuration suit l'interface `ClientConfig` définie dans `/config/types.ts` :

```typescript
export interface ClientConfig {
  // Identité et branding
  identity: {
    appName, appTagline, appMission, copyright, projectStatus
  },
  
  // Type de client et terminologie contextuelle
  clientType: 'mairie' | 'entreprise' | 'association' | 'ong' | 'listeCitoyenne',
  terminology: {
    member: { singular, singularFeminine, plural },
    organization: { singular, plural },
    territory: { local },
    participation: { adjective },
    location: { cityName, enabled }
  },
  
  // Contenus de la page d'accueil
  welcome: {
    hero, betaBanner, quickIdea, howItWorks, 
    stats, recentPropositions, cta, discover
  },
  
  // Navigation et header
  navigation: { howItWorksButton, helpButton },
  
  // Footer
  footer: { learnMoreTitle, joinUsTitle, links, contact },
  
  // Messages système
  systemMessages: { shareDialog, signupPage },
  
  // Exemples et placeholders
  examples: {
    post, idea, group, discussion, profile, collaboration
  },
  
  // Types de groupes (personnalisables par client)
  groupTypes: {
    types: GroupType[]
  },
  
  // Intégrations externes
  integrations: {
    kumu: { embedUrl, projectUrl, enabled, width, height }
  },
  
  // Activation/désactivation de fonctionnalités
  features: {
    showBetaBanner,      // Afficher la bannière bêta
    enableNewsletters,   // Afficher la section newsletter
  }
}
```

### Composants intégrés à la configuration

| Composant | Éléments configurables |
|-----------|------------------------|
| **CitizenWelcome.tsx** | Hero, bannière bêta, formulaire rapide, stats, CTA, découverte |
| **AppHeader.tsx** | Nom app, tagline, bouton aide |
| **Footer.tsx** | Description, liens, contacts, copyright |
| **AboutPage.tsx** | Mission, lien GitHub |
| **ShareDialog.tsx** | Textes de partage idées/posts, titres |
| **SignupPage.tsx** | Description contextuelle, helper texts |
| **OnboardingTour.tsx** | Terminologie dans la visite guidée |
| **CreateQuickPost.tsx** | Placeholders posts (titre, contenu, localisation) |
| **BasicIdeaForm.tsx** | Placeholders idées (titre, résumé, localisation) |
| **DetailedDescriptionSection.tsx** | Template description détaillée |
| **CreateGroupFlow.tsx** | Placeholders groupes (nom, localisation, tags) |
| **IdeaDiscussionsTab.tsx** | Placeholder topic de discussion |

---

## Fonctions utilitaires

Le fichier `clientConfig.ts` expose des **fonctions helper** pour simplifier l'utilisation de la configuration dans les composants.

### Fonctions de terminologie

```typescript
// Obtenir le terme pour "membre"
getMemberTerm()                        // → 'citoyen'
getMemberTerm({ plural: true })       // → 'citoyens'
getMemberTerm({ feminine: true })     // → 'citoyenne'

// Obtenir le terme pour "organisation"
getOrganizationTerm()                  // → 'commune'
getOrganizationTerm(true)              // → 'communes'

// Obtenir le nom de la ville/localisation
getCityName()                          // → 'Le Blanc'

// Vérifier si la localisation est activée
isLocationEnabled()                    // → true/false
```

### Fonctions de messages système

```typescript
// Textes de partage dynamiques
getIdeaShareText('Titre de l\'idée')
// → 'Découvrez cette idée citoyenne : Titre de l\'idée'

getPostShareText('Extrait du post')
// → 'Découvrez ce post citoyen : Extrait du post'

// Description d'inscription contextualisée
getSignupDescription()
// → 'Créez votre compte pour participer pleinement à la vie citoyenne de Le Blanc'
```

### Exemple d'utilisation dans un composant

```tsx
import { getMemberTerm, getCityName, currentConfig } from '../config/clientConfig';

function MonComposant() {
  return (
    <div>
      <h1>{currentConfig.identity.appName}</h1>
      <p>
        Ici, vous découvrirez les idées de vos {getMemberTerm({ plural: true })} 
        de {getCityName()}.
      </p>
    </div>
  );
}
```

**Note importante** : Utilisez `currentConfig` au lieu de `clientConfig` pour accéder à la configuration active. Les deux fonctionnent, mais `currentConfig` est plus explicite.

---

## Ressources complémentaires

### Documentation du projet

- **`/CONFIGURATION_CLIENT.md`** : Liste exhaustive de tous les textes et éléments configurables
- **`/ARCHITECTURE.md`** : Architecture technique détaillée de l'application
- **`/ETAT_PROJET.md`** : État d'avancement du projet et prochaines étapes
- **`/docs/`** : Documentation technique (Data Flow, Routing, Cache, etc.)
- **`/README.md`** : Guide général du projet

### Support technique

- **Email** : contact@holonsystems.org
- **Discord** : https://discord.gg/WuUY5dtB
- **GitHub** : https://github.com/Pseud3mys/IdeoSphere-Community

---

**Dernière mise à jour** : Novembre 2025  
**Version** : 1.0  
**Projet** : IdeoSphere - Plateforme collaborative open source