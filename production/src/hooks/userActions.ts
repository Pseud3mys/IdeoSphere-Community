import { SimpleEntityStore, StoreUpdater } from '../store/SimpleEntityStore';
import { User } from '../types';

/**
 * Actions utilisateur pour l'Entity Store
 * Gère la création de comptes, authentification et gestion des utilisateurs
 */
export function createUserActions(
  store: SimpleEntityStore,
  actions: any,
  boundSelectors: any,
  navigationActions: any,
  storeUpdater: StoreUpdater
) {
  return {
    // Actions d'authentification et compte utilisateur
    goToSignup: (prefilledData?: { name?: string; email?: string }) => {
      if (prefilledData) {
        actions.setPrefilledSignupData(prefilledData);
      }
      actions.setActiveTab('signup');
    },
    
    createUserAccount: async (userData: {
      name: string;
      email: string;
      address?: string;
      bio?: string;
      birthYear?: number;
    }) => {
      try {
        if (!actions || !actions.addUser || !actions.setCurrentUserId) {
          console.error('❌ [hook/userActions] Store actions not available');
          return null;
        }
        
        const { createUserAccountOnApi } = await import('../api/contentService');
        const newUser = await createUserAccountOnApi(userData);
        
        actions.addUser(newUser);
        actions.setCurrentUserId(newUser.id);
        actions.setPrefilledSignupData(null);
        
        return newUser;
        
      } catch (error) {
        console.error('❌ [hook/userActions] createUserAccount:', error);
        return null;
      }
    },
    
    createTemporaryGuest: async (guestData?: { name?: string; email?: string; address?: string }) => {
      try {
        // ✅ Appeler le service API pour créer un compte non finalisé
        const { createUnfinalizedAccountOnApi } = await import('../api/authService');
        const tempUser = await createUnfinalizedAccountOnApi(guestData);
        
        // Ajouter l'utilisateur au store et le définir comme utilisateur actuel
        actions.addUser(tempUser);
        actions.setCurrentUserId(tempUser.id);
        
        console.log('✅ [hook/userActions] Utilisateur temporaire créé via API:', tempUser.id, tempUser.name, tempUser.email);
        return tempUser;
        
      } catch (error) {
        console.error('❌ [hook/userActions] createTemporaryGuest:', error);
        return null;
      }
    },
    
    switchToVisitor: () => {
      // Vérifier si l'utilisateur visiteur existe déjà
      const visitorUser = boundSelectors.getUserById('visitor');
      if (!visitorUser) {
        const visitorUser: User = {
          id: 'visitor',
          name: 'Visiteur',
          email: '',
          bio: 'Utilisateur visiteur non enregistré',
          avatar: '',
          address: '',
          birthYear: new Date().getFullYear() - 30,
          createdAt: new Date(),
          isRegistered: false
        };
        actions.addUser(visitorUser);
      }
      actions.setCurrentUserId('visitor');
    },
    
    switchToTestUser: () => {
      // Vérifier si l'utilisateur de test existe déjà
      const testUser = boundSelectors.getUserById('test-user');
      if (!testUser) {
        const testUser: User = {
          id: 'test-user',
          name: 'Test User',
          email: 'test@example.com',
          bio: 'Utilisateur de test pour le développement',
          avatar: '',
          address: '123 Rue de Test, 75001 Paris',
          birthYear: 1990,
          createdAt: new Date(),
          isRegistered: true
        };
        actions.addUser(testUser);
      }
      actions.setCurrentUserId('test-user');
    },
    
    // Action pour changer d'utilisateur par email
    switchToUserByEmail: (email: string) => {
      const allUsers = boundSelectors.getAllUsers();
      const targetUser = allUsers.find((user: User) => user.email === email);
      if (targetUser) {
        actions.setCurrentUserId(targetUser.id);
        return targetUser;
      }
      return null;
    },
    
    // Action pour vérifier l'existence d'un email via l'API d'authentification
    checkEmailExists: async (email: string) => {
      try {
        const { loginWithEmail } = await import('../api/authService');
        return await loginWithEmail(email);
      } catch (error) {
        console.error('❌ [hook/userActions] checkEmailExists:', error);
        return null;
      }
    },
    
    // Action pour la connexion sociale (Google, Facebook, Microsoft)
    loginWithSocialProvider: async (provider: string, socialData: { email: string; name: string; avatar?: string }) => {
      try {
        const { loginWithSocialProvider: loginWithSocialProviderApi } = await import('../api/authService');
        const user = await loginWithSocialProviderApi(provider, socialData);
        
        if (user) {
          // Vérifier si l'utilisateur existe déjà dans le store local
          const existingUser = boundSelectors.getUserById(user.id);
          if (!existingUser) {
            actions.addUser(user);
          }
          actions.setCurrentUserId(user.id);
        }
        
        return user;
      } catch (error) {
        console.error('❌ [hook/userActions] loginWithSocialProvider:', error);
        return null;
      }
    },
    
    // Action pour la création de compte (utilisée par le formulaire d'inscription)
    signupUser: async (userData: {
      name: string;
      email: string;
      password: string;
      address?: string;
      bio?: string;
      birthYear?: number;
    }) => {
      try {
        const { createUserAccount: createUserAccountApi } = await import('../api/authService');
        
        // Adapter les données au format attendu par l'API
        const apiData = {
          name: userData.name,
          email: userData.email,
          address: userData.address,
          bio: userData.bio,
          birthYear: userData.birthYear || new Date().getFullYear() - 25
        };
        
        const newUser = await createUserAccountApi(apiData);
        
        if (newUser) {
          actions.addUser(newUser);
          actions.setCurrentUserId(newUser.id);
          actions.setPrefilledSignupData(null);
          return newUser;
        }
        
        // Si l'API retourne null, c'est probablement que l'email existe déjà
        throw new Error('EMAIL_EXISTS');
      } catch (error: any) {
        console.error('❌ [hook/userActions] signupUser:', error);
        
        // Propager l'erreur avec un message compréhensible
        if (error?.response?.status === 409 || error?.message === 'EMAIL_EXISTS') {
          throw new Error('EMAIL_EXISTS');
        }
        
        if (error?.response?.status === 400) {
          throw new Error('INVALID_DATA');
        }
        
        // Erreur générique
        throw new Error('SIGNUP_FAILED');
      }
    },
    
    // Actions de mise à jour utilisateur
    updateCurrentUser: async (updates: Partial<User>) => {
      const currentUser = boundSelectors.getCurrentUser();
      if (!currentUser) {
        console.error('❌ [hook/userActions] updateCurrentUser: Aucun utilisateur actuel');
        return false;
      }
      
      try {
        // Mettre à jour dans le store local
        actions.updateUser(currentUser.id, updates);
        
        // Si l'utilisateur est enregistré, mettre à jour via l'API
        if (currentUser.isRegistered) {
          const { updateUserProfileOnApi } = await import('../api/contentService');
          await updateUserProfileOnApi(currentUser.id, updates);
        }
        
        return true;
      } catch (error) {
        console.error('❌ [hook/userActions] updateCurrentUser:', error);
        return false;
      }
    },
    
    // Actions de newsletter
    subscribeToNewsletter: async (email: string) => {
      try {
        const { subscribeToNewsletterOnApi } = await import('../api/authService');
        return await subscribeToNewsletterOnApi(email);
      } catch (error) {
        console.error('❌ [hook/userActions] subscribeToNewsletter:', error);
        return false;
      }
    },
    
    // Action pour ajouter un utilisateur au store et le sélectionner
    addUserAndSetAsCurrent: (userData: User) => {
      try {
        // Vérifier si l'utilisateur existe déjà
        const existingUser = boundSelectors.getUserById(userData.id);
        if (existingUser) {
          actions.setCurrentUserId(userData.id);
          return existingUser;
        }
        
        // Ajouter l'utilisateur et le sélectionner
        actions.addUser(userData);
        actions.setCurrentUserId(userData.id);
        
        return userData;
      } catch (error) {
        console.error('❌ [hook/userActions] addUserAndSetAsCurrent:', error);
        return null;
      }
    }
  };
}
