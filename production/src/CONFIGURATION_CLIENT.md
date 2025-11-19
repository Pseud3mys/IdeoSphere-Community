# Configuration Client - Éléments Personnalisables

Ce document recense **tous les textes et éléments** qui dépendent du contexte client (mairie, entreprise, association) et qui doivent être facilement configurables pour chaque déploiement.

---

## 📋 Table des matières

1. [Identité et Branding](#1-identité-et-branding)
2. [Terminologie Contextuelle](#2-terminologie-contextuelle)
3. [Page d'Accueil (CitizenWelcome)](#3-page-daccueil-citizenwelcome)
4. [Navigation et Header](#4-navigation-et-header)
5. [Pages Informatives](#5-pages-informatives)
6. [Footer](#6-footer)
7. [Textes Légaux](#7-textes-légaux)
8. [Données Mockées et Exemples](#8-données-mockées-et-exemples)
9. [Messages Système](#9-messages-système)
10. [Configuration Recommandée](#10-configuration-recommandée)

---

## 1. Identité et Branding

### 1.1 Nom de l'application
- **Valeur actuelle** : `"IdeoSphere"`
- **Fichiers concernés** :
  - `/components/CitizenWelcome.tsx` (lignes 217, 218, 258, 262)
  - `/components/AppHeader.tsx` (ligne 28)
  - `/components/AboutPage.tsx` (ligne 42, 50)
  - `/components/HowItWorksPage.tsx` (ligne 36)
  - `/components/FAQPage.tsx` (ligne 39)
  - `/components/Footer.tsx` (ligne 21)
  - `/components/TermsPage.tsx` (ligne 38, 52, 56, 97)
  - `/components/PrivacyPolicyPage.tsx`

### 1.2 Tagline / Sous-titre
- **Valeur actuelle** : `"Votre communauté d'idées"`
- **Fichiers concernés** :
  - `/components/CitizenWelcome.tsx` (ligne 218)
  - `/components/AppHeader.tsx` (ligne 30)

### 1.3 Logo
- **Valeur actuelle** : `logoImage` (figma:asset)
- **Fichiers concernés** :
  - `/components/CitizenWelcome.tsx` (ligne 12, 214)
  - `/components/AppHeader.tsx` (ligne 2, 25)

### 1.4 Description courte de la plateforme
- **Valeur actuelle** : `"Un système nerveux pour l'intelligence collective. Nous connectons les énergies militantes et facilitons l'émergence d'actions concrètes pour le changement social et écologique."`
- **Fichier concerné** :
  - `/components/Footer.tsx` (lignes 22-24)

### 1.5 Mission principale
- **Valeur actuelle** : `"IdeoSphere est une plateforme collaborative open source conçue pour faciliter l'émergence d'idées et d'actions concrètes au service du changement social et écologique."`
- **Fichier concerné** :
  - `/components/AboutPage.tsx` (lignes 50-53)

---

## 2. Terminologie Contextuelle

Ces termes changent selon le contexte client :

### 2.1 Termes à adapter selon le contexte

| Terme actuel (Mairie) | Entreprise | Association | ONG |
|----------------------|------------|-------------|-----|
| citoyen(ne)(s) | collaborateur(trice)(s) | membre(s) | participant(e)(s) |
| commune / municipale | organisation | association | communauté |
| village | entreprise / département | groupe | territoire |
| territoire | périmètre | communauté | zone d'action |
| liste municipale | équipe dirigeante | bureau / conseil | direction |
| budget municipal | budget participatif | budget associatif | budget projet |
| services publics | services internes | services aux membres | programmes |
| participation citoyenne | participation collaborative | participation associative | engagement collectif |

### 2.2 Fichiers utilisant cette terminologie

**CitizenWelcome.tsx** :
- Ligne 185 : `"Idée citoyenne"`
- Ligne 199 : `"Discussion citoyenne"`
- Ligne 279 : `"initiatives citoyennes"`
- Ligne 280 : `"votre liste municipale recueille toutes vos propositions pour améliorer votre territoire"`
- Ligne 482 : `"Participation citoyenne"`
- Ligne 490 : `"Budget municipal dédié"`
- Ligne 506 : `"les citoyens"` + `"notre commune"`

**AboutPage.tsx** :
- Ligne 88 : `"Listes citoyennes"` + `"actions locales"`
- Ligne 97 : `"Collectivités"` + `"sites municipaux"`
- Ligne 118-120 : `"Intégration municipale"` + `"sites web municipaux"` + `"budgets participatifs"`

**OnboardingTour.tsx** :
- Ligne 28 : `"vos concitoyens"`

**ShareDialog.tsx** :
- Ligne 80 : `"idée citoyenne"`
- Ligne 81 : `"post citoyen"`

**SignupPage.tsx** :
- Ligne 196 : `"vie citoyenne de Le Blanc"` ⚠️ Nom de ville en dur !
- Ligne 409 : `"les autres citoyens"`

**FAQPage.tsx** :
- Ligne 214 : `"Listes citoyennes"` + `"actions locales"`
- Ligne 212 : `"Collectivités"` + `"sites municipaux"`

---

## 3. Page d'Accueil (CitizenWelcome)

### 3.1 Bannière version Bêta
- **Titre** : `"Version Bêta d'ideoSphere !"`
- **Contenu** : Description complète de la version bêta
- **Fichier** : `/components/CitizenWelcome.tsx` (lignes 249-271)
- **Note** : À personnaliser ou supprimer en production

### 3.2 Titre principal (Hero)
- **Valeur actuelle** : `"Partagez, explorez ou discutez d'idées locales"`
- **Fichier** : `/components/CitizenWelcome.tsx` (ligne 276)

### 3.3 Sous-titre / Description
- **Valeur actuelle** : `"Aménagement urbain, services publics, initiatives citoyennes, environnement, mobilité, culture, solidarité... Des grandes transformations aux petites améliorations du quotidien, votre liste municipale recueille toutes vos propositions pour améliorer votre territoire."`
- **Fichier** : `/components/CitizenWelcome.tsx` (lignes 279-281)

### 3.4 Exemples de thématiques
- **Valeur actuelle** : Aménagement urbain, services publics, initiatives citoyennes, environnement, mobilité, culture, solidarité
- **À adapter** : Selon le contexte client

### 3.5 Section "Comment ça marche ?"
- **Fichier** : `/components/CitizenWelcome.tsx` (lignes 382-390)
- **Étapes** :
  1. Décrivez votre idée ci-dessus
  2. Ajoutez une localisation si nécessaire
  3. Laissez vos coordonnées pour suivre son évolution
  4. Nous la partageons avec votre communauté

### 3.6 Statistiques affichées
- **Labels actuels** :
  - `"contributions totales"`
  - `"idées partagées"`
  - `"soutiens reçus"`
- **Fichier** : `/components/CitizenWelcome.tsx` (lignes 148-154)

### 3.7 Titre section propositions récentes
- **Valeur actuelle** : `"Propositions récemment partagées"`
- **Fichier** : `/components/CitizenWelcome.tsx` (ligne 405)

### 3.8 Call-to-Action
- **Texte bouton** : `"Explorer toutes les propositions"`
- **Texte section** : `"Envie de découvrir la plateforme ?"` + `"Explorez les propositions déjà partagées par les citoyens et découvrez comment participer à l'amélioration de notre commune."`
- **Fichier** : `/components/CitizenWelcome.tsx` (lignes 470-520)

### 3.9 Badges de valeurs
- **Valeurs actuelles** :
  - `"Participation citoyenne"`
  - `"Projets concrets"`
  - `"Budget municipal dédié"`
- **Fichier** : `/components/CitizenWelcome.tsx` (lignes 482-491)

### 3.10 Placeholders de formulaires
- **Idée rapide** : `"Ex: Des bancs supplémentaires place de la République pour que les personnes âgées puissent se reposer..."`
- **Localisation** : `"Ex: Place de la République, Le Blanc"` ⚠️ Nom de ville en dur !
- **Fichier** : `/components/CitizenWelcome.tsx` (lignes 294, 328)

---

## 4. Navigation et Header

### 4.1 Bouton "Comment ça marche ?"
- **Fichier** : `/components/CitizenWelcome.tsx` (ligne 228)
- **Fichier** : `/components/AppHeader.tsx` (ligne 39)

### 4.2 Titre de l'aide
- **Valeur actuelle** : `"Aide et visite guidée"`
- **Fichier** : `/components/AppHeader.tsx` (ligne 41)

---

## 5. Pages Informatives

### 5.1 Page "À propos" (AboutPage)

**Titre principal** :
- `"La plateforme qui démultiplie l'intelligence collective"`
- Fichier : `/components/AboutPage.tsx` (lignes 37-38)

**Sous-titre** :
- `"IdeoSphere accompagne tous types d'organisations dans la mobilisation de leur communauté et la transformation d'idées en actions concrètes."`
- Fichier : `/components/AboutPage.tsx` (lignes 41-43)

**Mission** :
- Tout le paragraphe de la ligne 49-54

**Communautés ciblées** :
- Listes citoyennes
- Associations
- Fablabs
- Collectivités
- Fichier : `/components/AboutPage.tsx` (lignes 88-98)

**Concept** :
- `"un groupe principal + sa communauté élargie"`
- Fichier : `/components/AboutPage.tsx` (lignes 113-121)

**Liens externes** :
- GitHub : `"https://github.com/Pseud3mys/IdeoSphere-Community"`
- Fichier : `/components/AboutPage.tsx` (ligne 142)

### 5.2 Page "Comment ça marche" (HowItWorksPage)

**Titre** :
- `"Comment utiliser IdeoSphere ?"`
- Fichier : `/components/HowItWorksPage.tsx` (ligne 36)

**Sous-titre** :
- `"Découvrez étape par étape comment partager vos idées, les enrichir collectivement et les transformer en projets concrets grâce à l'intelligence collective."`
- Fichier : `/components/HowItWorksPage.tsx` (lignes 38-41)

**Parcours des idées** (6 étapes) :
- Post initial
- Enrichissement collectif
- Transformation en idée structurée
- Discussions et évaluations
- Versions et évolutions
- Inspiration pour de nouveaux posts
- Fichier : `/components/HowItWorksPage.tsx` (lignes 54-146)

**Exemples de groupes** :
- Écologie et environnement
- Économie sociale et solidaire
- Mobilité durable
- Numérique et innovation
- Fichier : `/components/HowItWorksPage.tsx` (lignes 291-296)

### 5.3 Page FAQ (FAQPage)

**Titre** :
- `"Questions fréquentes"`
- Fichier : `/components/FAQPage.tsx` (ligne 36)

**Contenu** : Toutes les questions/réponses (lignes 53-200+)

**Exemples de déploiement** (ligne 212-215) :
- Collectivités
- Associations
- Listes citoyennes
- Entreprises

---

## 6. Footer

### 6.1 Nom et description
- **Nom** : `"IdeoSphere"`
- **Description** : `"Un système nerveux pour l'intelligence collective. Nous connectons les énergies militantes et facilitent l'émergence d'actions concrètes pour le changement social et écologique."`
- **Fichier** : `/components/Footer.tsx` (lignes 21-24)

### 6.2 Statut projet
- **Valeur actuelle** : `"Projet open source"`
- **Fichier** : `/components/Footer.tsx` (ligne 27)

### 6.3 Contact et communauté

**Discord** :
- URL : `"https://discord.gg/WuUY5dtB"`
- Fichier : `/components/Footer.tsx` (ligne 61)

**Email** :
- URL : `"mailto:contact@holonsystems.org"`
- Fichier : `/components/Footer.tsx` (ligne 70)

**GitHub** :
- URL : `"https://github.com/Pseud3mys/IdeoSphere-Community"`
- Fichier : `/components/Footer.tsx` (ligne 77)

### 6.4 Copyright
- **Valeur actuelle** : `"© 2025 IdeoSphere. Tous droits réservés."`
- **Fichier** : `/components/Footer.tsx` (ligne 93)

---

## 7. Textes Légaux

### 7.1 Conditions Générales d'Utilisation (TermsPage)

**Titre** :
- `"Conditions Générales d'Utilisation"`
- Fichier : `/components/TermsPage.tsx` (ligne 35)

**Sous-titre** :
- `"Les règles d'utilisation d'IdeoSphere pour une communauté respectueuse et productive"`
- Fichier : `/components/TermsPage.tsx` (ligne 38)

**Date de mise à jour** :
- `"Janvier 2025"`
- Fichier : `/components/TermsPage.tsx` (ligne 41)

**Contenu complet** :
- Toute la page à personnaliser selon le contexte légal du client

### 7.2 Politique de Confidentialité (PrivacyPolicyPage)

**À auditer** : Fichier complet à vérifier et adapter

---

## 8. Données Mockées et Exemples

### 8.1 Exemples d'idées

**Fichier** : `/data/ideas.ts`

**Idée exemple #1** :
- Titre : `"Des bancs dans nos rues pour pouvoir se reposer"`
- Description : Contexte "village" avec mentions de :
  - "notre village" (ligne 13)
  - "Place du village" (ligne 27)
  - "la mairie et l'école" (ligne 25)
  - "l'église" (ligne 32)
  - "habitants", "famille", "commune"

⚠️ **Toutes les données mockées** utilisent un contexte municipal/village à adapter selon le client.

### 8.2 Noms de groupes

**Fichier** : `/data/groups.ts`

Exemples de noms actuels (à vérifier) :
- Quartier Nord
- Écologie
- Mobilité
- Culture
- etc.

### 8.3 Exemples de posts

**Fichier** : `/data/posts.ts`

⚠️ Tous les exemples utilisent un contexte municipal à adapter.

### 8.4 Noms d'utilisateurs

**Fichier** : `/data/users.ts`

Les noms et profils d'utilisateurs peuvent être adaptés selon le contexte.

---

## 9. Messages Système

### 9.1 OnboardingTour

**Fichier** : `/components/OnboardingTour.tsx`

**Message d'accueil** (ligne 28) :
- `"Ici, vous découvrirez les idées de vos concitoyens et pourrez partager les vôtres."`

### 9.2 ShareDialog

**Fichier** : `/components/ShareDialog.tsx`

**Textes de partage** (lignes 80-81) :
- `"Découvrez cette idée citoyenne : ..."`
- `"Découvrez ce post citoyen : ..."`

### 9.3 Formulaires et labels

**CreateCompleteIdea** :
- Labels de formulaires à vérifier

**CreateQuickPost** :
- Placeholders et labels à vérifier

**SignupPage** :
- Ligne 196 : `"Créez votre compte pour participer pleinement à la vie citoyenne de Le Blanc"` ⚠️ VILLE EN DUR
- Ligne 409 : `"Cela aide les autres citoyens à mieux comprendre vos motivations"`

---

## 10. Configuration Recommandée

### 10.1 Structure de configuration proposée

Créer un fichier `/config/clientConfig.ts` :

```typescript
export const clientConfig = {
  // Identité
  appName: "IdeoSphere",
  appTagline: "Votre communauté d'idées",
  appDescription: "Un système nerveux pour l'intelligence collective...",
  
  // Type de client
  clientType: "mairie" | "entreprise" | "association" | "ong",
  
  // Terminologie
  terminology: {
    member: "citoyen(ne)",
    members: "citoyens",
    organization: "commune",
    territory: "territoire",
    leadership: "liste municipale",
    participation: "participation citoyenne",
    // etc.
  },
  
  // Contexte géographique (pour mairies)
  location: {
    cityName: "Le Blanc",
    region: "Centre-Val de Loire",
    // etc.
  },
  
  // Contact
  contact: {
    email: "contact@holonsystems.org",
    discord: "https://discord.gg/WuUY5dtB",
    github: "https://github.com/Pseud3mys/IdeoSphere-Community",
  },
  
  // Textes personnalisés
  texts: {
    hero: {
      title: "Partagez, explorez ou discutez d'idées locales",
      description: "Aménagement urbain, services publics...",
    },
    values: [
      "Participation citoyenne",
      "Projets concrets",
      "Budget municipal dédié"
    ],
    // etc.
  },
  
  // Features activées
  features: {
    showBetaBanner: true,
    enableNewsletters: true,
    enableGroups: true,
    // etc.
  }
};
```

### 10.2 Fichiers prioritaires à refactoriser

1. **CitizenWelcome.tsx** : Contient le plus de textes client-dépendants
2. **AboutPage.tsx** : Mission et description
3. **Footer.tsx** : Contact et identité
4. **SignupPage.tsx** : ⚠️ Contient "Le Blanc" en dur
5. **Données mockées** : Adapter tous les exemples

### 10.3 Points d'attention critiques

⚠️ **Mentions en dur à corriger** :
1. `"Le Blanc"` dans SignupPage.tsx (ligne 196)
2. Placeholder localisation : `"Place de la République, Le Blanc"` (CitizenWelcome.tsx, ligne 328)
3. Tous les exemples de données mockées (ideas.ts, posts.ts)

---

## 📝 Notes pour l'implémentation

1. **Créer un système de configuration centralisé** plutôt que des textes dispersés
2. **Support multilingue** : Prévoir i18n dès maintenant
3. **Variables d'environnement** : Pour les URLs et identifiants
4. **Documentation de déploiement** : Guide pour chaque type de client
5. **Templates de données** : Jeux de données adaptés à chaque contexte

---

## ✅ Checklist de déploiement client

- [ ] Remplacer "IdeoSphere" par le nom du client
- [ ] Adapter toute la terminologie (citoyen → membre, etc.)
- [ ] Personnaliser le logo
- [ ] Mettre à jour les coordonnées de contact
- [ ] Adapter les textes légaux (CGU, confidentialité)
- [ ] Supprimer/adapter la bannière bêta
- [ ] Modifier les exemples de données mockées
- [ ] Adapter les thématiques proposées
- [ ] Vérifier tous les placeholders de formulaires
- [ ] Mettre à jour le copyright et les liens externes
- [ ] Adapter les exemples dans HowItWorksPage et FAQPage
- [ ] Configurer les valeurs affichées (badges, stats)

---

**Dernière mise à jour** : Novembre 2025
**Auteur** : Documentation générée pour faciliter les déploiements multi-clients
