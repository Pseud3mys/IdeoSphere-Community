import { User } from '../types';

export const users: User[] = [
  { 
    id: '1', 
    name: 'Marie Dubois', 
    email: 'marie.dubois@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5d3?w=64',
    bio: "Commerçante retraitée passionnée par l'amélioration du cadre de vie à Le Blanc.",
    createdAt: new Date('2023-06-15'),
    lastLoginDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Il y a 3 jours
    address: '12 rue du Commerce, Le Blanc',
    birthYear: 1965,
    isRegistered: true
  },
  { 
    id: '2', 
    name: 'Pierre Martin', 
    email: 'pierre.martin@email.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64',
    bio: "Artisan et conseiller municipal sortant, investi dans les projets locaux concrets.",
    createdAt: new Date('2023-08-22'),
    lastLoginDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // Il y a 5 jours
    address: '45 avenue des Chaumettes, Le Blanc',
    birthYear: 1972,
    isRegistered: true
  },
  { 
    id: '3', 
    name: 'Sophie Laurent', 
    email: 'sophie.laurent@email.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64',
    bio: "Enseignante et mère de famille, engagée pour l'éducation et la famille à Le Blanc.",
    createdAt: new Date('2023-09-10'),
    lastLoginDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Hier
    address: '8 rue Saint-Genitou, Le Blanc',
    birthYear: 1985,
    isRegistered: true
  },
  { 
    id: '4', 
    name: 'Thomas Chen', 
    email: 'thomas.chen@email.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64',
    bio: "Jeune entrepreneur local spécialisé dans le numérique et l'innovation.",
    createdAt: new Date('2023-07-05'),
    lastLoginDate: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2 heures
    address: '23 rue des Vignes, Le Blanc',
    birthYear: 1992,
    isRegistered: true
  },
  { 
    id: '5', 
    name: 'Emma Rodriguez', 
    email: 'emma.rodriguez@email.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=64',
    bio: "Infirmière libérale et présidente d'association, active dans le tissu social blanc.",
    createdAt: new Date('2023-05-30'),
    address: '17 allée de Beaulieu, Le Blanc',
    birthYear: 1989,
    isRegistered: true
  },
  { 
    id: '12', 
    name: 'Jean-Claude Perrin', 
    email: 'jc.perrin@email.com',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=64',
    bio: "Retraité engagé, animateur du comité de quartier Nord depuis plusieurs années.",
    createdAt: new Date('2023-10-15'),
    address: '34 boulevard du Nord, Le Blanc',
    birthYear: 1958,
    isRegistered: true
  },
  { 
    id: '13', 
    name: 'Léa Dumont', 
    email: 'lea.dumont@email.com',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64',
    bio: "Étudiante en sciences politiques, coordinatrice du collectif jeunes de Saint-Laurent.",
    createdAt: new Date('2024-01-30'),
    address: '5 place de la Mairie, Saint-Laurent',
    birthYear: 2001,
    isRegistered: true
  },
  { 
    id: '14', 
    name: 'Camille Artois', 
    email: 'camille.artois@email.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64',
    bio: "Artiste muraliste et graphiste, spécialisée dans l'art urbain participatif et les fresques collectives.",
    createdAt: new Date('2024-02-28'),
    address: '22 rue des Arts, Le Blanc',
    birthYear: 1987,
    isRegistered: true
  },
  { 
    id: '15', 
    name: 'Marc Lefèvre', 
    email: 'marc.lefevre@mairie-leblanc.fr',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64',
    bio: "Responsable du service Culture et Patrimoine à la mairie du Blanc. Accompagne les projets culturels sur le territoire.",
    createdAt: new Date('2024-01-10'),
    address: 'Mairie du Blanc',
    birthYear: 1976,
    isRegistered: true
  }
];

// ✅ Utilisateur inconnu - utilisé comme fallback quand un authorId n'est pas trouvé
export const unknownUser: User = {
  id: 'unknown',
  name: 'Utilisateur Inconnu',
  email: '',
  avatar: '', // Avatar par défaut
  bio: "Utilisateur non trouvé",
  createdAt: new Date(),
  address: '',
  isRegistered: false
};

// Utilisateur invité par défaut
export const guestUser: User = {
  id: 'guest',
  name: 'Visiteur',
  email: '',
  avatar: '', // Avatar par défaut pour les invités
  bio: "Visiteur de la plateforme IdeoSphere",
  createdAt: new Date(),
  address: 'Le Blanc',
  isRegistered: false
};

export const currentUser: User = {
  id: 'users/0',
  name: 'Julie Renaud',
  email: 'julie.renaud@email.com',
  avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=64',
  bio: "Membre active du COLLECTIF BLANCOIS CITOYEN, passionnée par l'amélioration de notre commune.",
  createdAt: new Date('2023-04-12'),
  lastLoginDate: new Date(Date.now() - 6 * 60 * 60 * 1000), // Il y a 6 heures
  address: '15 rue de la République, Le Blanc',
  birthYear: 1988,
  isRegistered: true
};