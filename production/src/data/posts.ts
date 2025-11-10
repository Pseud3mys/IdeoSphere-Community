import { Post } from '../types';
import { users, currentUser, guestUser } from './users';

// Function to create posts data lazily to avoid circular dependencies
export function getMockPosts(): Post[] {
  return [
    {
      id: 'posts/post-1',
      title: 'Manque de bancs dans le village',
      content: 'Il y a vraiment pas assez de bancs dans notre village... 😔 Hier ma voisine âgée a dû s\'appuyer contre un mur pour souffler en revenant des courses. On pourrait pas en installer quelques-uns ?',
      authorId: users[0].id, // Marie
      createdAt: new Date('2024-01-08T10:30:00'),
      supporters: ['1', '2', '3', 'current', 'guest'],
      tags: ['vie-de-quartier', 'vieillesse'],
      groupIds: ['groups/1'], // Groupe "Vivre à Saint-Cloud"
      derivedIdeas: ['ideas/1'], // L'idée des bancs vient de ce post
      derivedPosts: ['posts/post-2', 'posts/post-3'], // Autres posts qui en parlent
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-1',
          authorId: users[3].id, // ✅ Emma - ID au lieu de l'objet
          content: 'Carrément ! Moi avec la poussette, j\'aimerais bien pouvoir m\'arrêter devant la pharmacie 👶',
          createdAt: new Date('2024-01-08T11:15:00'),
          likes: ['1', '3']
        },
        {
          id: 'reply-2',
          authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
          content: 'C\'est vrai qu\'il en faudrait au moins un devant la boulangerie, on fait souvent la queue dehors !',
          createdAt: new Date('2024-01-08T14:20:00'),
          likes: ['1', '2']
        }
      ]
    },
    {
      id: 'posts/post-2',
      content: 'En parlant de bancs... à l\'arrêt de bus aussi ce serait bien ! Surtout quand il pleut et qu\'on doit attendre debout 🚌☔',
      authorId: users[4].id, // Thomas
      createdAt: new Date('2024-01-09T16:45:00'),
      supporters: ['1', '2', '4', 'current'],
      tags: ['vie-de-quartier'],
      derivedIdeas: ['ideas/1'], // Contribue à l'idée des bancs
      derivedPosts: [],
      sourcePosts: ['posts/post-1'], // Suite du post précédent
      replies: [
        {
          id: 'reply-3',
          authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
          content: 'Et près de l\'école ! Pour les parents qui attendent les enfants 🏫',
          createdAt: new Date('2024-01-09T17:20:00'),
          likes: ['3', '4']
        },
        {
          id: 'reply-4',
          authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
          content: 'Oui ! On va peut-être pouvoir monter un projet pour ça... 💡',
          createdAt: new Date('2024-01-09T18:00:00'),
          likes: ['1', '4']
        }
      ]
    },
    {
      id: 'posts/post-3',
      content: 'J\'ai repensé aux bancs... place du village aussi non ? Histoire que ce soit un vrai lieu de rencontre ! Les anciens pourraient s\'y retrouver ☕',
      authorId: users[3].id, // Emma
      createdAt: new Date('2024-01-10T19:00:00'),
      supporters: ['1', '3', '4', 'current'],
      tags: ['vie-de-quartier'],
      derivedIdeas: ['ideas/1'], // Contribue à l'idée des bancs
      derivedPosts: [],
      sourcePosts: ['posts/post-1'], // Suite de la discussion sur les bancs
      replies: [
        {
          id: 'reply-5',
          authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
          content: 'Excellente idée ! Ça redonnerait vie à notre place 🏘️',
          createdAt: new Date('2024-01-10T19:30:00'),
          likes: ['2', '4']
        },
        {
          id: 'reply-6',
          authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
          content: 'Je vais creuser le sujet et voir ce qu\'on peut faire concrètement ! 📝',
          createdAt: new Date('2024-01-10T20:15:00'),
          likes: ['1', '3']
        }
      ]
    },
    {
      id: 'posts/post-4',
      title: 'Besoin de réparer nos appareils',
      content: 'J\'ai encore jeté mon grille-pain ce matin... 😔 Ça m\'embête de jeter alors que Pierre pourrait sûrement le réparer ! On devrait organiser des moments pour bricoler ensemble non ?',
      authorId: users[4].id, // Thomas
      createdAt: new Date('2024-01-12T16:45:00'),
      supporters: ['1', '2', '4', 'current'],
      tags: ['solidarité'],
      groupIds: ['groups/1', 'groups/2'], // Groupes "Vivre à Saint-Cloud" et "Zéro déchet"
      derivedIdeas: ['ideas/2'], // L'idée du café-réparation vient de ce post
      derivedPosts: ['posts/post-9'],
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-7',
          authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
          content: 'Carrément ! J\'ai plein d\'outils et j\'adore réparer. Un samedi par mois ça serait top 🔧',
          createdAt: new Date('2024-01-12T17:20:00'),
          likes: ['3', '4']
        },
        {
          id: 'reply-8',
          authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
          content: 'Génial ! Moi je peux aider pour la couture et les reprises de vêtements 🧵',
          createdAt: new Date('2024-01-12T18:00:00'),
          likes: ['1', '4']
        }
      ]
    },
    {
      id: 'posts/post-5',
      title: 'S\'organiser pour s\'entraider',
      content: 'Hier j\'avais des courses lourdes et j\'aurais bien eu besoin d\'un coup de main... 🛒 En même temps, moi je peux aider avec l\'informatique ! On pourrait pas s\'organiser pour s\'entraider ?',
      authorId: users[2].id, // Sophie
      createdAt: new Date('2024-01-18T19:00:00'),
      supporters: ['1', '3', '4', 'current'],
      tags: ['solidarité'],
      derivedIdeas: ['ideas/3'], // L'idée d'échange de services vient de ce post
      derivedPosts: ['posts/post-10'],
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-9',
          authorId: users[3].id, // ✅ Emma - ID au lieu de l'objet
          content: 'Excellente idée ! Moi je peux aider pour les transports et garde d\'enfants 🚗',
          createdAt: new Date('2024-01-18T19:30:00'),
          likes: ['2', '4']
        },
        {
          id: 'reply-10',
          authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
          content: 'Super ! On pourrait faire un tableau avec qui propose quoi. Ça m\'inspire ! 💡',
          createdAt: new Date('2024-01-18T20:15:00'),
          likes: ['1', '3']
        }
      ]
    },
    {
      id: 'posts/post-6',
      title: 'Les nids de poule rue des Écoles',
      content: 'Sérieusement, les nids de poule rue des Écoles... 🕳️ J\'ai failli perdre une jante ce matin ! Et celui devant l\'école qui fait une mare à chaque pluie, c\'est dangereux pour les gamins !',
      authorId: users[1].id, // Pierre
      createdAt: new Date('2024-01-16T08:15:00'),
      supporters: ['1', '2', 'current'],
      tags: ['vie-de-quartier'],
      groupIds: ['groups/1'], // Groupe "Vivre à Saint-Cloud"
      derivedIdeas: ['ideas/4'], // L'idée sur les nids de poule vient de ce post
      derivedPosts: ['posts/post-11'],
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-11',
          authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
          content: 'Moi j\'ai crevé la semaine dernière ! Il faut qu\'on fasse quelque chose 😤',
          createdAt: new Date('2024-01-16T09:00:00'),
          likes: ['4', '1']
        },
        {
          id: 'reply-12',
          authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
          content: 'On devrait faire un signalement groupé à la mairie, ça aurait plus de poids !',
          createdAt: new Date('2024-01-16T09:30:00'),
          likes: ['1', '2']
        }
      ]
    },
    {
      id: 'posts/post-7',
      title: 'Problème de stationnement devant l\'école',
      content: 'Le stationnement devant l\'école le matin... 😩 C\'est l\'anarchie totale ! Les gamins qui courent entre les voitures, les parents qui s\'engueulent... Il faut qu\'on s\'organise !',
      authorId: users[3].id, // Emma
      createdAt: new Date('2024-01-22T08:45:00'),
      supporters: ['2', '3', 'current'],
      tags: ['jeunesse'],
      groupIds: ['groups/1'], // Groupe "Vivre à Saint-Cloud"
      derivedIdeas: ['ideas/5'], // L'idée sur le stationnement école vient de ce post
      derivedPosts: ['posts/post-8'],
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-13',
          authorId: users[0].id, // ✅ Marie - ID au lieu de l'objet
          content: 'Tellement vrai ! Et nous à la pharmacie on ne peut plus sortir aux heures d\'école 🚗',
          createdAt: new Date('2024-01-22T09:15:00'),
          likes: ['1', '3']
        },
        {
          id: 'reply-14',
          authorId: users[4].id, // ✅ Thomas - ID au lieu de l'objet
          content: 'Peut-être qu\'on pourrait organiser un système de surveillance entre parents ?',
          createdAt: new Date('2024-01-22T10:00:00'),
          likes: ['3', '1']
        }
      ]
    },
    {
      id: 'posts/post-8',
      content: 'Suite au post d\'Emma sur l\'école... On pourrait pas faire des places marquées au sol ? Et peut-être du covoiturage organisé entre parents du même quartier ? 🚸',
      authorId: users[0].id, // Marie
      createdAt: new Date('2024-01-23T17:30:00'),
      supporters: ['1', '3', '4', 'current'],
      tags: ['jeunesse'],
      derivedIdeas: ['ideas/5'], // Contribue à l'idée sur le stationnement école
      derivedPosts: [],
      sourcePosts: ['posts/post-7'], // Suite du post d'Emma
      replies: [
        {
          id: 'reply-15',
          authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
          content: 'Bonne idée le covoiturage ! Moi je peux prendre 2 enfants en plus dans ma voiture 👍',
          createdAt: new Date('2024-01-23T18:00:00'),
          likes: ['1', '3']
        }
      ]
    },
    {
      id: 'posts/post-9',
      content: 'Suite à l\'idée de Thomas pour le repair café : qui a des compétences particulières à partager ? 🛠️ Histoire qu\'on s\'organise par domaines !',
      authorId: users[1].id, // Pierre
      createdAt: new Date('2024-01-28T15:45:00'),
      supporters: ['2', '4', 'current'],
      tags: ['associatif'],
      derivedIdeas: [],
      derivedPosts: [],
      sourcePosts: ['posts/post-4'],
      replies: [
        {
          id: 'reply-16',
          authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
          content: 'Moi couture et petit électroménager ! Emma elle est douée avec les vélos aussi 🚲',
          createdAt: new Date('2024-01-28T16:20:00'),
          likes: ['1', '3']
        }
      ]
    },
    {
      id: 'posts/post-10',
      content: 'J\'adore l\'idée d\'entraide de Sophie ! 🤝 Moi je peux aider pour le jardinage, et Pierre pourrait faire de l\'aide informatique... enfin l\'inverse ! 😅',
      authorId: users[0].id, // Marie
      createdAt: new Date('2024-02-01T09:20:00'),
      supporters: ['2', '3', '4'],
      tags: ['solidarité'],
      derivedIdeas: [],
      derivedPosts: [],
      sourcePosts: ['posts/post-5'],
      replies: [
        {
          id: 'reply-17',
          authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
          content: 'Ahah oui ! Moi c\'est plutôt jardinage, et toi l\'informatique ! 😂',
          createdAt: new Date('2024-02-01T10:00:00'),
          likes: ['1', '2']
        }
      ]
    },
    {
      id: 'posts/post-11',
      content: 'Les nids de poule c\'est vraiment un fléau... Mais en plus celui devant chez Pierre fait un bruit terrible quand les voitures le contournent ! Les voisins n\'en peuvent plus 😬',
      authorId: users[0].id, // Marie
      createdAt: new Date('2024-01-30T13:10:00'),
      supporters: ['1', '4', 'current'],
      tags: ['vie-de-quartier'],
      derivedIdeas: [],
      derivedPosts: [],
      sourcePosts: ['posts/post-6'],
      replies: [
        {
          id: 'reply-18',
          authorId: users[1].id, // ✅ Pierre - ID au lieu de l'objet
          content: 'C\'est clair ! Et ma voiture en prend un coup aussi... On va finir par le combler nous-mêmes ! 😤',
          createdAt: new Date('2024-01-30T14:00:00'),
          likes: ['1', '2']
        }
      ]
    },
    {
      id: 'posts/post-12',
      content: 'Toutes ces idées d\'amélioration du village me donnent envie ! 😊 On sent qu\'il y a une vraie dynamique qui se crée. Vivement qu\'on concrétise tout ça !',
      authorId: users[3].id, // Emma
      createdAt: new Date('2024-02-03T17:30:00'),
      supporters: ['1', '2', '4', 'current'],
      tags: ['vie-de-quartier'],
      derivedIdeas: [],
      derivedPosts: [],
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-19',
          authorId: users[2].id, // ✅ Sophie - ID au lieu de l'objet
          content: 'Oui ! On a plein d\'idées concrètes maintenant, il faut qu\'on s\'organise pour les réaliser 💪',
          createdAt: new Date('2024-02-03T18:00:00'),
          likes: ['1', '3']
        }
      ]
    },
    // ========================================================
    // HISTOIRE : Du Mur Gris à la Fresque Collective
    // Post initial → Réactions → Idée structurée → Groupe projet
    // ========================================================
    {
      id: 'posts/fresque-1',
      title: 'Le mur de l\'école est vraiment trop gris...',
      content: 'Hier en allant chercher ma fille à l\'école Paul Langevin, je me suis encore fait la réflexion : ce grand mur gris à côté de la cour est vraiment triste... 😔 Les enfants passent devant tous les jours, ça manque tellement de couleurs et de vie ! On pourrait pas imaginer quelque chose de plus joyeux ?',
      authorId: users[2].id, // Sophie Laurent (enseignante)
      createdAt: new Date('2024-02-15T16:30:00'),
      supporters: ['3', '1', '2', '13', '14'],
      tags: ['école', 'aménagement', 'art'],
      groupIds: [],
      derivedIdeas: ['ideas/fresque'], // L'idée de la fresque viendra de ce post
      derivedPosts: ['posts/fresque-2', 'posts/fresque-3'],
      sourcePosts: [],
      replies: [
        {
          id: 'reply-fresque-1',
          authorId: users[0].id, // Marie
          content: 'C\'est vrai qu\'il est sinistre ce mur ! Mes petits-enfants disent toujours "le mur qui fait peur" 😅',
          createdAt: new Date('2024-02-15T17:00:00'),
          likes: ['3', '2']
        },
        {
          id: 'reply-fresque-2',
          authorId: users[1].id, // Pierre
          content: 'Une fresque colorée peut-être ? J\'ai vu ça dans d\'autres communes, c\'est super joli !',
          createdAt: new Date('2024-02-15T17:45:00'),
          likes: ['3', '1', '13']
        },
        {
          id: 'reply-fresque-3',
          authorId: '13', // Léa Dumont (étudiante)
          content: 'Excellente idée ! Et si on impliquait les élèves dans le projet ? Ça pourrait être un super projet pédagogique 🎨',
          createdAt: new Date('2024-02-15T18:20:00'),
          likes: ['3', '2', '14']
        }
      ]
    },
    {
      id: 'posts/fresque-2',
      content: 'Suite à mon post sur le mur de l\'école... J\'ai parlé avec quelques parents et les enfants adorent l\'idée d\'une fresque ! 🎨 Certains ont même déjà des idées de dessins. Et si on lançait vraiment le projet ?',
      authorId: users[2].id, // Sophie
      createdAt: new Date('2024-02-18T14:00:00'),
      supporters: ['3', '1', '2', '13', '14', '12'],
      tags: ['école', 'art', 'participatif'],
      groupIds: [],
      derivedIdeas: ['ideas/fresque'],
      derivedPosts: ['posts/fresque-3', 'posts/fresque-4'],
      sourcePosts: ['posts/fresque-1'],
      replies: [
        {
          id: 'reply-fresque-4',
          authorId: '14', // Camille Artois (artiste)
          content: 'Hello ! Je suis muraliste et j\'adore ce genre de projets participatifs. Je serais ravie de vous accompagner techniquement si vous voulez ! 🖌️',
          createdAt: new Date('2024-02-18T15:30:00'),
          likes: ['3', '2', '13', '1']
        },
        {
          id: 'reply-fresque-5',
          authorId: users[1].id, // Pierre
          content: 'Super Camille ! Et il faudrait voir avec la mairie pour l\'autorisation non ?',
          createdAt: new Date('2024-02-18T16:00:00'),
          likes: ['3', '14']
        }
      ]
    },
    {
      id: 'posts/fresque-3',
      content: 'Update projet fresque école ! 🎉 Camille (artiste) est partante pour nous accompagner. On a besoin de contacter la mairie pour l\'autorisation. Quelqu\'un a un contact au service culture ?',
      authorId: users[2].id, // Sophie
      createdAt: new Date('2024-02-22T10:00:00'),
      supporters: ['3', '1', '2', '13', '14', '12', '15'],
      tags: ['école', 'art', 'administratif'],
      groupIds: [],
      derivedIdeas: ['ideas/fresque'],
      derivedPosts: ['posts/fresque-4'],
      sourcePosts: ['posts/fresque-2'],
      replies: [
        {
          id: 'reply-fresque-6',
          authorId: '15', // Marc Lefèvre (service Culture mairie)
          content: 'Bonjour ! Je suis responsable Culture à la mairie. Super projet ! 👍 On peut vous aider pour l\'autorisation et peut-être même un petit budget. Contactez-moi par email.',
          createdAt: new Date('2024-02-22T11:00:00'),
          likes: ['3', '2', '13', '14', '1']
        },
        {
          id: 'reply-fresque-7',
          authorId: '13', // Léa
          content: 'Génial ! Le projet prend forme 🚀',
          createdAt: new Date('2024-02-22T12:00:00'),
          likes: ['3', '2']
        }
      ]
    },
    {
      id: 'posts/fresque-4',
      content: 'Le projet de fresque avance bien ! 🎨 On a rencontré Marc de la mairie qui nous soutient, Camille l\'artiste est avec nous, et on a déjà 15 parents + élèves intéressés. On va créer un groupe dédié pour mieux s\'organiser. Qui veut participer ?',
      authorId: users[2].id, // Sophie
      createdAt: new Date('2024-03-05T15:00:00'),
      supporters: ['3', '1', '2', '13', '14', '12', '15', '4', '5'],
      tags: ['école', 'art', 'participatif', 'groupe'],
      groupIds: ['groups/g6'], // Le groupe a été créé suite à ce post
      derivedIdeas: ['ideas/fresque'],
      derivedPosts: [],
      sourcePosts: ['posts/fresque-3'],
      replies: [
        {
          id: 'reply-fresque-8',
          authorId: users[4].id, // Thomas
          content: 'Je peux aider pour la comm\' et créer un visuel du projet si vous voulez ! 📱',
          createdAt: new Date('2024-03-05T16:00:00'),
          likes: ['3', '13']
        },
        {
          id: 'reply-fresque-9',
          authorId: users[0].id, // Marie
          content: 'Moi je peux apporter des goûters pour les ateliers avec les enfants ! 🍪',
          createdAt: new Date('2024-03-05T16:30:00'),
          likes: ['3', '2', '13']
        }
      ]
    }
  ];
}

// Export the posts lazily
export const mockPosts = getMockPosts();