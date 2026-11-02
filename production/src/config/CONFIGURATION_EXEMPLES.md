# Configuration client — guide et exemples

## Principe

- `types.ts` décrit tout ce qui est configurable (`ClientConfig`).
- `clients/default.ts` est une configuration complète, utilisée pour les sous-domaines non mappés (localhost, beta…).
- Chaque client (`clients/<client>.ts`) ne déclare **que ce qui diffère** du défaut, via `defineClient({...})`. Les objets sont fusionnés avec le défaut ; les tableaux (paragraphes, liens, lieux, types de groupes) le remplacent.
- Le sous-domaine est associé à une config dans `clientConfig.ts` (`configs`).

Les textes d'interface communs à toutes les instances (footer, header, dialogue de partage, trame de description d'idée…) ne sont pas dans la config : ils sont écrits dans les composants.

Pour ajouter un client : copier `clients/_template.ts.example` en `clients/<client>.ts`, l'importer et l'ajouter dans `configs` (`clientConfig.ts`).

## Ce qui change selon le cas d'usage

Les cas d'usage reprennent ceux de la vitrine (ideosphere.social).

| Réglage | Écouter son territoire | Co-construire un projet | Faire dialoguer ses équipes | Prolonger un atelier |
|---|---|---|---|---|
| Public | externe (habitants) | externe (futurs usagers) | interne (agents, collaborateurs) | interne (participants) |
| `terminology.member` | habitant / habitants | participant / participants | collaborateur / collaborateurs | participant / participants |
| `terminology.community` | commune | projet | structure | groupe |
| `groupTypes` | quartier, collectif, thématique | thème, espace, usage | service / métier, projet, chantier transversal | atelier, thème |
| `locations.suggestions` | quartiers | bâtiments, espaces | grands services, sous-services, sites | selon l'atelier |
| `locations.addressSearch` | oui | selon le projet | non | non |
| `placeholders` | idées du quotidien local | besoins et usages du lieu | irritants et améliorations internes | suites d'atelier |
| `features.enableNewsletters` | souvent oui | selon le projet | non | non |

## Exemples

### Territoire (commune, collectif citoyen)

```ts
terminology: {
  member: { singular: 'habitant', plural: 'habitants' },
  community: 'commune',
},
groupTypes: [
  { id: 'local', label: 'Quartier', labelPlural: 'Quartiers', description: 'Les échanges d\'un quartier', icon: '📍' },
  { id: 'community', label: 'Collectif', labelPlural: 'Collectifs', description: 'Un collectif ou une association du territoire', icon: '👥' },
  { id: 'challenge', label: 'Thématique', labelPlural: 'Thématiques', description: 'Un sujet ouvert toute l\'année (cadre de vie, mobilités…)', icon: '💡' },
],
placeholders: {
  postContent: 'Une remarque, une question, une idée pour la commune...',
  idea: {
    title: 'Ex: Pédibus pour l\'école des Tilleuls',
    summary: 'Décrivez votre idée en une phrase qui donne envie de la soutenir...',
    location: 'Ex: Place de la Mairie, Quartier Centre',
  },
  group: { name: 'Ex: Parents d\'élèves du centre', location: 'Ex: Quartier Centre', tags: 'Ex: école, mobilité, sécurité' },
},
```

### Projet (bâtiment, tiers-lieu)

```ts
terminology: {
  member: { singular: 'participant', plural: 'participants' },
  community: 'projet',
},
welcome: {
  quickIdeaPlaceholder: '“un lieu où rester après un séminaire”, “plus de couleurs”, “une salle de sieste ?”',
},
groupTypes: [
  { id: 'community', label: 'Usage', labelPlural: 'Usages', description: 'Une façon d\'utiliser le lieu (travail, détente, accueil…)', icon: '👥' },
  { id: 'local', label: 'Espace', labelPlural: 'Espaces', description: 'Une partie du bâtiment', icon: '📍' },
  { id: 'challenge', label: 'Thème', labelPlural: 'Thèmes', description: 'Un sujet transversal (accessibilité, énergie…)', icon: '💡' },
],
```

### Équipes (usage interne)

```ts
terminology: {
  member: { singular: 'collaborateur', plural: 'collaborateurs' },
  community: 'structure',
},
features: { showBetaBanner: false, enableNewsletters: false },
groupTypes: [
  { id: 'community', label: 'Service', labelPlural: 'Services', description: 'Les échanges d\'un service ou d\'un métier', icon: '👥' },
  { id: 'project', label: 'Projet', labelPlural: 'Projets', description: 'Un projet porté par plusieurs services', icon: '🎯' },
  { id: 'challenge', label: 'Chantier', labelPlural: 'Chantiers', description: 'Un chantier transversal (simplification, accueil…)', icon: '💡' },
],
locations: {
  // Un sous-service se rattache à son service via `context` : taper « R&D » propose les deux.
  // lon/lat : coordonnées du site concerné.
  suggestions: [
    { label: 'Ressources humaines', context: 'Siège', lon: 2.2945, lat: 48.8584 },
    { label: 'R&D', context: 'Site de Saclay', lon: 2.1667, lat: 48.7128 },
    { label: 'R&D – IA', context: 'R&D · Site de Saclay', lon: 2.1667, lat: 48.7128 },
    { label: 'Production', context: 'Site de Lyon', lon: 4.8357, lat: 45.764 },
  ],
  addressSearch: false,
},
placeholders: {
  postContent: 'Un irritant, une observation de terrain, une idée d\'amélioration...',
  idea: {
    title: 'Ex: Simplifier le formulaire de réservation de salle',
    summary: 'Résumez votre proposition en une phrase...',
    location: 'Ex: Service accueil, Tous sites',
  },
  group: { name: 'Ex: Chantier simplification', location: 'Ex: Siège', tags: 'Ex: accueil, outils, process' },
},
```

## Bonnes pratiques pour les placeholders

- **Concrets** : `Ex: Jardin partagé rue de la Mairie` plutôt que `Ex: Une idée`.
- **Bon niveau de détail** : les posts sont courts et informels, les idées plus structurées.
- **Vocabulaire du contexte** : habitants, commune, quartier pour un territoire ; collègues, services, process en interne.
- **Ton cohérent** : même niveau de formalité dans tous les placeholders d'un client.
