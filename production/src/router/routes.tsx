import { RouteObject } from 'react-router-dom';
import { PublicLayout } from '../components/PublicLayout';
import { AppLayout } from '../components/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// Wrappers pour les pages avec navigation
import { CitizenWelcomeWrapper } from './CitizenWelcomeWrapper';
import { SignupPageWrapper } from './SignupPageWrapper';
import { DiscoveryPageWrapper } from './DiscoveryPageWrapper';
import { MyIdeasPageWrapper } from './MyIdeasPageWrapper';
import { CreateIdeaPageWrapper } from './CreateIdeaPageWrapper';
import { IdeaDetailPageWrapper } from './IdeaDetailPageWrapper';
import { PostDetailPageWrapper } from './PostDetailPageWrapper';
import { UserProfilePageWrapper } from './UserProfilePageWrapper';
import { UserProfilePagePublicWrapper } from './UserProfilePagePublicWrapper';
import { CommunityDetailPageWrapper } from './CommunityDetailPageWrapper';

// Pages publiques
import { AboutPage } from '../components/AboutPage';
import { HowItWorksPage } from '../components/HowItWorksPage';
import { FAQPage } from '../components/FAQPage';
import { PrivacyPolicyPage } from '../components/PrivacyPolicyPage';
import { TermsPage } from '../components/TermsPage';

// Pages protégées sans paramètres
import { CommunitiesPage } from '../components/CommunitiesPage';

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
  // ========================================
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
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
        path: 'create-idea',
        element: <CreateIdeaPageWrapper />,
      },
      {
        path: 'idea/:ideaId',
        element: <IdeaDetailPageWrapper />,
      },
      {
        path: 'post/:postId',
        element: <PostDetailPageWrapper />,
      },
      {
        path: 'profile',
        element: <UserProfilePageWrapper />,
      },
      {
        path: 'user/:userId',
        element: <UserProfilePagePublicWrapper />,
      },
      {
        path: 'communities',
        element: <CommunitiesPage />,
      },
      {
        path: 'community/:communityId',
        element: <CommunityDetailPageWrapper />,
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
