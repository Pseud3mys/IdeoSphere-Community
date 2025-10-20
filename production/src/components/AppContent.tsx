import { TabType } from '../types';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { CitizenWelcome } from './CitizenWelcome';
import { DiscoveryPage } from './DiscoveryPage';
import { MyIdeasPage } from './MyIdeasPage';
import { CreateIdeaPage } from './CreateIdeaPage';
import { IdeaDetailPage } from './IdeaDetailPage';
import { PostDetailPage } from './PostDetailPage';
import { UserProfilePage } from './UserProfilePage';
import { UserProfilePagePublic } from './UserProfilePagePublic';
import { CommunitiesPage } from './CommunitiesPage';
import { CommunityDetailPage } from './CommunityDetailPage';
import { SignupPage } from './auth/SignupPage';

interface AppContentProps {
  // Handlers d'authentification passés depuis App.tsx
  onLogin?: (email: string, password: string) => Promise<boolean>;
  onSocialLogin?: (provider: string) => Promise<boolean>;
  onSignup?: (userData: {
    name: string;
    email: string;
    password: string;
    address?: string;
  }) => Promise<boolean>;
  onNewsletterSubscribe?: (data: {
    email: string;
    location: string;
    frequency: string;
  }) => Promise<boolean>;
}

export function AppContent({ 
  onLogin, 
  onSocialLogin, 
  onSignup, 
  onNewsletterSubscribe 
}: AppContentProps) {
  // Utiliser l'Entity Store pour récupérer toutes les données et actions nécessaires
  const { 
    store, 
    actions, 
    getCurrentUser, 
    getAllIdeas, 
    getAllPosts
  } = useEntityStoreSimple();

  const currentUserData = getCurrentUser();
  const ideas = getAllIdeas();
  const posts = getAllPosts();

  // Fonction sécurisée pour créer un utilisateur temporaire
  const createTempUserSafely = async () => {
    try {
      if (actions?.createTemporaryGuest) {
        const tempUser = await actions.createTemporaryGuest();
        if (tempUser) {
          actions.enterPlatform();
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'utilisateur temporaire:', error);
      return false;
    }
  };

  // Afficher la page d'accueil si l'utilisateur n'est pas encore entré dans la plateforme
  if (store.activeTab === 'welcome' && !store.hasEnteredPlatform) {
    return (
      <CitizenWelcome 
        onEnterPlatform={actions.enterPlatform}
        onEnterPlatformWithTempUser={createTempUserSafely}
        onNavigateToCreateIdea={() => actions.goToTab('create-idea')}
        onLogin={onLogin || (() => Promise.resolve(false))}
        onSocialLogin={onSocialLogin || (() => Promise.resolve(false))}
        onSignup={onSignup || (() => Promise.resolve(false))}
        onNewsletterSubscribe={onNewsletterSubscribe || (() => Promise.resolve(false))}
        cityName="Le Blanc" // Peut être dynamique selon la configuration
      />
    );
  }

  if (store.activeTab === 'idea-detail' && store.selectedIdeaId) {
    const selectedIdea = ideas.find(p => p.id === store.selectedIdeaId);
    if (selectedIdea) {
      return (
        <IdeaDetailPage
          idea={selectedIdea}
          onBack={() => actions.goToTab('discovery')}
        />
      );
    }
  }

  if (store.activeTab === 'post-detail' && store.selectedPostId) {
    const selectedPost = posts.find(p => p.id === store.selectedPostId);
    if (selectedPost) {
      return (
        <PostDetailPage
          post={selectedPost}
          onBack={() => actions.goToTab('discovery')}
          onPromoteToIdea={actions.promotePostToIdea}
          onCreateResponsePost={actions.createResponsePost}
          onIdeaClick={actions.goToIdea}
          onPostClick={actions.goToPost}
        />
      );
    }
  }

  if (store.activeTab === 'profile') {
    if (currentUserData) {
      return (
        <UserProfilePage
          user={currentUserData}
          isOwnProfile={true}
          onUpdateProfile={actions.updateCurrentUser}
          onBack={() => actions.goToTab('discovery')}
        />
      );
    }
  }

  if (store.activeTab === 'user-profile' && store.selectedUserId) {
    return (
      <UserProfilePagePublic
        userId={store.selectedUserId}
        onBack={() => actions.goToTab('discovery')}
      />
    );
  }

  if (store.activeTab === 'communities') {
    return (
      <CommunitiesPage />
    );
  }

  if (store.activeTab === 'community-detail') {
    return (
      <CommunityDetailPage />
    );
  }

  if (store.activeTab === 'signup') {
    return (
      <SignupPage
        onBack={() => actions.goToTab('welcome')}
        onSignup={async (userData) => {
          // Créer le compte directement via le store action signupUser
          // qui appelle l'API authService correctement
          const success = await actions.signupUser({
            name: userData.name,
            email: userData.email,
            password: '', // Password généré automatiquement dans ce flow
            address: userData.address,
            birthYear: userData.birthYear
          });
          
          if (success) {
            actions.enterPlatform();
          }
        }}
        onSocialLogin={onSocialLogin}
        prefilledData={store.prefilledSignupData}
      />
    );
  }

  switch (store.activeTab) {
    case 'discovery':
      return (
        <DiscoveryPage
          onIdeaClick={actions.goToIdea}
          onPostClick={actions.goToPost}
          onLike={actions.togglePostLike}
          onSupport={actions.toggleIdeaSupport}
          onPromoteToIdea={actions.promotePostToIdea}
          onIgnoreIdea={actions.ignoreIdea}
          onReportIdea={actions.reportIdea}
          onIgnorePost={actions.ignorePost}
          onReportPost={actions.reportPost}
        />
      );
    case 'my-ideas':
      return (
        <MyIdeasPage
          onIdeaClick={actions.goToIdea}
          onPostClick={actions.goToPost}
          onLike={actions.togglePostLike}
          onSupport={actions.toggleIdeaSupport}
          onIgnoreIdea={actions.ignoreIdea}
          onReportIdea={actions.reportIdea}
          onIgnorePost={actions.ignorePost}
          onReportPost={actions.reportPost}
          onCreateContent={() => actions.goToTab('create-idea')}
        />
      );
    case 'create':
    case 'create-idea':
    case 'create-post':
      return (
        <CreateIdeaPage
          sourcePost={store.prefilledSourcePostId ? posts.find(p => p.id === store.prefilledSourcePostId) : undefined}
          prefilledSourceIdea={store.prefilledSourceIdea}
          prefilledLinkedContent={store.prefilledLinkedContent?.map(content => content.id) || []}
          prefilledSelectedDiscussions={store.prefilledSelectedDiscussions}
          onClearPrefilled={actions.clearPrefill}
        />
      );
    default:
      return null;
  }
}