# Configuration des Exemples et Placeholders - IdeoSphere

## Vue d'ensemble

Les **exemples et placeholders** sont cruciaux pour l'expérience utilisateur : ils donnent le ton, inspirent les utilisateurs et définissent le style de contribution attendu. Tous les exemples sont maintenant centralisés dans `/config/clientConfig.ts`.

## Pourquoi c'est important

Les placeholders ne sont pas de simples textes techniques. Ils :

1. **Inspirent** : Donnent des idées concrètes de ce qu'on peut partager
2. **Rassurent** : Montrent le niveau de détail attendu
3. **Alignent** : Définissent le ton (formel/informel, technique/simple)
4. **Contextualisent** : Adaptent l'app au domaine (mairie, entreprise, asso)

## Structure de configuration

```typescript
examples: {
  // Posts (messages courts)
  post: {
    titlePlaceholder: string,
    contentPlaceholder: string,
    locationPlaceholder: string,
  },
  
  // Idées (projets structurés)
  idea: {
    titlePlaceholder: string,
    summaryPlaceholder: string,
    locationPlaceholder: string,
    descriptionTemplate: {
      withSourcePost: (authorName: string) => string,
      withoutSourcePost: string,
    },
  },
  
  // Groupes
  group: {
    namePlaceholder: string,
    locationPlaceholder: string,
    tagsPlaceholder: string,
  },
  
  // Discussions
  discussion: {
    topicTitlePlaceholder: string,
  },
  
  // Profil utilisateur
  profile: {
    birthYearPlaceholder: string,
    bioPlaceholder: string,
  },
  
  // Collaboration
  collaboration: {
    searchPlaceholder: string,
  },
}
```

## Composants utilisant les exemples

| Composant | Utilise |
|-----------|---------|
| `CreateQuickPost.tsx` | `post.*` |
| `BasicIdeaForm.tsx` | `idea.titlePlaceholder`, `idea.summaryPlaceholder`, `idea.locationPlaceholder` |
| `DetailedDescriptionSection.tsx` | `idea.descriptionTemplate.*` |
| `CreateGroupFlow.tsx` | `group.*` |
| `GroupManagePage.tsx` | `group.*` |
| `IdeaDiscussionsTab.tsx` | `discussion.topicTitlePlaceholder` |
| `SignupPage.tsx` | `profile.*` |
| `CollaborationForm.tsx` | `collaboration.searchPlaceholder` |
| `CollaborationSection.tsx` | `collaboration.searchPlaceholder` |

## Exemples par contexte

### Mairie / Collectivité

```typescript
examples: {
  post: {
    titlePlaceholder: 'Ex: Réflexion sur les horaires de la bibliothèque...',
    contentPlaceholder: 'Partagez votre réflexion, observation ou idée citoyenne...',
    locationPlaceholder: 'Ex: Place de la République, Quartier Centre-ville',
  },
  idea: {
    titlePlaceholder: 'Ex: Jardin partagé rue de la Mairie',
    summaryPlaceholder: 'Décrivez votre projet en une phrase qui donne envie...',
    locationPlaceholder: 'Ex: Place de la République, Le Blanc',
    descriptionTemplate: {
      withSourcePost: (authorName: string) => `## Contexte et enjeu

Suite au post de ${authorName}, je pense que notre commune pourrait...

## Solution proposée

Expliquez en détail votre idée et comment elle bénéficie aux citoyens...

## Mise en œuvre

- Étape 1 : ...
- Étape 2 : ...

## Impact attendu

Quels bénéfices concrets pour les habitants ?`,
      withoutSourcePost: `## Contexte et enjeu

Décrivez le problème ou l'opportunité identifié dans notre commune...

## Solution proposée

Expliquez en détail votre idée citoyenne...

## Mise en œuvre

- Étape 1 : ...
- Étape 2 : ...

## Impact attendu

Quels bénéfices concrets pour les citoyens ?`,
    },
  },
  group: {
    namePlaceholder: 'Ex: Commission Culture',
    locationPlaceholder: 'Ex: Le Blanc',
    tagsPlaceholder: 'Ex: culture, événements, patrimoine',
  },
  discussion: {
    topicTitlePlaceholder: 'Ex: Question sur le budget de mise en œuvre...',
  },
  profile: {
    birthYearPlaceholder: 'Ex: 1985',
    bioPlaceholder: 'Ex: Passionné(e) d\'urbanisme et d\'écologie, je souhaite contribuer à l\'amélioration de notre commune...',
  },
  collaboration: {
    searchPlaceholder: 'Rechercher un citoyen à inviter comme co-créateur...',
  },
}
```

### Entreprise

```typescript
examples: {
  post: {
    titlePlaceholder: 'Ex: Amélioration du processus de validation...',
    contentPlaceholder: 'Partagez votre observation ou suggestion d\'amélioration...',
    locationPlaceholder: 'Ex: Service RH, Pôle Innovation',
  },
  idea: {
    titlePlaceholder: 'Ex: Plateforme de partage de compétences internes',
    summaryPlaceholder: 'Résumez votre proposition d\'innovation en une phrase...',
    locationPlaceholder: 'Ex: Siège, Tous sites',
    descriptionTemplate: {
      withSourcePost: (authorName: string) => `## Contexte et enjeu

Suite au post de ${authorName}, je propose une solution pour améliorer...

## Solution proposée

Description détaillée de l'innovation proposée...

## Mise en œuvre

- Phase 1 : ...
- Phase 2 : ...

## ROI et bénéfices

Quels gains pour l'entreprise et les équipes ?`,
      withoutSourcePost: `## Contexte et enjeu

Décrivez le problème business ou l'opportunité identifiée...

## Solution proposée

Description détaillée de votre proposition d'innovation...

## Mise en œuvre

- Phase 1 : ...
- Phase 2 : ...

## ROI et bénéfices

Quels gains pour l'entreprise et les équipes ?`,
    },
  },
  group: {
    namePlaceholder: 'Ex: Task Force Innovation Produit',
    locationPlaceholder: 'Ex: Paris HQ',
    tagsPlaceholder: 'Ex: innovation, produit, amélioration continue',
  },
  discussion: {
    topicTitlePlaceholder: 'Ex: Questions sur la faisabilité technique...',
  },
  profile: {
    birthYearPlaceholder: 'Ex: 1985',
    bioPlaceholder: 'Ex: Chef de projet IT, passionné d\'innovation et d\'agilité, 5 ans dans la tech...',
  },
  collaboration: {
    searchPlaceholder: 'Rechercher un collaborateur à inviter...',
  },
}
```

### Association / ONG

```typescript
examples: {
  post: {
    titlePlaceholder: 'Ex: Retour sur la dernière action terrain...',
    contentPlaceholder: 'Partagez votre observation ou proposition militante...',
    locationPlaceholder: 'Ex: Site de Bordeaux, Action du 15/03',
  },
  idea: {
    titlePlaceholder: 'Ex: Campagne de sensibilisation dans les écoles',
    summaryPlaceholder: 'Résumez votre projet militant en une phrase percutante...',
    locationPlaceholder: 'Ex: Région Nouvelle-Aquitaine',
    descriptionTemplate: {
      withSourcePost: (authorName: string) => `## Contexte et enjeu

Suite au post de ${authorName}, je propose une action concrète pour...

## Action proposée

Description détaillée du projet militant...

## Plan d'action

- Étape 1 : ...
- Étape 2 : ...

## Impact espéré

Quels changements concrets pour notre cause ?`,
      withoutSourcePost: `## Contexte et enjeu

Décrivez le problème social/écologique identifié...

## Action proposée

Description détaillée de votre projet militant...

## Plan d'action

- Étape 1 : ...
- Étape 2 : ...

## Impact espéré

Quels changements concrets pour notre cause ?`,
    },
  },
  group: {
    namePlaceholder: 'Ex: Groupe Action Climat',
    locationPlaceholder: 'Ex: Lyon et environs',
    tagsPlaceholder: 'Ex: climat, action, mobilisation',
  },
  discussion: {
    topicTitlePlaceholder: 'Ex: Coordination de l\'action du mois prochain...',
  },
  profile: {
    birthYearPlaceholder: 'Ex: 1990',
    bioPlaceholder: 'Ex: Militant écologiste depuis 2015, spécialisé en mobilisation citoyenne...',
  },
  collaboration: {
    searchPlaceholder: 'Rechercher un membre à inviter comme co-organisateur...',
  },
}
```

## Template de description détaillée

Le template de description est particulièrement important car il guide la structure des projets. Il existe en deux variantes :

### Avec post source

Quand un utilisateur transforme un post en idée, on pré-remplit avec une référence à l'auteur original.

```typescript
withSourcePost: (authorName: string) => `...Suite au post de ${authorName}...`
```

### Sans post source

Quand l'utilisateur crée une idée from scratch.

```typescript
withoutSourcePost: `...Décrivez le problème ou l'opportunité...`
```

## Bonnes pratiques

### 1. Exemples concrets et réalistes

❌ Mauvais : `Ex: Une idée`
✅ Bon : `Ex: Jardin partagé rue de la Mairie`

### 2. Niveau de détail approprié

**Posts** : Courts et informels
```
'Partagez votre observation ou question...'
```

**Idées** : Plus structurés et professionnels
```
'Décrivez votre projet en une phrase percutante qui donne envie d'en savoir plus...'
```

### 3. Vocabulaire du domaine

**Mairie** : citoyens, commune, territoire, services publics
**Entreprise** : collaborateurs, innovation, ROI, process
**Association** : membres, militant, action, mobilisation

### 4. Ton cohérent

Assurez-vous que tous les placeholders utilisent le même niveau de formalité et le même vocabulaire.

## Migration technique

Tous les placeholders hardcodés ont été migrés vers la configuration centralisée :

| Avant | Après |
|-------|-------|
| `placeholder="Ex: Commission Culture"` | `placeholder={clientConfig.examples.group.namePlaceholder}` |
| `placeholder="Décrivez votre idée..."` | `placeholder={clientConfig.examples.idea.summaryPlaceholder}` |

## Vérification

Pour vérifier qu'aucun placeholder n'est hardcodé :

```bash
# Rechercher les placeholders Ex: encore hardcodés
grep -r 'placeholder="Ex:' components/

# Devrait retourner 0 résultats
```

---

**Dernière mise à jour** : Décembre 2024  
**Status** : ✅ 100% des placeholders contextuels sont configurables
