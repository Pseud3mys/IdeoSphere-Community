import { DiscussionTopic } from '../types';
import { users, currentUser } from './users';

// Discussions indépendantes qui peuvent être liées à des idées
export const discussionTopics: DiscussionTopic[] = [
  {
    id: 'dt1',
    title: 'Comment organiser les parcelles du potager collectif ?',
    type: 'question',
    authorId: users[0].id, // ✅ Marie qui a créé l'idée - ID au lieu de l'objet
    content: 'Pour mon idée de potager derrière la mairie, je me demande comment bien organiser l\'espace ? Quelle taille pour les parcelles individuelles ? Et comment gérer la zone commune ?',
    timestamp: new Date('2024-01-12T10:30:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp1',
        authorId: users[1].id, // ✅ Pierre l'artisan qui s'y connaît en jardinage - ID au lieu de l'objet
        content: 'Excellente question ! Moi qui jardine depuis 20 ans, je dirais 10m² par famille c\'est parfait pour commencer. Pas trop grand à entretenir, mais assez pour avoir des légumes variés. Pour la zone commune : aromates au centre, composteur au fond.',
        timestamp: new Date('2024-01-12T11:15:00'),
        upvotes: ['1', '2', '4', 'current'],
        isAnswer: true
      },
      {
        id: 'dp2',
        authorId: users[2].id, // ✅ Sophie l'enseignante - ID au lieu de l'objet
        content: 'En tant que maman, je pense aussi qu\'il faut prévoir un petit espace pour que les enfants puissent aider sans piétiner les cultures. Une allée centrale assez large ?',
        timestamp: new Date('2024-01-12T14:00:00'),
        upvotes: ['1', '3', 'current'],
        isAnswer: false
      }
    ]
  },
  {
    id: 'dt2', 
    title: 'Calendrier des légumes : quoi planter quand ?',
    type: 'question',
    authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
    content: 'Pour le potager collectif, j\'aimerais qu\'on se coordonne un peu sur les plantations. Qui connaît le calendrier des légumes qui poussent bien dans notre région ?',
    timestamp: new Date('2024-01-18T09:00:00'),
    upvotes: ['1', '2', '4', 'current'],
    posts: [
      {
        id: 'dp3',
        authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
        content: 'Je peux aider ! Printemps (mars-mai) : radis, épinards, petits pois, carottes. Été (mai-juillet) : tomates cerises, courgettes, haricots verts. Automne (août-septembre) : mâche, choux, poireaux. Les tomates, on les plante après les saints de glace !',
        timestamp: new Date('2024-01-18T10:30:00'),
        upvotes: ['1', '2', '3', 'current'],
        isAnswer: true
      }
    ]
  },
  {
    id: 'dt3',
    title: 'Système d\'arrosage et récupération d\'eau',
    type: 'question', 
    authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
    content: 'J\'ai une idée pour récupérer l\'eau de pluie de la mairie pour le potager. C\'est faisable niveau technique ? Et comment on organise l\'arrosage entre nous ?',
    timestamp: new Date('2024-01-22T16:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp4',
        authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
        content: 'Excellente idée Thomas ! C\'est tout à fait faisable. Il faut juste un système de gouttières qui dirige vers des récupérateurs de 500L. Pour l\'arrosage, on peut faire un planning hebdomadaire par parcelle.',
        timestamp: new Date('2024-01-22T17:30:00'),
        upvotes: ['2', '3', '4', 'current'],
        isAnswer: true
      }
    ]
  },
  {
    id: 'dt4',
    title: 'Quels outils prévoir pour le repair café ?',
    type: 'question',
    authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
    content: 'Pour l\'idée de repair café de Thomas, il faut qu\'on prévoit les outils de base. Qu\'est-ce que vous pensez qu\'il faut absolument avoir ?',
    timestamp: new Date('2024-01-18T14:00:00'),
    upvotes: ['2', '3', '4', 'current'],
    posts: [
      {
        id: 'dp5',
        authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
        content: 'Bonne question ! Moi je peux apporter : tournevis, pinces, multimètre, fer à souder. Pour l\'électroménager de base ça va. Pour les vêtements, il faut machine à coudre, fils, aiguilles...',
        timestamp: new Date('2024-01-18T15:00:00'),
        upvotes: ['1', '2', 'current'],
        isAnswer: false
      },
      {
        id: 'dp6',
        authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
        content: 'Pour la couture je peux apporter ma machine ! Et j\'ai plein de fils, boutons, fermetures. Emma, tu peux aider pour les vélos ?',
        timestamp: new Date('2024-01-18T16:30:00'),
        upvotes: ['1', '3', 'current'],
        isAnswer: false
      }
    ]
  },
  {
    id: 'dt5',
    title: 'Où organiser les repair cafés ?',
    type: 'question',
    authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
    content: 'Pour les repair cafés mensuels, il nous faut un lieu. La salle des associations serait parfaite, mais comment on fait la demande ? Et faut-il prévoir autre chose ?',
    timestamp: new Date('2024-01-19T10:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp7',
        authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
        content: 'Je peux demander à la mairie ! En tant que commerçante je les connais bien. Il faut juste réserver à l\'avance et laisser propre après. Pour l\'électricité et l\'eau c\'est parfait là-bas.',
        timestamp: new Date('2024-01-19T11:00:00'),
        upvotes: ['2', '3', '4', 'current'],
        isAnswer: true
      }
    ]
  },
  {
    id: 'dt6',
    title: 'Comment on communique sur le repair café ?',
    type: 'suggestion',
    authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
    content: 'Il faut qu\'on fasse connaître notre repair café ! Affichage, bouche-à-oreille... Comment on s\'organise pour que les gens viennent ?',
    timestamp: new Date('2024-01-25T14:00:00'),
    upvotes: ['1', '3', '4', 'current'],
    posts: [
      {
        id: 'dp8',
        authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
        content: 'Je peux mettre une affiche dans ma pharmacie ! Et peut-être faire passer l\'info aux autres commerçants. Le boulanger sera partant j\'en suis sûre.',
        timestamp: new Date('2024-01-25T15:30:00'),
        upvotes: ['2', '3', 'current'],
        isAnswer: false
      },
      {
        id: 'dp9',
        authorId: users[3].id, // ✅ Emma - ID au lieu de l'objet
        content: 'Moi je peux en parler aux parents à l\'école ! Beaucoup ont des objets cassés qui traînent à la maison.',
        timestamp: new Date('2024-01-25T16:00:00'),
        upvotes: ['1', '2', 'current'],
        isAnswer: false
      }
    ]
  },
  {
    id: 'dt7',
    title: 'Comment équilibrer les échanges de services ?',
    type: 'question',
    authorId: users[2].id, // ✅ Sophie qui a créé l'idée - ID au lieu de l'objet
    content: 'Mon idée d\'entraide entre voisins me tient à cœur, mais comment on fait pour que ce soit équitable ? Que personne se sente redevable ou profiteur ?',
    timestamp: new Date('2024-01-23T09:00:00'),
    upvotes: ['1', '3', '4', 'current'],
    posts: [
      {
        id: 'dp10',
        authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
        content: 'Excellente question ! J\'ai vu un système de "monnaie temps" ailleurs : 1 heure donnée = 1 crédit, 1 heure reçue = -1 crédit. Pas d\'argent, juste un équilibre. On peut tenir un carnet simple à la pharmacie.',
        timestamp: new Date('2024-01-23T10:30:00'),
        upvotes: ['2', '3', '4', 'current'],
        isAnswer: true
      }
    ]
  },
  {
    id: 'dt8',
    title: 'Organisation pratique du réseau d\'entraide',
    type: 'general',
    authorId: users[3].id, // ✅ Emma - ID au lieu de l'objet
    content: 'L\'idée de réseau d\'entraide de Sophie est super ! Comment on s\'organise concrètement ? Qui fait quoi ? Comment on communique ?',
    timestamp: new Date('2024-01-27T10:00:00'),
    upvotes: ['1', '2', '4', 'current'],
    posts: [
      {
        id: 'dp11',
        authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
        content: 'Je pense qu\'on peut commencer simple : un référent par quartier qui fait le lien. Moi je peux m\'occuper du centre, qui veut les autres secteurs ?',
        timestamp: new Date('2024-01-27T11:00:00'),
        upvotes: ['1', '3', 'current'],
        isAnswer: false
      },
      {
        id: 'dp12',
        authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
        content: 'Moi je peux prendre le secteur vers l\'école ! Et pour communiquer, on peut faire un groupe WhatsApp du village ?',
        timestamp: new Date('2024-01-27T14:00:00'),
        upvotes: ['1', '2', 'current'],
        isAnswer: false
      }
    ]
  },
  {
    id: 'dt9',
    title: 'Emplacements pour les boîtes d\'échange',
    type: 'question',
    authorId: users[4].id, // ✅ Thomas qui a créé l'idée - ID au lieu de l'objet
    content: 'Pour les boîtes à livres et grainothèque, où est-ce qu\'on les met pour que ce soit pratique et visible ? Il faut que les gens passent souvent devant !',
    timestamp: new Date('2024-01-15T14:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp13',
        authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
        content: 'La pharmacie c\'est parfait pour la grainothèque ! Les gens passent souvent et au printemps tout le monde pense jardinage. Pour les livres : école pour les enfants, arrêt de bus pour les adultes ?',
        timestamp: new Date('2024-01-15T15:30:00'),
        upvotes: ['2', '3', '4', 'current'],
        isAnswer: true
      },
      {
        id: 'dp14',
        authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
        content: 'Et sur la place du marché aussi ! Comme ça le samedi matin quand il y a du monde, ça se voit bien.',
        timestamp: new Date('2024-01-15T17:00:00'),
        upvotes: ['1', '3', 'current'],
        isAnswer: false
      }
    ]
  },
  {
    id: 'dt10',
    title: 'Entretien et gestion des boîtes d\'échange',
    type: 'question',
    authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
    content: 'Les boîtes d\'échange c\'est une super idée ! Mais comment on s\'assure qu\'elles restent propres et bien remplies ? Il faut prévoir l\'entretien.',
    timestamp: new Date('2024-01-30T09:00:00'),
    upvotes: ['1', '3', '4', 'current'],
    posts: [
      {
        id: 'dp15',
        authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
        content: 'Bonne question ! Je propose un référent par boîte. Vérification hebdomadaire, tri des livres abîmés, nettoyage si besoin. Moi je peux m\'occuper de celle de l\'école.',
        timestamp: new Date('2024-01-30T10:30:00'),
        upvotes: ['1', '2', '3', 'current'],
        isAnswer: true
      }
    ]
  },
  
  // NOUVELLES DISCUSSIONS POUR L'IDÉE "DES BANCS DANS NOS RUES"
  {
    id: 'dt11',
    title: 'Quels emplacements prioritaires pour les bancs ?',
    type: 'question',
    authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
    content: 'Pour l\'idée des bancs dans nos rues, il faut qu\'on définisse ensemble les emplacements les plus importants. Où est-ce que vous en auriez vraiment besoin ?',
    timestamp: new Date('2024-01-11T10:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp16',
        authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
        content: 'Moi je dirais devant l\'école en priorité ! Quand j\'attends Emma, il n\'y a nulle part où s\'asseoir. Et les grands-parents qui viennent chercher les petits seraient contents.',
        timestamp: new Date('2024-01-11T11:30:00'),
        upvotes: ['1', '3', '4', 'current'],
        isAnswer: false
      },
      {
        id: 'dp17',
        authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
        content: 'D\'accord avec Sophie ! Et devant la pharmacie aussi. Quand Marie n\'est pas là et qu\'on attend l\'ouverture, on reste debout. Un banc serait parfait.',
        timestamp: new Date('2024-01-11T14:00:00'),
        upvotes: ['2', '3', 'current'],
        isAnswer: true
      }
    ]
  },
  {
    id: 'dt12',
    title: 'Budget et financement des bancs',
    type: 'question',
    authorId: users[3].id, // ✅ Emma - ID au lieu de l'objet
    content: 'Pour les bancs, c\'est une excellente idée ! Mais ça coûte combien ? Et comment on finance ça tous ensemble ?',
    timestamp: new Date('2024-01-12T16:00:00'),
    upvotes: ['1', '2', '4', 'current'],
    posts: [
      {
        id: 'dp18',
        authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
        content: 'J\'ai regardé : banc simple en bois = 150-200€, avec dossier = 250-300€. Si on est 20 familles à participer, ça fait 15€ par famille pour un banc ! Et la mairie peut sûrement aider.',
        timestamp: new Date('2024-01-12T17:30:00'),
        upvotes: ['2', '3', '4', 'current'],
        isAnswer: true
      }
    ]
  },
  {
    id: 'dt13',
    title: 'Quel type de bancs choisir ?',
    type: 'suggestion',
    authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
    content: 'Pour les bancs, il faut qu\'on choisisse bien ! Bois, métal, avec ou sans dossier... Qu\'est-ce qui résisterait le mieux et serait confortable ?',
    timestamp: new Date('2024-01-14T09:00:00'),
    upvotes: ['1', '3', '4', 'current'],
    posts: [
      {
        id: 'dp19',
        authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
        content: 'Pour les personnes âgées, il faut absolument un dossier ! Mon père ne peut plus s\'asseoir sur des bancs sans. Et en bois c\'est plus chaleureux.',
        timestamp: new Date('2024-01-14T10:00:00'),
        upvotes: ['1', '3', 'current'],
        isAnswer: false
      },
      {
        id: 'dp20',
        authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
        content: 'Le bois c\'est joli mais ça demande de l\'entretien. Les bancs métal avec lattes bois c\'est plus durable. Et avec dossier c\'est mieux pour tout le monde.',
        timestamp: new Date('2024-01-14T15:00:00'),
        upvotes: ['1', '2', '4', 'current'],
        isAnswer: false
      }
    ]
  },

  // NOUVELLES DISCUSSIONS POUR L'IDÉE "NIDS DE POULE RUE DES ÉCOLES"
  {
    id: 'dt14',
    title: 'Comment bien signaler les nids de poule à la mairie ?',
    type: 'question',
    authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
    content: 'Pour l\'idée des nids de poule, il faut qu\'on soit efficaces dans notre signalement ! Quelqu\'un connaît la procédure exacte ?',
    timestamp: new Date('2024-01-19T10:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp21',
        authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
        content: 'Il faut faire un signalement écrit avec photos ! Le mieux c\'est de localiser précisément (numéro le plus proche) et de décrire les dimensions. Et surtout insister sur le danger.',
        timestamp: new Date('2024-01-19T11:00:00'),
        upvotes: ['2', '3', '4', 'current'],
        isAnswer: true
      }
    ]
  },
  {
    id: 'dt15',
    title: 'Qui peut nous aider pour les travaux de voirie ?',
    type: 'question',
    authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
    content: 'Les nids de poule, c\'est un vrai problème ! Mais qui fait les travaux ? La mairie ? Le département ? Et si on faisait nous-mêmes en attendant ?',
    timestamp: new Date('2024-01-20T14:00:00'),
    upvotes: ['2', '3', '4', 'current'],
    posts: [
      {
        id: 'dp22',
        authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
        content: 'Attention ! Il ne faut surtout pas faire nous-mêmes. Si quelqu\'un se blesse à cause de notre réparation, on est responsables. Il faut passer par la mairie obligatoirement.',
        timestamp: new Date('2024-01-20T15:30:00'),
        upvotes: ['1', '3', '4', 'current'],
        isAnswer: true
      }
    ]
  },
  {
    id: 'dt16',
    title: 'Solutions temporaires en attendant les réparations',
    type: 'suggestion',
    authorId: users[3].id, // ✅ Emma - ID au lieu de l'objet
    content: 'En attendant que la mairie répare, on pourrait au moins signaler les trous dangereux ? Histoire d\'éviter les accidents.',
    timestamp: new Date('2024-01-21T09:00:00'),
    upvotes: ['1', '2', '4', 'current'],
    posts: [
      {
        id: 'dp23',
        authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
        content: 'Bonne idée ! On peut mettre des cônes orange autour du gros trou devant l\'école. Et pourquoi pas un panneau "Attention trou" ? Ça coûte rien et ça peut éviter des chutes.',
        timestamp: new Date('2024-01-21T10:30:00'),
        upvotes: ['1', '2', '3', 'current'],
        isAnswer: false
      }
    ]
  },

  // NOUVELLES DISCUSSIONS POUR L'IDÉE "STATIONNEMENT DEVANT L'ÉCOLE"
  {
    id: 'dt17',
    title: 'Organisation des parents bénévoles pour la circulation',
    type: 'question',
    authorId: users[3].id, // ✅ Emma - ID au lieu de l'objet
    content: 'L\'idée d\'organiser le stationnement école est excellente ! Mais comment on fait un planning de bénévoles qui tient la route ?',
    timestamp: new Date('2024-01-26T08:00:00'),
    upvotes: ['1', '2', '4', 'current'],
    posts: [
      {
        id: 'dp24',
        authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
        content: 'Je propose : chaque parent 1 fois par mois, par créneaux de 15 minutes (8h-8h15 et 16h30-16h45). Et on fait une liste de remplaçants pour les imprévus.',
        timestamp: new Date('2024-01-26T09:00:00'),
        upvotes: ['2', '3', '4', 'current'],
        isAnswer: true
      }
    ]
  },
  {
    id: 'dt18',
    title: 'Règles de stationnement : qu\'est-ce qui serait réaliste ?',
    type: 'question',
    authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
    content: 'Pour que ça marche, il faut des règles claires mais pas trop strictes ! Qu\'est-ce que vous pensez qui serait accepté par tous ?',
    timestamp: new Date('2024-01-27T16:00:00'),
    upvotes: ['1', '3', '4', 'current'],
    posts: [
      {
        id: 'dp25',
        authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
        content: 'Maximum 5 minutes devant l\'école, moteur éteint. Priorité aux familles avec enfants petits ou handicap. Et surtout : jamais sur les trottoirs !',
        timestamp: new Date('2024-01-27T17:00:00'),
        upvotes: ['2', '3', 'current'],
        isAnswer: false
      }
    ]
  },
  {
    id: 'dt19',
    title: 'Comment encourager les alternatives à la voiture ?',
    type: 'suggestion',
    authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
    content: 'Le stationnement c\'est bien, mais si on pouvait réduire le nombre de voitures, ce serait encore mieux ! Pédibus, covoiturage... des idées ?',
    timestamp: new Date('2024-01-28T10:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp26',
        authorId: users[3].id, // ✅ Emma - ID au lieu de l'objet
        content: 'Le pédibus ça m\'intéresse ! Si on est 3-4 parents du même secteur, on peut alterner. Et les enfants adorent marcher en groupe.',
        timestamp: new Date('2024-01-28T11:30:00'),
        upvotes: ['1', '2', 'current'],
        isAnswer: false
      }
    ]
  },
  // ========================================================
  // DISCUSSIONS GROUPE : Du Mur Gris à la Fresque Collective
  // Discussions dans le groupe projet dédié
  // ========================================================
  {
    id: 'dt-fresque-1',
    title: 'Quelles thématiques pour la fresque ?',
    type: 'question',
    authorId: '3', // Sophie Laurent
    content: 'On a fait un premier tour avec les enfants et plusieurs thèmes ressortent : la nature en ville, les 4 saisons, l\'histoire de l\'école, l\'imaginaire des enfants... Comment faire un choix cohérent qui raconte une vraie histoire ?',
    timestamp: new Date('2024-03-22T15:00:00'),
    upvotes: ['3', '2', '13', '14', '1'],
    groupId: 'groups/g6',
    posts: [
      {
        id: 'dp-fresque-1',
        authorId: '14', // Camille Artois (artiste)
        content: 'Super question ! Artistiquement, je propose qu\'on mixe plusieurs thèmes dans une composition fluide. Par exemple : les 4 saisons comme structure générale, avec des éléments d\'histoire locale intégrés, et l\'imaginaire des enfants qui "habite" chaque saison. Ça raconte le cycle de la vie à l\'école !',
        timestamp: new Date('2024-03-22T16:30:00'),
        upvotes: ['3', '2', '13', '1'],
        isAnswer: true
      },
      {
        id: 'dp-fresque-2',
        authorId: '13', // Léa Dumont
        content: 'J\'adore cette idée ! Et si chaque saison correspondait aussi à une classe ? Genre le printemps avec les CP, l\'été avec les CE1... ça implique tout le monde et chaque classe a son "morceau" de fresque 🎨',
        timestamp: new Date('2024-03-22T17:00:00'),
        upvotes: ['3', '14', '2'],
        isAnswer: false
      },
      {
        id: 'dp-fresque-3',
        authorId: '2', // Pierre Martin
        content: 'Pratiquement, ça fait 4 sections de 3,75m chacune. C\'est pile la bonne taille pour travailler en petits groupes sans se marcher dessus !',
        timestamp: new Date('2024-03-22T18:00:00'),
        upvotes: ['3', '14'],
        isAnswer: false
      }
    ]
  },
  {
    id: 'dt-fresque-2',
    title: 'Autorisation mairie : quelles démarches exactement ?',
    type: 'question',
    authorId: '2', // Pierre Martin
    content: 'Marc de la mairie nous a dit que le principe était OK, mais il faut monter un dossier. Quelqu\'un connaît les documents nécessaires ? Assurance, plan, convention avec l\'école... ?',
    timestamp: new Date('2024-03-25T10:00:00'),
    upvotes: ['2', '3', '13', '15'],
    groupId: 'groups/g6',
    posts: [
      {
        id: 'dp-fresque-4',
        authorId: '15', // Marc Lefèvre (mairie)
        content: 'Voici ce qu\'il nous faut pour valider : 1) Esquisse du projet avec dimensions, 2) Accord écrit de la direction d\'école, 3) Attestation d\'assurance de l\'artiste, 4) Planning prévisionnel. Je peux vous envoyer le modèle de convention à signer entre la mairie, l\'école et l\'association de parents.',
        timestamp: new Date('2024-03-25T11:00:00'),
        upvotes: ['2', '3', '13', '14'],
        isAnswer: true
      },
      {
        id: 'dp-fresque-5',
        authorId: '3', // Sophie
        content: 'Merci Marc ! Je m\'occupe de l\'accord de la directrice (elle est déjà super enthousiaste). Camille, tu peux nous faire l\'esquisse pour fin mars ?',
        timestamp: new Date('2024-03-25T14:00:00'),
        upvotes: ['2', '14'],
        isAnswer: false
      },
      {
        id: 'dp-fresque-6',
        authorId: '14', // Camille
        content: 'Oui ! Je vais faire 2-3 propositions basées sur les thèmes qu\'on a définis. Je vous les partage semaine prochaine pour qu\'on vote tous ensemble 🎨',
        timestamp: new Date('2024-03-25T15:30:00'),
        upvotes: ['3', '2', '13'],
        isAnswer: false
      }
    ]
  },
  {
    id: 'dt-fresque-3',
    title: 'Organisation des ateliers avec les enfants',
    type: 'suggestion',
    authorId: '13', // Léa Dumont
    content: 'Pour que chaque élève puisse participer, je propose des rotations par demi-classe sur 2 semaines. Matin : travail sur la fresque, après-midi : ateliers préparatoires (croquis, test couleurs...). Qu\'en pensez-vous ?',
    timestamp: new Date('2024-03-28T09:00:00'),
    upvotes: ['13', '3', '2', '14', '1'],
    groupId: 'groups/g6',
    posts: [
      {
        id: 'dp-fresque-7',
        authorId: '3', // Sophie
        content: 'Super organisation ! Côté école on peut bloquer les créneaux d\'arts plastiques pendant 2 semaines en juin. Par contre il faut prévoir des activités alternatives pour l\'autre moitié de classe... Des parents peuvent encadrer ?',
        timestamp: new Date('2024-03-28T10:30:00'),
        upvotes: ['13', '2', '1'],
        isAnswer: false
      },
      {
        id: 'dp-fresque-8',
        authorId: '1', // Marie Dubois
        content: 'Moi je peux ! Je propose des ateliers "histoire de l\'école" avec photos anciennes et témoignages. Les enfants adorent et ça nourrit aussi le projet fresque 📚',
        timestamp: new Date('2024-03-28T11:00:00'),
        upvotes: ['3', '13', '2'],
        isAnswer: false
      },
      {
        id: 'dp-fresque-9',
        authorId: '4', // Thomas Chen
        content: 'Je peux faire des ateliers "communication du projet" : les enfants créent des affiches, prennent des photos, font de petites vidéos... On aura un super contenu pour partager le projet !',
        timestamp: new Date('2024-03-28T14:00:00'),
        upvotes: ['13', '3'],
        isAnswer: false
      }
    ]
  },
  {
    id: 'dt-fresque-4',
    title: 'Budget : on cherche encore 500€',
    type: 'discussion',
    authorId: '2', // Pierre Martin
    content: 'Petit point budget : la mairie finance 1500€ ✅, les parents d\'élèves 500€ ✅, mais il nous manque encore 500€ pour boucler (peintures de qualité + matériel de protection). Des idées de financement ?',
    timestamp: new Date('2024-04-02T16:00:00'),
    upvotes: ['2', '3', '13', '1', '15'],
    groupId: 'groups/g6',
    posts: [
      {
        id: 'dp-fresque-10',
        authorId: '13', // Léa
        content: 'On pourrait lancer un financement participatif en ligne ? Genre 20-25€ par famille, ça fait vite grimper. Et on ouvre aussi aux habitants du quartier qui ne sont pas parents d\'élèves !',
        timestamp: new Date('2024-04-02T17:00:00'),
        upvotes: ['2', '3', '14'],
        isAnswer: false
      },
      {
        id: 'dp-fresque-11',
        authorId: '1', // Marie
        content: 'Bonne idée ! Et pourquoi pas une vente de gâteaux à l\'école aussi ? Traditionnel mais efficace. On l\'a déjà fait pour la classe verte, on a récolté 380€ !',
        timestamp: new Date('2024-04-02T18:00:00'),
        upvotes: ['3', '13'],
        isAnswer: false
      },
      {
        id: 'dp-fresque-12',
        authorId: '15', // Marc Lefèvre (mairie)
        content: 'Je peux peut-être débloquer 200€ supplémentaires du budget "participation citoyenne" si vous montez un bon dossier. Contactez-moi pour voir les modalités !',
        timestamp: new Date('2024-04-03T09:00:00'),
        upvotes: ['2', '3', '13', '14'],
        isAnswer: true
      }
    ]
  },
  {
    id: 'dt-fresque-5',
    title: 'Sécurité : protections et organisation du chantier',
    type: 'question',
    authorId: '14', // Camille Artois
    content: 'Question importante : la sécurité pendant les ateliers. On travaille en hauteur (échafaudage), avec des produits (peinture), et des enfants. Il faut qu\'on soit carrés sur l\'organisation. Qui gère quoi ?',
    timestamp: new Date('2024-04-05T14:00:00'),
    upvotes: ['14', '3', '2', '15', '13'],
    groupId: 'groups/g6',
    posts: [
      {
        id: 'dp-fresque-13',
        authorId: '2', // Pierre Martin
        content: 'Je m\'occupe de l\'échafaudage (j\'ai le matos pro et les certifs). Zone interdite bien balisée, harnais pour les adultes en hauteur. Les enfants ne montent PAS, ils travaillent au sol sur les parties basses.',
        timestamp: new Date('2024-04-05T15:00:00'),
        upvotes: ['14', '3', '15'],
        isAnswer: true
      },
      {
        id: 'dp-fresque-14',
        authorId: '14', // Camille
        content: 'Parfait ! De mon côté : peintures acryliques non-toxiques uniquement, gants et tabliers pour tous, zone de lavage des pinceaux avec bacs dédiés. Et jamais plus de 10 enfants en même temps sur le chantier.',
        timestamp: new Date('2024-04-05T16:00:00'),
        upvotes: ['3', '2', '13'],
        isAnswer: false
      },
      {
        id: 'dp-fresque-15',
        authorId: '3', // Sophie
        content: 'Côté école : 2 adultes encadrants minimum par groupe d\'enfants (1 enseignant + 1 parent). Trousse de premiers secours sur place. Et briefing sécurité obligatoire avant chaque session !',
        timestamp: new Date('2024-04-05T17:00:00'),
        upvotes: ['14', '2', '13'],
        isAnswer: false
      }
    ]
  }
];

// Fonction helper pour récupérer les discussions liées à une idée
export function getDiscussionsForIdea(ideaId: string, idea?: any): DiscussionTopic[] {
  // Mapping statique des idées vers leurs discussions
  const ideaDiscussionMap: Record<string, string[]> = {
    '1': ['dt11', 'dt12', 'dt13'], // Des bancs dans nos rues -> emplacements, financement, modèles
    '2': ['dt4', 'dt5', 'dt6'], // Repair café -> outils, lieu, communication
    '3': ['dt7', 'dt8'], // Échange de services -> équilibre + organisation
    '4': ['dt14', 'dt15', 'dt16'], // Nids de poule -> signalement, procédures, solutions temporaires
    '5': ['dt17', 'dt18', 'dt19'], // Stationnement école -> bénévoles, règles, alternatives
    // Pour les versions d'idées
    'iv1': ['dt1', 'dt3'], // Version améliorée potager -> organisation + arrosage
    'iv2': ['dt7'], // Version améliorée échange -> équilibre
    // Pour les autres idées futures
    'potager': ['dt1', 'dt2', 'dt3'], // Potager partagé -> organisation, calendrier, arrosage
    'boites': ['dt9', 'dt10'] // Boîtes d'échange -> emplacements + entretien
  };

  // Si on a l'objet idée complet avec ses discussionIds, les utiliser en priorité
  let discussionIds: string[] = [];
  
  if (idea && idea.discussionIds && idea.discussionIds.length > 0) {
    discussionIds = idea.discussionIds;
  } else {
    // Sinon utiliser le mapping statique pour la compatibilité
    discussionIds = ideaDiscussionMap[ideaId] || [];
  }

  // Suppression du log qui causait des boucles de debug
  
  return discussionTopics.filter(discussion => discussionIds.includes(discussion.id));
}

// Removed getResolvedQuestionsFromDiscussions - functionality moved to components