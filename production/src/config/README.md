# Guide de Configuration Client - IdeoSphere

Ce guide vous aide à configurer IdeoSphere pour votre organisation (mairie, entreprise, association, ONG).

---

## 📋 Table des matières

1. [Contexte de l'application](#contexte-de-lapplication)
2. [Architecture de la configuration](#architecture-de-la-configuration)
3. [Guide de modification](#guide-de-modification)
4. [Fonctions utilitaires](#fonctions-utilitaires)

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

### Principe : Configuration centralisée et contextuelle

Le fichier `/config/clientConfig.ts` centralise **tous les textes et paramètres** qui varient selon le type d'organisation. Cela permet de déployer la même application avec des vocabulaires et contextes différents sans toucher au code métier.

### Structure de la configuration

```typescript
export const clientConfig = {
  // Identité et branding
  identity: {
    appName, appTagline, appMission, copyright, projectStatus
  },
  
  // Type de client et terminologie contextuelle
  clientType: 'mairie' | 'entreprise' | 'association' | 'ong',
  terminology: {
    member: { singular, singularFeminine, plural },
    organization: { singular, plural },
    territory: { local },
    participation: { adjective },
    location: { cityName, enabled }
  },
  
  // Contenus de la page d'accueil
  welcome: {
    hero, betaBanner (sans enabled), quickIdea, howItWorks, 
    stats, recentPropositions, cta, discover
  },
  
  // Navigation et header
  navigation: { howItWorksButton, helpButton },
  
  // Footer
  footer: { learnMoreTitle, joinUsTitle, links, contact },
  
  // Messages système
  systemMessages: { shareDialog, signupPage },
  
  // Exemples et placeholders (inspire le ton d'usage)
  examples: {
    post, idea, group, discussion, profile, collaboration
  },
  
  // Activation/désactivation de fonctionnalités
  features: {
    showBetaBanner,      // Afficher la bannière bêta
    enableNewsletters,   // Afficher la section newsletter
  }
};
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

## Guide de modification

### Démarche générale

1. **Identifier votre contexte** : Mairie, entreprise, association, ONG ?
2. **Adapter la terminologie** : Remplacer "citoyen" par "collaborateur", "commune" par "entreprise", etc.
3. **Personnaliser les textes** : Hero, descriptions, exemples, placeholders
4. **Configurer les contacts** : Email, Discord, GitHub, etc.
5. **Activer/désactiver les features** : Localisation, QR codes, newsletters, etc.

### Les clés de la personnalisation

#### **1. Terminologie contextuelle** (le plus important)

La terminologie change radicalement l'expérience selon le contexte :

**Mairie** :
- Membres → citoyens
- Organisation → commune
- Territoire local → village/quartier
- Participation → participation citoyenne
- Budget → budget municipal

**Entreprise** :
- Membres → collaborateurs
- Organisation → entreprise
- Territoire local → département/site
- Participation → innovation collaborative
- Budget → budget innovation

**Association** :
- Membres → membres/bénévoles
- Organisation → association
- Territoire local → communauté/section
- Participation → engagement militant
- Budget → budget projets

#### **2. Identité et branding**

Adaptez le nom, le slogan, la mission selon votre organisation.

**Exemple** :
```typescript
identity: {
  appName: 'MaMairie Participe',           // ou 'Innovation Lab', 'Éco-Collectif'
  appTagline: 'Ensemble, construisons notre commune',
  appMission: 'Notre mission est de...',
  copyright: '© 2025 Votre Organisation.',
}
```

#### **3. Page d'accueil**

La page d'accueil est le premier contact. Personnalisez :
- Le **titre hero** selon votre message
- Les **thématiques** pertinentes pour votre contexte
- Les **exemples** de posts/idées (placeholders)
- Les **valeurs** mises en avant (CTA)

**Exemple mairie** : "Aménagement, Services publics, Environnement"  
**Exemple entreprise** : "Produit, Process, RH, RSE, IT"  
**Exemple association** : "Climat, Biodiversité, Mobilité, Alimentation"

#### **4. Localisation**

Activez ou désactivez selon le besoin :
- **Mairie** : Localisation activée (quartiers, rues, places)
- **Entreprise** : Localisation désactivée (pas pertinent)
- **Association** : Localisation activée si actions terrain

```typescript
terminology: {
  location: {
    cityName: 'Le Blanc',    // ou nom de votre ville/organisation
    enabled: true,           // false pour désactiver complètement
  },
}
```

#### **5. Contacts et communauté**

Configurez vos canaux de communication :

```typescript
footer: {
  contact: {
    discord: { url: '...', label: 'Discord' },
    email: { url: 'mailto:...', address: '...' },
    github: { url: '...', label: 'GitHub' },
  },
}
```

#### **6. Exemples et placeholders** (Crucial pour le ton d'usage)

Les exemples et placeholders donnent le ton et inspirent vos utilisateurs. Adaptez-les à votre contexte :

**Mairie** :
```typescript
examples: {
  post: {
    titlePlaceholder: 'Ex: Réflexion sur les horaires de la bibliothèque...',
    contentPlaceholder: 'Partagez votre observation ou idée citoyenne...',
  },
  idea: {
    titlePlaceholder: 'Ex: Jardin partagé rue de la Mairie',
  },
  group: {
    namePlaceholder: 'Ex: Commission Culture',
    locationPlaceholder: 'Ex: Le Blanc',
  },
}
```

**Entreprise** :
```typescript
examples: {
  post: {
    titlePlaceholder: 'Ex: Amélioration du processus de validation...',
    locationPlaceholder: 'Ex: Service RH, Pôle Innovation',
  },
  idea: {
    titlePlaceholder: 'Ex: Plateforme de partage de compétences',
  },
  profile: {
    bioPlaceholder: 'Ex: Chef de projet IT, passionné d\'innovation...',
  },
}
```

#### **7. Fonctionnalités activables**

Selon votre besoin et votre phase de déploiement :

```typescript
features: {
  showBetaBanner: false,     // true en phase test/bêta
  enableNewsletters: true,   // Afficher la section newsletter
}
```

### Exemple de configuration complète

**Pour une entreprise tech sans localisation** :

```typescript
export const clientConfig = {
  clientType: 'entreprise',
  
  identity: {
    appName: 'InnoLab',
    appTagline: 'L\'innovation par tous, pour tous',
    copyright: '© 2025 TechCorp. Usage interne.',
  },
  
  terminology: {
    member: {
      singular: 'collaborateur',
      singularFeminine: 'collaboratrice',
      plural: 'collaborateurs',
    },
    organization: {
      singular: 'entreprise',
      plural: 'entreprises',
    },
    territory: {
      local: 'équipe',
    },
    participation: {
      adjective: 'collaborative',
    },
    location: {
      enabled: false,
    },
  },
  
  welcome: {
    hero: {
      title: 'Partagez vos idées d\'innovation',
      description: 'Améliorations produit, process, RH, IT...',
      themes: ['Produit', 'Process', 'RH', 'IT', 'RSE'],
    },
    cta: {
      values: ['Innovation collaborative', 'Amélioration continue', 'Budget innovation'],
    },
  },
  
  examples: {
    post: {
      titlePlaceholder: 'Ex: Amélioration du processus de validation...',
      contentPlaceholder: 'Partagez votre observation ou suggestion...',
      locationPlaceholder: 'Ex: Service RH, Pôle Innovation',
    },
    idea: {
      titlePlaceholder: 'Ex: Plateforme de partage de compétences',
      summaryPlaceholder: 'Résumez votre proposition d\'innovation...',
    },
    group: {
      namePlaceholder: 'Ex: Task Force Innovation Produit',
      tagsPlaceholder: 'Ex: innovation, produit, amélioration',
    },
    profile: {
      bioPlaceholder: 'Ex: Chef de projet IT, passionné d\'innovation et d\'agilité...',
    },
  },
  
  features: {
    showBetaBanner: false,
    enableNewsletters: true,
  },
};
```

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
import { getMemberTerm, getCityName, clientConfig } from '../config/clientConfig';

function MonComposant() {
  return (
    <div>
      <h1>{clientConfig.identity.appName}</h1>
      <p>
        Ici, vous découvrirez les idées de vos {getMemberTerm({ plural: true })} 
        de {getCityName()}.
      </p>
    </div>
  );
}
```

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
