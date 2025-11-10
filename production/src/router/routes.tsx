import { RouteObject } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { AppLayout } from '../components/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Wrappers pour les pages avec navigation
import { CitizenWelcomeWrapper } from './CitizenWelcomeWrapper';
import { SignupPageWrapper } from './SignupPageWrapper';
import { DiscoveryPageWrapper } from './DiscoveryPageWrapper';
import { MyIdeasPageWrapper } from './MyIdeasPageWrapper';
import { MyContributionsPageWrapper } from './MyContributionsPageWrapper';
import { CreateIdeaPageWrapper } from './CreateIdeaPageWrapper';
import { ContentDetailPageWrapper } from './ContentDetailPageWrapper';
import { UserProfilePageWrapper } from './UserProfilePageWrapper';
import { UserProfilePagePublicWrapper } from './UserProfilePagePublicWrapper';
import { GroupsExplorerPageWrapper } from './GroupsExplorerPageWrapper';
import { GroupHubPageWrapper } from './GroupHubPageWrapper';
import { MyGroupsPageWrapper } from './MyGroupsPageWrapper';
import { PendingGroupDetailPageWrapper } from './PendingGroupDetailPageWrapper';
import { GroupManagePageWrapper } from './GroupManagePageWrapper';
import { StatisticsPageWrapper } from './StatisticsPageWrapper';

// Pages publiques
import { AboutPage } from '../components/AboutPage';
import { HowItWorksPage } from '../components/HowItWorksPage';
import { FAQPage } from '../components/FAQPage';
import { PrivacyPolicyPage } from '../components/PrivacyPolicyPage';
import { TermsPage } from '../components/TermsPage';

// Pages protégées sans paramètres (aucune pour le moment)

/**
 * Configuration des routes de l'application
 * Structure :
 * - Routes publiques (/, /about, /faq, etc.)
 * - Routes protégées (/discovery, /my-ideas, etc.)
 * - Routes d'authentification (/signup)
 */
export const routes: RouteObject[] = [
  // ========================================
  // ROUTES PUBLIQUES
  // ========================================
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <CitizenWelcomeWrapper />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'how-it-works',
        element: <HowItWorksPage />,
      },
      {
        path: 'faq',
        element: <FAQPage />,
      },
      {
        path: 'privacy',
        element: <PrivacyPolicyPage />,
      },
      {
        path: 'terms',
        element: <TermsPage />,
      },
    ],
  },

  // ========================================
  // ROUTES D'AUTHENTIFICATION
  // ========================================
  {
    path: 'signup',
    element: <SignupPageWrapper />,
  },

  // ========================================
  // ROUTES PROTÉGÉES (nécessitent authentification)
  // NOTE TEMPORAIRE : Protection désactivée pour permettre l'accès invité
  // ========================================
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: 'discovery',
        element: <DiscoveryPageWrapper />,
      },
      {
        path: 'my-ideas',
        element: <MyIdeasPageWrapper />,
      },
      {
        path: 'my-contributions',
        element: <MyContributionsPageWrapper />,
      },
      {
        path: 'create-idea',
        element: <CreateIdeaPageWrapper />,
      },
      {
        path: 'content/*',
        element: <ContentDetailPageWrapper />,
      },
      {
        path: 'profile',
        element: <UserProfilePageWrapper />,
      },
      {
        path: 'user/:userId',
        element: <UserProfilePagePublicWrapper />,
      },
      // Routes pour les groupes
      {
        path: 'groups',
        element: <GroupsExplorerPageWrapper />,
      },
      {
        path: 'groups/my',
        element: <MyGroupsPageWrapper />,
      },
      {
        path: 'groups/pending/:pendingId',
        element: <PendingGroupDetailPageWrapper />,
      },
      {
        path: 'groups/:groupId/manage',
        element: <GroupManagePageWrapper />,
      },
      {
        path: 'groups/:groupId',
        element: <GroupHubPageWrapper />,
      },
      {
        path: 'statistics',
        element: <StatisticsPageWrapper />,
      },
    ],
  },

  // ========================================
  // ROUTE 404 (optionnel, à implémenter plus tard)
  // ========================================
  // {
  //   path: '*',
  //   element: <NotFoundPage />,
  // },
];