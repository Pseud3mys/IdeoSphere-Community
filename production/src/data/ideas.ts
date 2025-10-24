import { Idea } from '../types';
import { users, currentUser, guestUser } from './users';
import { defaultRatingCriteria } from './ratings';
import { getVersionsForIdea } from './versions';

// Function to create ideas data lazily to avoid circular dependencies
export function getMockIdeas(): Idea[] {
  return [
    {
      id: '1',
      title: 'Des bancs dans nos rues pour pouvoir se reposer',
      summary: 'Installer des bancs publics aux endroits stratégiques du village pour que chacun puisse s\'arrêter, se reposer et discuter avec les voisins',
      description: `## Le manque de bancs dans notre village

Ça fait plusieurs fois qu'on en parle entre nous : il n'y a quasiment aucun endroit pour s'asseoir dans nos rues ! Entre les courses, les balades avec les enfants ou quand on vieillit... on a tous besoin de pouvoir faire une pause.

## Les endroits où on en aurait vraiment besoin

### Devant les commerces
- **Pharmacie** : pour attendre qu'elle ouvre ou faire une pause après les courses
- **Boulangerie** : le matin, on se croise tous, ce serait convivial
- **Épicerie** : quand on a les bras chargés

### Sur les trajets quotidiens  
- **Rue principale** : entre la mairie et l'école, c'est long pour les anciens
- **Arrêt de bus** : au lieu de rester debout sous la pluie
- **Place du village** : au centre pour que ce soit un lieu de vie

### Dans les quartiers
- **Près du square** : pour surveiller les enfants qui jouent
- **Devant l'école** : pour les parents qui attendent
- **Chemin de l'église** : pour souffler en montant

## Ce que ça changerait vraiment

### Pour les personnes âgées
- Sorties facilitées quand on se fatigue vite
- Autonomie préservée pour aller aux commerces
- Moins d'isolement, plus de rencontres

### Pour les familles
- Pause pendant les balades avec poussette
- Endroit pour surveiller les enfants
- Moment pour discuter entre parents

### Pour tout le monde
- Convivialité : on s'arrête, on discute
- Villages plus vivants et accueillants
- Lieu de rencontre naturel

## Solutions concrètes et réalistes

### Types de bancs adaptés
- **Bancs simples en bois** : résistants, économiques
- **Avec dossier** : plus confortables pour les seniors
- **Espacement optimal** : ni trop près ni trop loin des commerces

### Financement participatif
- **Coût estimé** : 150-300€ par banc selon le modèle
- **Participation des habitants** : 20€ par famille volontaire
- **Demande de subvention** : conseil général pour l'accessibilité

### Installation et entretien
- **Emplacements validés** : avec les commerçants et la mairie
- **Entretien simple** : nettoyage et vérification 2 fois/an
- **Responsable par secteur** : un habitant qui surveille l'état

## Planning réaliste

- **Mars** : identification précise des emplacements avec chacun
- **Avril** : recherche de financement et choix des modèles
- **Mai** : commande et installation des premiers bancs
- **Juin** : évaluation et éventuels ajustements

Cette idée simple peut vraiment améliorer notre quotidien à tous ! 🪑`,
      creators: [users[0], users[3]], // Marie et Emma
      supporters: [users[0].id, users[1].id, users[2].id, users[3].id, currentUser.id],
      status: 'published',
      sourceIdeas: [],
      sourcePosts: ['post-1', 'post-2', 'post-3'], // Vient de plusieurs posts sur les bancs
      sourceDiscussions: [],
      derivedIdeas: [],
      discussionIds: ['dt11', 'dt12', 'dt13'], // Discussions sur les emplacements, financement, modèles
      ratingCriteria: defaultRatingCriteria,
      ratings: [
        { criterionId: 'potential', value: 5, userId: '1' },
        { criterionId: 'potential', value: 5, userId: '2' },
        { criterionId: 'potential', value: 4, userId: '3' },
        { criterionId: 'feasibility', value: 5, userId: '1' },
        { criterionId: 'feasibility', value: 5, userId: '2' },
        { criterionId: 'feasibility', value: 5, userId: '3' },
        { criterionId: 'completion', value: 4, userId: '1' },
        { criterionId: 'completion', value: 4, userId: '2' },
        { criterionId: 'completion', value: 3, userId: '3' }
      ],
      createdAt: new Date('2024-01-10'),
      tags: ['vie-de-quartier', 'vieillesse']
    },
    {
      id: '2',
      title: 'Café-réparation tous les premiers samedis',
      summary: 'Organiser un atelier mensuel où chacun apporte ses objets cassés pour les réparer ensemble, dans l\'esprit du partage et de l\'anti-gaspillage',
      description: `## L'idée du café-réparation

J'ai encore jeté mon grille-pain ce matin... 😔 Ça m'embête de jeter alors que Pierre pourrait sûrement le réparer ! Et si on organisait des moments pour bricoler ensemble au lieu de jeter ?

## Comment ça marcherait

### Le principe du repair café
- **Quand** : premier samedi de chaque mois, 14h-17h
- **Où** : salle des associations (demande à faire)
- **Qui** : tous les habitants avec leurs objets cassés
- **Comment** : ceux qui savent réparer aident les autres

### Ce qu'on peut réparer ensemble
- **Petits électroménagers** : grille-pain, fer à repasser, bouilloire...
- **Vêtements** : couture, reprises, ourlets, fermetures éclair
- **Vélos** : chaîne, freins, pneus, dérailleur
- **Jouets des enfants** : roues cassées, piles, mécanismes
- **Petit mobilier** : chaises bancales, tiroirs qui coincent

## Pourquoi j'y crois vraiment

### Contre le gaspillage quotidien
- On évite de jeter ce qui peut remarcher
- On économise sur les rachats constants
- Moins de déchets dans nos poubelles !

### Pour créer du lien
- Les bricoleurs partagent leurs compétences
- Les autres apprennent des gestes utiles  
- Moment convivial autour d'un café ☕
- Les enfants voient qu'on peut réparer

### Pour notre pouvoir d'achat
- Moins d'achats neufs = vraies économies
- On devient plus autonomes
- On valorise les savoir-faire du village

## Organisation pratique et simple

### Matériel et outils
- Chacun apporte ses outils si possible
- Boîte à outils commune pour les bases
- Fer à souder, tournevis, aiguilles...
- Pierre a proposé d'apporter son outillage !

### Ambiance conviviale
- Café et gâteaux partagés
- Musique de fond
- Les enfants peuvent venir avec leurs parents
- Pas de stress : si ça marche pas, on aura essayé !

### Planning des "experts"
- **Pierre** : électroménager et bricolage
- **Sophie** : couture et textiles  
- **Thomas** : vélos et mécanismes
- **Et tous ceux qui veulent partager** !

## Les vrais bénéfices

Ce qui me plaît dans cette idée, c'est qu'on arrête ce réflexe de "c'est cassé = poubelle". On redonne une chance aux objets, on apprend ensemble, et surtout on passe un bon moment !

Et puis voir la joie sur le visage quand l'objet remarche... ça n'a pas de prix ! 🔧✨`,
      creators: [users[1], users[4]], // Pierre + Thomas
      supporters: [users[1].id, users[2].id, users[4].id, currentUser.id],
      status: 'published',
      sourceIdeas: [],
      sourcePosts: ['post-4'], // Vient du post sur le grille-pain cassé
      sourceDiscussions: [], // Discussions qui ont inspiré cette idée
      derivedIdeas: ['7'], // L'idée 7 est une version de cette idée
      discussionIds: ['dt4', 'dt5', 'dt6'], // Discussions sur le matériel, le lieu, l'organisation
      ratingCriteria: defaultRatingCriteria,
      ratings: [
        { criterionId: 'potential', value: 5, userId: '1' },
        { criterionId: 'potential', value: 4, userId: '2' },
        { criterionId: 'potential', value: 5, userId: '4' },
        { criterionId: 'feasibility', value: 4, userId: '1' },
        { criterionId: 'feasibility', value: 4, userId: '2' },
        { criterionId: 'feasibility', value: 5, userId: '4' },
        { criterionId: 'completion', value: 3, userId: '1' },
        { criterionId: 'completion', value: 4, userId: '2' },
        { criterionId: 'completion', value: 4, userId: '4' }
      ],
      createdAt: new Date('2024-01-15'),
      tags: ['solidarité', 'associatif']
    },
    {
      id: '3',
      title: 'Système d\'échange de services entre voisins',
      summary: 'Créer un réseau local d\'entraide où chacun propose ses compétences et peut demander de l\'aide à ses voisins',
      description: `## L'idée d'un réseau d'entraide local

Hier j'avais des courses lourdes et j'aurais bien eu besoin d'un coup de main... 🛒 En même temps, moi je peux aider avec l'informatique ! On pourrait pas s'organiser pour s'entraider ?

## Comment organiser les échanges vraiment

### Le principe de base (simple mais efficace)
- Chacun propose ce qu'il sait faire ou peut offrir
- Chacun peut demander de l'aide quand il en a besoin
- Sans argent, juste de la bonne volonté !
- Personne n'est obligé, on aide quand on peut

### Types de services du quotidien qu'on pourrait échanger

**Aide pratique qui nous manque souvent :**
- **Courses lourdes** : sacs de lessive, packs d'eau, gros achats
- **Transport occasionnel** : RDV médical, panne de voiture
- **Garde d'enfants ponctuelle** : urgence, empêchement de dernière minute
- **Aide au déménagement** : même juste quelques cartons

**Savoir-faire qu'on a dans le village :**
- **Aide informatique** : Thomas est doué pour ça !
- **Conseils jardinage** : Pierre s'y connaît vraiment
- **Petites réparations** : plomberie de base, électricité simple
- **Soutien scolaire** : Marie peut aider en français

**Prêts de matériel qu'on utilise peu :**
- Outils de bricolage ou jardinage
- Échelle, perceuse, tondeuse
- Appareils ponctuels (nettoyeur haute pression...)
- Livres, jeux, films

## Comment s'organiser concrètement

### Version simple : tableau papier
- Affiché chez Marie à la pharmacie (pratique et central)
- Colonne "Je propose" / "Je cherche"
- Nom et téléphone pour contact direct
- Mis à jour régulièrement

### Version numérique si on veut
- Groupe WhatsApp du village (rapide)
- Page Facebook "Entraide [notre village]"
- Ou juste un carnet chez les commerçants

## Les règles du bon voisinage

- **Entraide gratuite** : pas d'argent, juste de la générosité
- **Respect des disponibilités** : on n'insiste pas si la personne ne peut pas
- **Aucune obligation** : on aide selon ses moyens et envies
- **Remerciements** : un petit mot fait toujours plaisir
- **Réciprocité naturelle** : pas comptabilisé, mais chacun contribue comme il peut

## Pourquoi ça marcherait chez nous

### On a déjà les bonnes bases
- On se connaît un peu entre nous
- Plein de compétences différentes dans le village
- Bonne mentalité d'entraide déjà présente

### Ça répond à de vrais besoins
- **Familles** : coups de main ponctuels avec les enfants
- **Personnes seules** : aide pour les gros travaux ou courses lourdes
- **Retraités** : services contre compagnie et conseils
- **Tous** : économies et liens sociaux renforcés

### Les bénéfices concrets
- Moins de galère dans les moments compliqués
- Plus d'autonomie pour chacun
- Liens entre générations
- Village plus solidaire et vivant

Je pense qu'on a tous quelque chose à offrir et quelque chose à demander. L'entraide, c'est ce qui fait la vraie richesse d'un village ! 🤝

Et franchement, la prochaine fois que j'ai mes packs d'eau à porter, ça m'arrangerait bien ! 😅`,
      creators: [users[2], users[3]], // Sophie + Emma
      supporters: [users[0].id, users[2].id, users[3].id, users[4].id, currentUser.id],
      status: 'published',
      sourceIdeas: [],
      sourcePosts: ['post-5'], // Vient du post sur l'aide pour les courses
      derivedIdeas: [],
      discussionIds: ['dt7', 'dt8'], // Discussions sur l'organisation et les règles
      ratingCriteria: defaultRatingCriteria,
      ratings: [
        { criterionId: 'potential', value: 5, userId: '1' },
        { criterionId: 'potential', value: 5, userId: '2' },
        { criterionId: 'potential', value: 4, userId: '3' },
        { criterionId: 'feasibility', value: 5, userId: '1' },
        { criterionId: 'feasibility', value: 4, userId: '2' },
        { criterionId: 'feasibility', value: 5, userId: '3' },
        { criterionId: 'completion', value: 3, userId: '1' },
        { criterionId: 'completion', value: 4, userId: '2' },
        { criterionId: 'completion', value: 4, userId: '3' }
      ],
      createdAt: new Date('2024-01-20'),
      tags: ['solidarité', 'vie-de-quartier']
    },
    {
      id: '4',
      title: 'Réparer les nids de poule rue des Écoles',
      summary: 'Signaler et organiser la réparation des trous dans la chaussée qui abîment les voitures et sont dangereux pour les piétons',
      description: `## Le problème des nids de poule rue des Écoles

Ça fait des mois qu'on slalome entre les trous ! Entre celui devant chez Pierre qui fait sauter les amortisseurs et celui près de l'école qui retient l'eau... il faut qu'on s'organise pour que ça bouge !

## Les endroits les plus problématiques

### Devant l'école (le pire)
- **Gros trou** qui se remplit d'eau à chaque pluie
- **Dangereux** pour les enfants qui contournent
- **Éclaboussures** sur les parents quand les voitures passent
- **Urgence** : c'est le passage le plus fréquenté

### Devant chez Pierre (n°15)
- **Trou profond** qui fait mal aux suspensions
- Les **voitures ralentissent** et ça fait des bouchons
- **Difficile à voir** le soir à cause de l'éclairage

### Vers la pharmacie
- **Série de petits trous** qui deviennent de plus en plus gros
- **Problème pour les vélos** et les poussettes
- Surtout **glissant quand il pleut**

## Ce que ça nous coûte vraiment

### Pour nos voitures
- **Pneus usés** plus vite à force d'éviter
- **Amortisseurs** qui prennent cher
- **Jantes** risquent de se voiler
- Thomas a déjà eu une crevaison !

### Pour notre sécurité
- **Piétons** obligés de marcher sur la route
- **Enfants** qui font des détours dangereux
- **Vélos** qui zigzaguent entre les voitures
- **Chutes** possibles, surtout pour les personnes âgées

### Pour l'image du village
- **Première impression** pas terrible pour les visiteurs  
- **Aspect négligé** qui fait baisser la valeur des maisons
- **Problème basique** qui paraît simple à résoudre

## Solutions concrètes à notre portée

### Signalement officiel coordonné
- **Tous ensemble** : on fait un signalement groupé à la mairie
- **Photos** et localisation précise de chaque trou
- **Pétition** avec signatures de tous les riverains
- **Relance** régulière jusqu'à ce que ça bouge

### Solutions temporaires en attendant
- **Signalisation** des trous les plus dangereux
- **Balisage** avec des cônes ou marquage visible
- **Évacuation de l'eau** qui stagne (pierre, gravillon...)

### Financement et travaux
- **Devis** auprès d'entreprises locales
- **Subventions** départementales pour voirie
- **Planification** : profiter d'autres travaux de rue

## Organisation pratique

### Recensement précis
- **Pierre** : faire le tour avec Thomas pour photographier
- **Emma** : localiser sur plan et noter les dimensions
- **Marie** : contacter la mairie pour connaître la procédure

### Suivi du dossier
- **Référent** pour relancer régulièrement
- **Information** des habitants sur l'avancement
- **Coordination** avec les autres projets de voirie

## Planning réaliste

- **Février** : recensement complet et photos
- **Mars** : dossier officiel à la mairie + pétition
- **Avril** : relance et recherche de financement
- **Mai-Juin** : travaux espérés (selon planning municipal)

Cette idée peut paraître basique, mais c'est exactement le genre de problème concret qu'on peut résoudre en s'y mettant tous ensemble ! Et franchement, ne plus esquiver les trous comme des slalomeurs, ça serait le bonheur ! 🚗`,
      creators: [users[1], users[4]], // Pierre + Thomas
      supporters: [users[0].id, users[1].id, users[2].id, users[4].id, currentUser.id],
      status: 'published',
      sourceIdeas: [],
      sourcePosts: ['post-6'], // Vient du post sur les nids de poule
      sourceDiscussions: [],
      derivedIdeas: [],
      discussionIds: ['dt14', 'dt15', 'dt16'], // Discussions sur signalement, procédures, solutions temporaires
      ratingCriteria: defaultRatingCriteria,
      ratings: [
        { criterionId: 'potential', value: 4, userId: '1' },
        { criterionId: 'potential', value: 5, userId: '2' },
        { criterionId: 'potential', value: 4, userId: '4' },
        { criterionId: 'feasibility', value: 4, userId: '1' },
        { criterionId: 'feasibility', value: 3, userId: '2' },
        { criterionId: 'feasibility', value: 4, userId: '4' },
        { criterionId: 'completion', value: 3, userId: '1' },
        { criterionId: 'completion', value: 3, userId: '2' },
        { criterionId: 'completion', value: 3, userId: '4' }
      ],
      createdAt: new Date('2024-01-18'),
      tags: ['vie-de-quartier']
    },
    {
      id: '5',
      title: 'Solution pour le stationnement devant l\'école',
      summary: 'Organiser le stationnement chaotique aux heures d\'entrée et sortie d\'école qui bloque la circulation et met les enfants en danger',
      description: `## Le bazar du stationnement devant l'école

Tous les matins et le soir, c'est la même galère ! Les voitures garées n'importe où, les enfants qui courent entre les véhicules, et nous qui râlons tous dans nos voitures... Il faut qu'on trouve une solution !

## Le problème qu'on vit tous les jours

### Aux heures de pointe (8h et 16h30)
- **Voitures en double file** : impossible de passer
- **Stationnement sur les trottoirs** : poussettes et piétons sur la route
- **Embouteillages** qui remontent jusqu'à la pharmacie
- **Énervement général** : klaxons, disputes entre parents

### Les dangers pour nos enfants
- **Visibilité réduite** : on ne voit pas les petits entre les voitures
- **Courses** pour traverser vite entre les véhicules
- **Vélos** obligés de se faufiler dangereusement
- **Parents stressés** qui font des manœuvres hasardeuses

### L'impact sur le village
- **Commerce** : les clients évitent la pharmacie aux heures d'école
- **Riverains** : impossible de sortir de chez eux
- **Image** : première impression catastrophique pour les visiteurs
- **Conflits** : tensions entre parents et habitants

## Solutions concrètes et réalisables

### Organisation du stationnement

**Zones définies clairement :**
- **Parking autorisé** : places marquées le long de la rue
- **Zone interdite** : devant l'entrée de l'école (5 minutes max)
- **Sens de circulation** : obligatoire pour fluidifier
- **Places réservées** : handicapés et livraisons

**Signalisation renforcée :**
- **Panneaux** : "Arrêt 5 min max - École"
- **Marquage au sol** : places et interdictions visibles
- **Feux clignotants** : aux heures critiques si possible

### Solutions alternatives de transport

**Encourager les autres modes :**
- **Pédibus** : groupes d'enfants accompagnés à pied
- **Covoiturage scolaire** : entre parents du même secteur
- **Vélos** : parking sécurisé pour les enfants
- **Transport scolaire** : optimiser les ramassages existants

### Organisation des parents

**Planning de surveillance bénévole :**
- **Parents volontaires** : 2 par créneau pour réguler
- **Roulement** : chacun 1 fois par mois maximum
- **Formation simple** : gestes et consignes de sécurité
- **Coordination** avec l'école et la mairie

## Mise en œuvre réaliste

### Phase 1 : Organisation immédiate (1 mois)
- **Réunion parents/école/mairie** : définir les règles ensemble
- **Bénévoles** : constituer l'équipe de régulation
- **Test** : essai sur 2-3 semaines pour ajuster

### Phase 2 : Aménagements légers (2-3 mois)
- **Marquage** : peinture pour délimiter les places
- **Panneaux** : signalisation claire et visible
- **Évaluation** : bilan avec tous les acteurs

### Phase 3 : Améliorations (6 mois)
- **Aménagements** : selon budget et besoins identifiés
- **Pédibus** : mise en place si intérêt des familles
- **Pérennisation** : règles intégrées dans le fonctionnement

## Financement et soutien

### Coûts modérés
- **Marquage au sol** : 200-300€
- **Panneaux** : 150-250€ 
- **Matériel bénévoles** : gilets, sifflets (50€)

### Soutien possible
- **Mairie** : prise en charge des aménagements
- **École** : coordination et communication
- **Parents** : bénévolat et financement participatif si besoin

## Bénéfices pour tous

- **Sécurité** : enfants protégés, stress réduit
- **Fluidité** : circulation normale dans le village
- **Convivialité** : moins de tensions, plus d'entraide
- **Exemple** : solution qui peut inspirer d'autres villages

Cette problématique, on la vit tous ! Avec un peu d'organisation et de bonne volonté, on peut transformer ce moment de stress quotidien en quelque chose qui marche pour tout le monde ! 🚸`,
      creators: [users[0], users[3]], // Marie + Emma
      supporters: [users[0].id, users[1].id, users[3].id, users[4].id, currentUser.id],
      status: 'published',
      sourceIdeas: [],
      sourcePosts: ['post-7', 'post-8'], // Vient des posts sur le stationnement école
      sourceDiscussions: [],
      derivedIdeas: [],
      discussionIds: ['dt17', 'dt18', 'dt19'], // Discussions sur organisation bénévoles, règles, alternatives
      ratingCriteria: defaultRatingCriteria,
      ratings: [
        { criterionId: 'potential', value: 5, userId: '1' },
        { criterionId: 'potential', value: 4, userId: '3' },
        { criterionId: 'potential', value: 4, userId: '4' },
        { criterionId: 'feasibility', value: 4, userId: '1' },
        { criterionId: 'feasibility', value: 4, userId: '3' },
        { criterionId: 'feasibility', value: 3, userId: '4' },
        { criterionId: 'completion', value: 3, userId: '1' },
        { criterionId: 'completion', value: 4, userId: '3' },
        { criterionId: 'completion', value: 3, userId: '4' }
      ],
      createdAt: new Date('2024-01-25'),
      tags: ['jeunesse', 'vie-de-quartier']
    },
    
    // Version améliorée de l'idée des bancs (basée sur l'idée '1')
    {
      id: 'idea-version-1',
      title: 'Bancs intelligents avec recharge solaire et WiFi',
      summary: 'Une version évoluée des bancs publics incluant des ports USB solaires et des zones WiFi gratuit pour moderniser l\'espace public',
      description: `## Évolution de l'idée originale des bancs

Après avoir lu l'excellente proposition de Marie sur les bancs publics, je pense qu'on peut aller plus loin et créer des "bancs intelligents" qui répondent aux besoins d'aujourd'hui.

## Ce qui reste de l'idée originale

✅ **Tous les emplacements proposés par Marie** : devant les commerces, arrêt de bus, place du village  
✅ **Accessibilité** : bancs avec dossiers et accoudoirs pour les personnes âgées  
✅ **Convivialité** : espaces pour se rencontrer et discuter  

## Les améliorations modernes

### Ports USB à énergie solaire
- **Panneau solaire intégré** dans le dossier du banc
- **2-3 ports USB** pour recharger téléphones/tablettes
- **Éclairage LED** automatique le soir
- **Autonome** : aucun raccordement électrique nécessaire

### Zone WiFi publique gratuite
- **Hotspot WiFi** alimenté par le panneau solaire
- **Accès limité** : 1h par jour par appareil pour éviter l'abus
- **Couverture** : 20-30 mètres autour du banc
- **Filtrage familial** automatique

### Design moderne et durable
- **Matériaux recyclés** : plastique océanique pour l'assise
- **Structure métal** : résistante au vandalisme
- **Forme ergonomique** : confort pour tous les âges
- **Maintenance réduite** : matériaux auto-nettoyants

## Nouveaux bénéfices

### Pour les jeunes
- **Attraction** : endroit cool où se retrouver
- **Connexion** : pouvoir recharger et se connecter
- **Inclusion** : les ados ne fuient plus l'espace public

### Pour les touristes
- **Praticité** : recharge et infos pendant la visite
- **Image moderne** : village connecté et accueillant
- **Économie locale** : temps passé = consommation

### Pour tous
- **Sécurité** : éclairage automatique le soir
- **Information** : page d'accueil WiFi avec actualités locales
- **Modernité** : village à la pointe de l'innovation

## Mise en œuvre réaliste

### Financement partagé
- **Subventions** : transition numérique rurale
- **Sponsoring** : entreprises locales (nom sur la page WiFi)
- **Participation** : crowdfunding villageois

### Installation progressive
1. **Phase test** : 1 banc devant la mairie pour 6 mois
2. **Évaluation** : usage, satisfaction, problèmes
3. **Déploiement** : 3-4 bancs aux emplacements prioritaires

### Coût estimé
- **Banc intelligent** : 1500-2000€ l'unité
- **Installation** : 300-500€ par banc
- **Maintenance** : très faible (solaire + matériaux durables)

## Pourquoi cette version est meilleure

L'idée de Marie était excellente pour créer du lien social. Cette version garde tout cela ET attire une nouvelle population (jeunes, familles connectées, touristes) tout en projetant le village vers l'avenir.

C'est un investissement plus important mais qui transforme vraiment l'espace public ! 📱⚡️🔗`,
      creators: [users[4]], // Thomas (qui aime la tech)
      supporters: [users[0].id, users[2].id, users[4].id, currentUser.id], // Marie soutient sa version améliorée
      status: 'published',
      sourceIdeas: ['1'], // Basée sur l'idée des bancs de Marie
      sourcePosts: [],
      sourceDiscussions: [],
      derivedIdeas: [],
      discussionIds: ['dt25', 'dt26'], 
      ratingCriteria: defaultRatingCriteria,
      ratings: [
        { criterionId: 'potential', value: 4, userId: '2' },
        { criterionId: 'potential', value: 5, userId: '4' },
        { criterionId: 'feasibility', value: 3, userId: '2' },
        { criterionId: 'feasibility', value: 3, userId: '4' },
        { criterionId: 'completion', value: 4, userId: '2' },
        { criterionId: 'completion', value: 4, userId: '4' }
      ],
      createdAt: new Date('2024-01-28'),
      tags: ['modernisation', 'digital', 'innovation']
    },

    // Version améliorée de l'idée d'éclairage (basée sur l'idée '2')  
    {
      id: 'idea-version-2',
      title: 'Éclairage participatif avec application mobile',
      summary: 'Extension de l\'idée d\'éclairage avec une app pour signaler les problèmes et adapter l\'intensité selon les besoins des habitants',
      description: `## Faire évoluer l'idée d'éclairage de Pierre

L'idée de Pierre sur l'éclairage LED était très pertinente ! Je propose de l'enrichir avec une dimension participative grâce au numérique.

## L'idée de base conservée

✅ **LED avec détecteurs** : économie d'énergie de 70%  
✅ **Zones prioritaires** : rue des Granges, rue du Commerce, école  
✅ **Éclairage adaptatif** : fort au passage, doux en permanence  

## L'innovation participative

### Application mobile "Mon Éclairage"

**Signalement citoyen :**
- **Photo + localisation** : signaler un lampadaire défaillant
- **Notification automatique** : aux services techniques
- **Suivi** : statut de la réparation en temps réel
- **Historique** : voir les interventions dans le quartier

**Adaptation communautaire :**
- **Vote intensité** : les riverains définissent le niveau d'éclairage
- **Horaires spéciaux** : renforcement pour événements (fêtes, marchés)
- **Zones temporaires** : éclairage renforcé pour travaux ou chantiers
- **Statistiques** : consommation et économies en temps réel

### Capteurs intelligents

**Au-delà du mouvement :**
- **Luminosité ambiante** : adaptation météo (nuage/soleil)
- **Comptage passage** : données anonymes d'affluence
- **Bruit ambiant** : renforcement si activité inhabituelle
- **Température** : optimisation selon la saison

## Nouveaux avantages

### Pour les habitants
- **Participation active** : vraie consultation sur l'éclairage
- **Réactivité** : pannes signalées et réparées rapidement
- **Transparence** : voir l'impact de nos impôts sur l'éclairage
- **Sécurité renforcée** : éclairage adapté aux vrais besoins

### Pour la mairie
- **Maintenance prédictive** : anticiper les pannes
- **Optimisation budgétaire** : éclairage juste nécessaire
- **Données d'usage** : comprendre les flux dans le village
- **Communication** : montrer l'innovation aux habitants

### Pour l'environnement
- **Économie maximale** : éclairage au plus juste besoin
- **Pollution lumineuse réduite** : respect de la faune nocturne
- **Durée de vie prolongée** : LED moins sollicitées
- **Bilan carbone** : suivi des économies d'énergie

## Mise en œuvre progressive

### Phase 1 : Pilot rue des Granges (3 mois)
- **3 lampadaires intelligents** avec capteurs complets
- **Application** : version beta avec 20 testeurs volontaires
- **Mesures** : consommation, satisfaction, pannes

### Phase 2 : Extension (6 mois)
- **Déploiement** : autres rues selon budget et retours
- **Application publique** : tous les habitants
- **Formation** : ateliers d'utilisation pour les moins connectés

### Coût différentiel
- **Surcoût par lampadaire** : +300€ pour capteurs intelligents
- **Application** : 2000€ développement initial
- **Serveur/maintenance** : 500€/an
- **Retour investissement** : 2-3 ans (économies + efficacité)

## Pourquoi cette version va plus loin

L'idée de Pierre était excellente pour l'efficacité énergétique. Cette version ajoute l'intelligence collective et fait des habitants de vrais acteurs de leur environnement lumineux.

Un petit village qui innove et implique ses citoyens ! 💡📱🌙`,
      creators: [users[2]], // Sophie (enseignante, aime l'innovation participative)
      supporters: [users[1].id, users[2].id, users[3].id, currentUser.id], // Pierre soutient l'évolution de son idée
      status: 'published',
      sourceIdeas: ['2'], // Basée sur l'idée d'éclairage de Pierre
      sourcePosts: [],
      sourceDiscussions: [],
      derivedIdeas: [],
      discussionIds: ['dt27', 'dt28'],
      ratingCriteria: defaultRatingCriteria,
      ratings: [
        { criterionId: 'potential', value: 5, userId: '1' },
        { criterionId: 'potential', value: 4, userId: '3' },
        { criterionId: 'feasibility', value: 3, userId: '1' },
        { criterionId: 'feasibility', value: 2, userId: '3' },
        { criterionId: 'completion', value: 4, userId: '1' },
        { criterionId: 'completion', value: 4, userId: '3' }
      ],
      createdAt: new Date('2024-01-30'),
      tags: ['participatif', 'numérique', 'innovation']
    }
  ];
}

// Export the ideas lazily
export const mockIdeas = getMockIdeas();

// Fonction pour récupérer une idée avec ses données liées chargées dynamiquement
export function getIdeaWithRelatedData(ideaId: string): Idea | undefined {
  const idea = mockIdeas.find(i => i.id === ideaId);
  if (!idea) return undefined;

  const versions = getVersionsForIdea(ideaId);
  
  console.log(`Loading idea ${ideaId} - found ${versions.length} versions`);

  return {
    ...idea,
    ideaVersions: versions
  };
}