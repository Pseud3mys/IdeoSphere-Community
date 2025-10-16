import { DiscussionTopic } from '../types';
import { users, currentUser } from './users';

// Discussions indépendantes qui peuvent être liées à des idées
export const discussionTopics: DiscussionTopic[] = [
  {
    id: 'dt1',
    title: 'Comment organiser les parcelles du potager collectif ?',
    type: 'question',
    author: users[0], // Marie qui a créé l'idée
    content: 'Pour mon idée de potager derrière la mairie, je me demande comment bien organiser l\'espace ? Quelle taille pour les parcelles individuelles ? Et comment gérer la zone commune ?',
    timestamp: new Date('2024-01-12T10:30:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp1',
        author: users[1], // Pierre l'artisan qui s'y connaît en jardinage
        content: 'Excellente question ! Moi qui jardine depuis 20 ans, je dirais 10m² par famille c\'est parfait pour commencer. Pas trop grand à entretenir, mais assez pour avoir des légumes variés. Pour la zone commune : aromates au centre, composteur au fond.',
        timestamp: new Date('2024-01-12T11:15:00'),
        upvotes: ['1', '2', '4', 'current'],
        isAnswer: true
      },
      {
        id: 'dp2',
        author: users[2], // Sophie l'enseignante
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
    author: users[2], // Sophie
    content: 'Pour le potager collectif, j\'aimerais qu\'on se coordonne un peu sur les plantations. Qui connaît le calendrier des légumes qui poussent bien dans notre région ?',
    timestamp: new Date('2024-01-18T09:00:00'),
    upvotes: ['1', '2', '4', 'current'],
    posts: [
      {
        id: 'dp3',
        author: users[1], // Pierre
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
    author: users[4], // Thomas
    content: 'J\'ai une idée pour récupérer l\'eau de pluie de la mairie pour le potager. C\'est faisable niveau technique ? Et comment on organise l\'arrosage entre nous ?',
    timestamp: new Date('2024-01-22T16:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp4',
        author: users[1], // Pierre
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
    author: users[1], // Pierre
    content: 'Pour l\'idée de repair café de Thomas, il faut qu\'on prévoit les outils de base. Qu\'est-ce que vous pensez qu\'il faut absolument avoir ?',
    timestamp: new Date('2024-01-18T14:00:00'),
    upvotes: ['2', '3', '4', 'current'],
    posts: [
      {
        id: 'dp5',
        author: users[4], // Thomas
        content: 'Bonne question ! Moi je peux apporter : tournevis, pinces, multimètre, fer à souder. Pour l\'électroménager de base ça va. Pour les vêtements, il faut machine à coudre, fils, aiguilles...',
        timestamp: new Date('2024-01-18T15:00:00'),
        upvotes: ['1', '2', 'current'],
        isAnswer: false
      },
      {
        id: 'dp6',
        author: users[2], // Sophie
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
    author: users[4], // Thomas
    content: 'Pour les repair cafés mensuels, il nous faut un lieu. La salle des associations serait parfaite, mais comment on fait la demande ? Et faut-il prévoir autre chose ?',
    timestamp: new Date('2024-01-19T10:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp7',
        author: users[0], // Marie
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
    author: users[2], // Sophie
    content: 'Il faut qu\'on fasse connaître notre repair café ! Affichage, bouche-à-oreille... Comment on s\'organise pour que les gens viennent ?',
    timestamp: new Date('2024-01-25T14:00:00'),
    upvotes: ['1', '3', '4', 'current'],
    posts: [
      {
        id: 'dp8',
        author: users[0], // Marie
        content: 'Je peux mettre une affiche dans ma pharmacie ! Et peut-être faire passer l\'info aux autres commerçants. Le boulanger sera partant j\'en suis sûre.',
        timestamp: new Date('2024-01-25T15:30:00'),
        upvotes: ['2', '3', 'current'],
        isAnswer: false
      },
      {
        id: 'dp9',
        author: users[3], // Emma
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
    author: users[2], // Sophie qui a créé l'idée
    content: 'Mon idée d\'entraide entre voisins me tient à cœur, mais comment on fait pour que ce soit équitable ? Que personne se sente redevable ou profiteur ?',
    timestamp: new Date('2024-01-23T09:00:00'),
    upvotes: ['1', '3', '4', 'current'],
    posts: [
      {
        id: 'dp10',
        author: users[0], // Marie
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
    author: users[3], // Emma
    content: 'L\'idée de réseau d\'entraide de Sophie est super ! Comment on s\'organise concrètement ? Qui fait quoi ? Comment on communique ?',
    timestamp: new Date('2024-01-27T10:00:00'),
    upvotes: ['1', '2', '4', 'current'],
    posts: [
      {
        id: 'dp11',
        author: users[2], // Sophie
        content: 'Je pense qu\'on peut commencer simple : un référent par quartier qui fait le lien. Moi je peux m\'occuper du centre, qui veut les autres secteurs ?',
        timestamp: new Date('2024-01-27T11:00:00'),
        upvotes: ['1', '3', 'current'],
        isAnswer: false
      },
      {
        id: 'dp12',
        author: users[4], // Thomas
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
    author: users[4], // Thomas qui a créé l'idée
    content: 'Pour les boîtes à livres et grainothèque, où est-ce qu\'on les met pour que ce soit pratique et visible ? Il faut que les gens passent souvent devant !',
    timestamp: new Date('2024-01-15T14:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp13',
        author: users[0], // Marie
        content: 'La pharmacie c\'est parfait pour la grainothèque ! Les gens passent souvent et au printemps tout le monde pense jardinage. Pour les livres : école pour les enfants, arrêt de bus pour les adultes ?',
        timestamp: new Date('2024-01-15T15:30:00'),
        upvotes: ['2', '3', '4', 'current'],
        isAnswer: true
      },
      {
        id: 'dp14',
        author: users[1], // Pierre
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
    author: users[0], // Marie
    content: 'Les boîtes d\'échange c\'est une super idée ! Mais comment on s\'assure qu\'elles restent propres et bien remplies ? Il faut prévoir l\'entretien.',
    timestamp: new Date('2024-01-30T09:00:00'),
    upvotes: ['1', '3', '4', 'current'],
    posts: [
      {
        id: 'dp15',
        author: users[4], // Thomas
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
    author: users[0], // Marie
    content: 'Pour l\'idée des bancs dans nos rues, il faut qu\'on définisse ensemble les emplacements les plus importants. Où est-ce que vous en auriez vraiment besoin ?',
    timestamp: new Date('2024-01-11T10:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp16',
        author: users[2], // Sophie
        content: 'Moi je dirais devant l\'école en priorité ! Quand j\'attends Emma, il n\'y a nulle part où s\'asseoir. Et les grands-parents qui viennent chercher les petits seraient contents.',
        timestamp: new Date('2024-01-11T11:30:00'),
        upvotes: ['1', '3', '4', 'current'],
        isAnswer: false
      },
      {
        id: 'dp17',
        author: users[1], // Pierre
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
    author: users[3], // Emma
    content: 'Pour les bancs, c\'est une excellente idée ! Mais ça coûte combien ? Et comment on finance ça tous ensemble ?',
    timestamp: new Date('2024-01-12T16:00:00'),
    upvotes: ['1', '2', '4', 'current'],
    posts: [
      {
        id: 'dp18',
        author: users[0], // Marie
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
    author: users[1], // Pierre
    content: 'Pour les bancs, il faut qu\'on choisisse bien ! Bois, métal, avec ou sans dossier... Qu\'est-ce qui résisterait le mieux et serait confortable ?',
    timestamp: new Date('2024-01-14T09:00:00'),
    upvotes: ['1', '3', '4', 'current'],
    posts: [
      {
        id: 'dp19',
        author: users[2], // Sophie
        content: 'Pour les personnes âgées, il faut absolument un dossier ! Mon père ne peut plus s\'asseoir sur des bancs sans. Et en bois c\'est plus chaleureux.',
        timestamp: new Date('2024-01-14T10:00:00'),
        upvotes: ['1', '3', 'current'],
        isAnswer: false
      },
      {
        id: 'dp20',
        author: users[4], // Thomas
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
    author: users[4], // Thomas
    content: 'Pour l\'idée des nids de poule, il faut qu\'on soit efficaces dans notre signalement ! Quelqu\'un connaît la procédure exacte ?',
    timestamp: new Date('2024-01-19T10:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp21',
        author: users[0], // Marie
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
    author: users[1], // Pierre
    content: 'Les nids de poule, c\'est un vrai problème ! Mais qui fait les travaux ? La mairie ? Le département ? Et si on faisait nous-mêmes en attendant ?',
    timestamp: new Date('2024-01-20T14:00:00'),
    upvotes: ['2', '3', '4', 'current'],
    posts: [
      {
        id: 'dp22',
        author: users[2], // Sophie
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
    author: users[3], // Emma
    content: 'En attendant que la mairie répare, on pourrait au moins signaler les trous dangereux ? Histoire d\'éviter les accidents.',
    timestamp: new Date('2024-01-21T09:00:00'),
    upvotes: ['1', '2', '4', 'current'],
    posts: [
      {
        id: 'dp23',
        author: users[4], // Thomas
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
    author: users[3], // Emma
    content: 'L\'idée d\'organiser le stationnement école est excellente ! Mais comment on fait un planning de bénévoles qui tient la route ?',
    timestamp: new Date('2024-01-26T08:00:00'),
    upvotes: ['1', '2', '4', 'current'],
    posts: [
      {
        id: 'dp24',
        author: users[0], // Marie
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
    author: users[2], // Sophie
    content: 'Pour que ça marche, il faut des règles claires mais pas trop strictes ! Qu\'est-ce que vous pensez qui serait accepté par tous ?',
    timestamp: new Date('2024-01-27T16:00:00'),
    upvotes: ['1', '3', '4', 'current'],
    posts: [
      {
        id: 'dp25',
        author: users[1], // Pierre
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
    author: users[4], // Thomas
    content: 'Le stationnement c\'est bien, mais si on pouvait réduire le nombre de voitures, ce serait encore mieux ! Pédibus, covoiturage... des idées ?',
    timestamp: new Date('2024-01-28T10:00:00'),
    upvotes: ['1', '2', '3', 'current'],
    posts: [
      {
        id: 'dp26',
        author: users[3], // Emma
        content: 'Le pédibus ça m\'intéresse ! Si on est 3-4 parents du même secteur, on peut alterner. Et les enfants adorent marcher en groupe.',
        timestamp: new Date('2024-01-28T11:30:00'),
        upvotes: ['1', '2', 'current'],
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