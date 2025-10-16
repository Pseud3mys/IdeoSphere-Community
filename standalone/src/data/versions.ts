import { IdeaVersion } from '../types';
import { users } from './users';

// Versions d'idées stockées séparément
export const ideaVersions: IdeaVersion[] = [
  {
    id: 'iv1',
    title: 'Version améliorée : bancs accessibles et emplacements précis',
    summary: 'Après vos conseils, je précise : bancs avec dossiers pour les personnes âgées et emplacements exacts selon les passages',
    description: `## Ce qui a changé grâce à vos retours

Merci à Emma pour ses conseils sur les bancs adaptés aux personnes âgées, et à Pierre pour les emplacements précis !

### Bancs repensés (conseils d'Emma l'infirmière)
- **Bancs avec dossier et accoudoirs** pour aider à se relever
- **Hauteur 45cm** (ni trop haut ni trop bas)
- **Largeur pour 2-3 personnes** pour que ce soit convivial
- **Petit repose-pieds** si possible

### Emplacements précis (expérience de Pierre)
**Pour les poubelles :**
- Sortie de la poste côté parking (là où les gens mangent)
- Devant l'école primaire (quand les parents attendent)
- Place du marché près de l'arrêt de bus

**Pour les bancs :**
- Un banc face à la boulangerie (on peut regarder les gens passer)
- Un banc dans le parc pour surveiller les enfants qui jouent
- Un banc à l'arrêt de bus (pour attendre tranquillement)

### Matériaux durables
Thomas propose du bois traité avec des pieds en métal. Moins cher que tout métal et plus chaleureux.

## Pourquoi cette version est mieux

Avec vos conseils, on a maintenant une idée plus précise qui répond aux vrais besoins des habitants. Les personnes âgées pourront vraiment utiliser ces bancs, et les poubelles seront exactement où il faut !`,
    version: 'V2',
    creator: users[0], // Marie Dubois qui améliore son idée
    createdAt: new Date('2024-01-20'),
    parentIdeaId: '1',
    sourceReferences: [
      {
        id: 'src1',
        type: 'discussion',
        title: 'Quel type de bancs pour les personnes âgées ?',
        description: 'Conseil d\'Emma sur l\'accessibilité',
        discussionId: 'dt1'
      },
      {
        id: 'src2', 
        type: 'discussion',
        title: 'Emplacements exacts des poubelles',
        description: 'Expertise terrain de Pierre',
        discussionId: 'dt1'
      }
    ],
    supporters: ['1', '2', '4', 'current'],
    isAdopted: true // Cette version a été adoptée
  },
  {
    id: 'iv2',
    title: 'Éclairage intelligent et économique',
    summary: 'Je complète mon idée avec des LED et détecteurs de mouvement pour économiser l\'électricité comme à Châteauroux',
    description: `## L'idée qui grandit avec vos conseils

Grâce à Sophie qui m'a parlé du système de Châteauroux, j'améliore ma proposition !

### Ce que j'ajoute à l'idée originale

**LED avec détecteurs de mouvement :**
- Les lampadaires s'allument seulement au passage
- 70% d'économie d'électricité (info du mari de Sophie)
- Lumière douce en permanence + forte luminosité au passage

**Zones prioritaires mieux définies :**
- Rue des Granges : 3 points lumineux (début, milieu, fin)
- Rue du Commerce : vérifier l'éclairage existant d'abord
- Chemin vers l'école : au moins 2 lampadaires

### Ce que ça change

- Sécurité pour tous (objectif initial)
- Économie d'énergie (nouveau !)
- Éclairage adapté : pas trop fort quand personne ne passe

## Calendrier proposé

1. **Hiver prochain** : rue des Granges en priorité
2. **Printemps** : étude des autres rues  
3. **Été** : installation si budget ok

Merci à Sophie et son mari pour l'idée des détecteurs ! Ça rend le projet plus intelligent et plus respectueux de l'environnement.`,
    version: 'V2',
    creator: users[1], // Pierre Martin qui améliore son idée
    createdAt: new Date('2024-01-22'),
    parentIdeaId: '2',
    sourceReferences: [
      {
        id: 'src3',
        type: 'discussion', 
        title: 'Économies d\'électricité avec LED',
        description: 'Conseil technique de Sophie',
        discussionId: 'dt2'
      }
    ],
    supporters: ['1', '2', '3', '4', 'current'],
    isAdopted: false
  },
  {
    id: 'iv3',
    title: 'Journée citoyenne "Mon parc, notre fierté"',
    summary: 'Mon idée devient un vrai projet citoyen ! Journée de nettoyage avec l\'école, conseils de Micheline, et plantation en famille',
    description: `## L'idée qui devient collective

Incroyable comme mon idée simple a grandi grâce à vous tous ! Maintenant on a un vrai projet citoyen.

### Le programme de la journée (samedi matin)

**9h-10h30 : Nettoyage en famille**
- Arrachage des plantes invasives
- Chacun apporte ses outils de jardinage
- Les services techniques nous prêtent une remorque pour évacuer

**10h30-11h : Pause conviviale**
- Café et gâteaux faits maison (qui apporte quoi ?)
- Les enfants peuvent jouer pendant que les parents soufflent

**11h-12h : Plantation avec les enfants**
- Micheline (société d'horticulture) nous guide
- Chaque enfant plante son arbuste ou ses fleurs
- On fait des petites étiquettes avec les noms

### Les plantes choisies (merci Marie et Micheline !)
- **Arbustes** : aubépine, cornouiller, lilas
- **Fleurs sauvages** : coquelicots, bleuets, marguerites  
- **Bulbes** : jonquilles pour l'hiver prochain

### Implication de l'école (idée de Thomas)
Sophie va en parler à ses collègues pour faire une sortie nature. Les enfants apprendront les noms des plantes et leur utilité pour les insectes.

### Organisation pratique
- Inscription sur une liste (chez Marie à la pharmacie ?)
- Prévoir gants, sécateurs, arrosoirs
- Reporté en cas de pluie

## Ce que ça va changer

- Un parc plus beau pour tous
- Un moment de convivialité entre voisins
- Les enfants fiers de leur travail
- Une tradition annuelle peut-être ?

Merci à tous pour vos idées ! Mon petit projet devient notre projet commun. 💚`,
    version: 'V2',
    creator: users[2], // Sophie qui améliore son idée
    createdAt: new Date('2024-01-26'),
    parentIdeaId: '3',
    sourceReferences: [
      {
        id: 'src4',
        type: 'discussion',
        title: 'Quelles plantes locales choisir ?',
        description: 'Conseils de Marie et Micheline',
        discussionId: 'dt3'
      },
      {
        id: 'src5',
        type: 'discussion', 
        title: 'Impliquer l\'école dans le projet',
        description: 'Idée de Thomas pour les enfants',
        discussionId: 'dt3'
      }
    ],
    supporters: ['1', '2', '3', '4', 'current'],
    isAdopted: false
  }
];

// Fonctions helper pour récupérer les données liées à une idée
export function getVersionsForIdea(ideaId: string): IdeaVersion[] {
  const versions = ideaVersions.filter(version => version.parentIdeaId === ideaId);
  console.log(`Looking for versions for idea ${ideaId}, found: ${versions.length} versions`, versions.map(v => ({id: v.id, title: v.title})));
  return versions;
}

// Removed getResolvedQuestionsForIdea as ResolvedQuestion type and resolvedQuestions array are not defined