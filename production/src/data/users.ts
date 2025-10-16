import { User } from '../types';

export const users: User[] = [
  { 
    id: '1', 
    name: 'Marie Dubois', 
    email: 'marie.dubois@email.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b5d3?w=64',
    bio: "Commerçante retraitée passionnée par l'amélioration du cadre de vie à Le Blanc.",
    createdAt: new Date('2023-06-15'),
    location: 'Le Blanc',
    preciseAddress: '12 rue du Commerce',
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
    location: 'Le Blanc',
    preciseAddress: '45 avenue des Chaumettes',
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
    location: 'Le Blanc',
    preciseAddress: '8 rue Saint-Genitou',
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
    location: 'Le Blanc',
    preciseAddress: '23 rue des Vignes',
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
    location: 'Le Blanc',
    preciseAddress: '17 allée de Beaulieu',
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
    location: 'Le Blanc',
    preciseAddress: '34 boulevard du Nord',
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
    location: 'Saint-Laurent',
    preciseAddress: '5 place de la Mairie',
    birthYear: 2001,
    isRegistered: true
  }
];

// Utilisateur invité par défaut
export const guestUser: User = {
  id: 'guest',
  name: 'Visiteur',
  email: '',
  avatar: '', // Avatar par défaut pour les invités
  bio: "Visiteur de la plateforme IdeoSphere",
  createdAt: new Date(),
  location: 'Le Blanc',
  isRegistered: false
};

export const currentUser: User = {
  id: 'users/0',
  name: 'Julie Renaud',
  email: 'julie.renaud@email.com',
  avatar: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=64',
  bio: "Membre active du COLLECTIF BLANCOIS CITOYEN, passionnée par l'amélioration de notre commune.",
  createdAt: new Date('2023-04-12'),
  location: 'Le Blanc',
  preciseAddress: '15 rue de la République',
  birthYear: 1988,
  isRegistered: true
};