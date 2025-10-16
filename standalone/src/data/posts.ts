import { Post } from '../types';
import { users, currentUser, guestUser } from './users';

// Function to create posts data lazily to avoid circular dependencies
export function getMockPosts(): Post[] {
  return [
    {
      id: 'post-1',
      content: 'Il y a vraiment pas assez de bancs dans notre village... 😔 Hier ma voisine âgée a dû s\'appuyer contre un mur pour souffler en revenant des courses. On pourrait pas en installer quelques-uns ?',
      author: users[0], // Marie
      createdAt: new Date('2024-01-08T10:30:00'),
      supporters: ['1', '2', '3', 'current', 'guest'],
      tags: ['vie-de-quartier', 'vieillesse'],
      derivedIdeas: ['1'], // L'idée des bancs vient de ce post
      derivedPosts: ['post-2', 'post-3'], // Autres posts qui en parlent
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-1',
          author: users[3], // Emma
          content: 'Carrément ! Moi avec la poussette, j\'aimerais bien pouvoir m\'arrêter devant la pharmacie 👶',
          createdAt: new Date('2024-01-08T11:15:00'),
          likes: ['1', '3']
        },
        {
          id: 'reply-2',
          author: users[1], // Pierre
          content: 'C\'est vrai qu\'il en faudrait au moins un devant la boulangerie, on fait souvent la queue dehors !',
          createdAt: new Date('2024-01-08T14:20:00'),
          likes: ['1', '2']
        }
      ]
    },
    {
      id: 'post-2',
      content: 'En parlant de bancs... à l\'arrêt de bus aussi ce serait bien ! Surtout quand il pleut et qu\'on doit attendre debout 🚌☔',
      author: users[4], // Thomas
      createdAt: new Date('2024-01-09T16:45:00'),
      supporters: ['1', '2', '4', 'current'],
      tags: ['vie-de-quartier'],
      derivedIdeas: ['1'], // Contribue à l'idée des bancs
      derivedPosts: [],
      sourcePosts: ['post-1'], // Suite du post précédent
      replies: [
        {
          id: 'reply-3',
          author: users[2], // Sophie
          content: 'Et près de l\'école ! Pour les parents qui attendent les enfants 🏫',
          createdAt: new Date('2024-01-09T17:20:00'),
          likes: ['3', '4']
        },
        {
          id: 'reply-4',
          author: users[0], // Marie
          content: 'Oui ! On va peut-être pouvoir monter un projet pour ça... 💡',
          createdAt: new Date('2024-01-09T18:00:00'),
          likes: ['1', '4']
        }
      ]
    },
    {
      id: 'post-3',
      content: 'J\'ai repensé aux bancs... place du village aussi non ? Histoire que ce soit un vrai lieu de rencontre ! Les anciens pourraient s\'y retrouver ☕',
      author: users[3], // Emma
      createdAt: new Date('2024-01-10T19:00:00'),
      supporters: ['1', '3', '4', 'current'],
      tags: ['vie-de-quartier'],
      derivedIdeas: ['1'], // Contribue à l'idée des bancs
      derivedPosts: [],
      sourcePosts: ['post-1'], // Suite de la discussion sur les bancs
      replies: [
        {
          id: 'reply-5',
          author: users[1], // Pierre
          content: 'Excellente idée ! Ça redonnerait vie à notre place 🏘️',
          createdAt: new Date('2024-01-10T19:30:00'),
          likes: ['2', '4']
        },
        {
          id: 'reply-6',
          author: users[0], // Marie
          content: 'Je vais creuser le sujet et voir ce qu\'on peut faire concrètement ! 📝',
          createdAt: new Date('2024-01-10T20:15:00'),
          likes: ['1', '3']
        }
      ]
    },
    {
      id: 'post-4',
      content: 'J\'ai encore jeté mon grille-pain ce matin... 😔 Ça m\'embête de jeter alors que Pierre pourrait sûrement le réparer ! On devrait organiser des moments pour bricoler ensemble non ?',
      author: users[4], // Thomas
      createdAt: new Date('2024-01-12T16:45:00'),
      supporters: ['1', '2', '4', 'current'],
      tags: ['solidarité'],
      derivedIdeas: ['2'], // L'idée du café-réparation vient de ce post
      derivedPosts: ['post-9'],
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-7',
          author: users[1], // Pierre
          content: 'Carrément ! J\'ai plein d\'outils et j\'adore réparer. Un samedi par mois ça serait top 🔧',
          createdAt: new Date('2024-01-12T17:20:00'),
          likes: ['3', '4']
        },
        {
          id: 'reply-8',
          author: users[2], // Sophie
          content: 'Génial ! Moi je peux aider pour la couture et les reprises de vêtements 🧵',
          createdAt: new Date('2024-01-12T18:00:00'),
          likes: ['1', '4']
        }
      ]
    },
    {
      id: 'post-5',
      content: 'Hier j\'avais des courses lourdes et j\'aurais bien eu besoin d\'un coup de main... 🛒 En même temps, moi je peux aider avec l\'informatique ! On pourrait pas s\'organiser pour s\'entraider ?',
      author: users[2], // Sophie
      createdAt: new Date('2024-01-18T19:00:00'),
      supporters: ['1', '3', '4', 'current'],
      tags: ['solidarité'],
      derivedIdeas: ['3'], // L'idée d'échange de services vient de ce post
      derivedPosts: ['post-10'],
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-9',
          author: users[3], // Emma
          content: 'Excellente idée ! Moi je peux aider pour les transports et garde d\'enfants 🚗',
          createdAt: new Date('2024-01-18T19:30:00'),
          likes: ['2', '4']
        },
        {
          id: 'reply-10',
          author: users[0], // Marie
          content: 'Super ! On pourrait faire un tableau avec qui propose quoi. Ça m\'inspire ! 💡',
          createdAt: new Date('2024-01-18T20:15:00'),
          likes: ['1', '3']
        }
      ]
    },
    {
      id: 'post-6',
      content: 'Sérieusement, les nids de poule rue des Écoles... 🕳️ J\'ai failli perdre une jante ce matin ! Et celui devant l\'école qui fait une mare à chaque pluie, c\'est dangereux pour les gamins !',
      author: users[1], // Pierre
      createdAt: new Date('2024-01-16T08:15:00'),
      supporters: ['1', '2', 'current'],
      tags: ['vie-de-quartier'],
      derivedIdeas: ['4'], // L'idée sur les nids de poule vient de ce post
      derivedPosts: ['post-11'],
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-11',
          author: users[4], // Thomas
          content: 'Moi j\'ai crevé la semaine dernière ! Il faut qu\'on fasse quelque chose 😤',
          createdAt: new Date('2024-01-16T09:00:00'),
          likes: ['4', '1']
        },
        {
          id: 'reply-12',
          author: users[0], // Marie
          content: 'On devrait faire un signalement groupé à la mairie, ça aurait plus de poids !',
          createdAt: new Date('2024-01-16T09:30:00'),
          likes: ['1', '2']
        }
      ]
    },
    {
      id: 'post-7',
      content: 'Le stationnement devant l\'école le matin... 😩 C\'est l\'anarchie totale ! Les gamins qui courent entre les voitures, les parents qui s\'engueulent... Il faut qu\'on s\'organise !',
      author: users[3], // Emma
      createdAt: new Date('2024-01-22T08:45:00'),
      supporters: ['2', '3', 'current'],
      tags: ['jeunesse'],
      derivedIdeas: ['5'], // L'idée sur le stationnement école vient de ce post
      derivedPosts: ['post-8'],
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-13',
          author: users[0], // Marie
          content: 'Tellement vrai ! Et nous à la pharmacie on ne peut plus sortir aux heures d\'école 🚗',
          createdAt: new Date('2024-01-22T09:15:00'),
          likes: ['1', '3']
        },
        {
          id: 'reply-14',
          author: users[4], // Thomas
          content: 'Peut-être qu\'on pourrait organiser un système de surveillance entre parents ?',
          createdAt: new Date('2024-01-22T10:00:00'),
          likes: ['3', '1']
        }
      ]
    },
    {
      id: 'post-8',
      content: 'Suite au post d\'Emma sur l\'école... On pourrait pas faire des places marquées au sol ? Et peut-être du covoiturage organisé entre parents du même quartier ? 🚸',
      author: users[0], // Marie
      createdAt: new Date('2024-01-23T17:30:00'),
      supporters: ['1', '3', '4', 'current'],
      tags: ['jeunesse'],
      derivedIdeas: ['5'], // Contribue à l'idée sur le stationnement école
      derivedPosts: [],
      sourcePosts: ['post-7'], // Suite du post d'Emma
      replies: [
        {
          id: 'reply-15',
          author: users[2], // Sophie
          content: 'Bonne idée le covoiturage ! Moi je peux prendre 2 enfants en plus dans ma voiture 👍',
          createdAt: new Date('2024-01-23T18:00:00'),
          likes: ['1', '3']
        }
      ]
    },
    {
      id: 'post-9',
      content: 'Suite à l\'idée de Thomas pour le repair café : qui a des compétences particulières à partager ? 🛠️ Histoire qu\'on s\'organise par domaines !',
      author: users[1], // Pierre
      createdAt: new Date('2024-01-28T15:45:00'),
      supporters: ['2', '4', 'current'],
      tags: ['associatif'],
      derivedIdeas: [],
      derivedPosts: [],
      sourcePosts: ['post-4'],
      replies: [
        {
          id: 'reply-16',
          author: users[2], // Sophie
          content: 'Moi couture et petit électroménager ! Emma elle est douée avec les vélos aussi 🚲',
          createdAt: new Date('2024-01-28T16:20:00'),
          likes: ['1', '3']
        }
      ]
    },
    {
      id: 'post-10',
      content: 'J\'adore l\'idée d\'entraide de Sophie ! 🤝 Moi je peux aider pour le jardinage, et Pierre pourrait faire de l\'aide informatique... enfin l\'inverse ! 😅',
      author: users[0], // Marie
      createdAt: new Date('2024-02-01T09:20:00'),
      supporters: ['2', '3', '4'],
      tags: ['solidarité'],
      derivedIdeas: [],
      derivedPosts: [],
      sourcePosts: ['post-5'],
      replies: [
        {
          id: 'reply-17',
          author: users[1], // Pierre
          content: 'Ahah oui ! Moi c\'est plutôt jardinage, et toi l\'informatique ! 😂',
          createdAt: new Date('2024-02-01T10:00:00'),
          likes: ['1', '2']
        }
      ]
    },
    {
      id: 'post-11',
      content: 'Les nids de poule c\'est vraiment un fléau... Mais en plus celui devant chez Pierre fait un bruit terrible quand les voitures le contournent ! Les voisins n\'en peuvent plus 😬',
      author: users[0], // Marie
      createdAt: new Date('2024-01-30T13:10:00'),
      supporters: ['1', '4', 'current'],
      tags: ['vie-de-quartier'],
      derivedIdeas: [],
      derivedPosts: [],
      sourcePosts: ['post-6'],
      replies: [
        {
          id: 'reply-18',
          author: users[1], // Pierre
          content: 'C\'est clair ! Et ma voiture en prend un coup aussi... On va finir par le combler nous-mêmes ! 😤',
          createdAt: new Date('2024-01-30T14:00:00'),
          likes: ['1', '2']
        }
      ]
    },
    {
      id: 'post-12',
      content: 'Toutes ces idées d\'amélioration du village me donnent envie ! 😊 On sent qu\'il y a une vraie dynamique qui se crée. Vivement qu\'on concrétise tout ça !',
      author: users[3], // Emma
      createdAt: new Date('2024-02-03T17:30:00'),
      supporters: ['1', '2', '4', 'current'],
      tags: ['vie-de-quartier'],
      derivedIdeas: [],
      derivedPosts: [],
      sourcePosts: [], // Aucun post source
      replies: [
        {
          id: 'reply-19',
          author: users[2], // Sophie
          content: 'Oui ! On a plein d\'idées concrètes maintenant, il faut qu\'on s\'organise pour les réaliser 💪',
          createdAt: new Date('2024-02-03T18:00:00'),
          likes: ['1', '3']
        }
      ]
    }
  ];
}

// Export the posts lazily
export const mockPosts = getMockPosts();
