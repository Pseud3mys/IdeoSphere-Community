import { User } from '../types';
import { toast } from 'sonner@2.0.3';

/**
 * Hook personnalisé pour gérer l'authentification
 * 
 * ✅ ARCHITECTURE CORRECTE :
 * - Ce hook est une simple couche UI qui gère les retours utilisateur (toasts)
 * - Il appelle UNIQUEMENT les actions du store (via les callbacks fournis)
 * - Il ne fait JAMAIS d'appels directs aux services API
 * 
 * FLUX : Composants UI → useAuthHandlers → Actions Store → Services API
 */
export function useAuthHandlers(
  setCurrentUserData: (user: User) => void,
  handleEnterPlatform: () => void,
  switchToUserByEmail: (email: string) => User | null,
  checkEmailExists: (email: string) => Promise<User | null>,
  loginWithSocialProvider: (provider: string, socialData: { email: string; name: string; avatar?: string }) => Promise<User | null>,
  signupUser: (userData: {
    name: string;
    email: string;
    password: string;
    address?: string;
    bio?: string;
    birthYear?: number;
  }) => Promise<User | null>,
  subscribeToNewsletter: (email: string) => Promise<boolean>
) {
  /**
   * Gère la connexion d'un utilisateur
   * ✅ Utilise uniquement l'action checkEmailExists du store
   */
  const handleLogin = async (email: string, password: string = ''): Promise<boolean> => {
    try {
      // Appeler l'action du store
      const existingUser = await checkEmailExists(email);
      
      if (existingUser) {
        // Essayer de basculer vers l'utilisateur local
        const localUser = switchToUserByEmail(email);
        if (localUser) {
          toast.success(`Connecté en tant que ${localUser.name} ! 🎉`);
          handleEnterPlatform();
          return true;
        }
        
        // Ajouter l'utilisateur au store
        setCurrentUserData(existingUser);
        toast.success(`Connecté en tant que ${existingUser.name} ! 🎉`);
        handleEnterPlatform();
        return true;
      } else {
        toast.error('Aucun compte trouvé avec cet email. Créez d\'abord un compte.');
        return false;
      }
      
    } catch (error) {
      console.error('❌ [hook/useAuthHandlers] handleLogin:', error);
      toast.error('Erreur de connexion. Veuillez réessayer.');
      return false;
    }
  };

  /**
   * Gère la connexion sociale (Google, Facebook, Discord)
   * ✅ Utilise l'action loginWithSocialProvider du store
   */
  const handleSocialLogin = async (provider: string): Promise<boolean> => {
    try {
      // Données simulées du provider social
      const socialProviderData = {
        email: `demo@${provider}.com`,
        name: provider === 'google' ? 'Utilisateur Google' : 
              provider === 'facebook' ? 'Utilisateur Facebook' : 
              provider === 'discord' ? 'Utilisateur Discord' :
              'Utilisateur Social',
        avatar: ''
      };
      
      // ✅ Appel à l'action du store
      const user = await loginWithSocialProvider(provider, socialProviderData);
      
      if (user) {
        toast.success(`Connexion réussie avec ${provider.charAt(0).toUpperCase() + provider.slice(1)} ! 🎉`);
        handleEnterPlatform();
        return true;
      } else {
        toast.error('Erreur lors de la connexion sociale. Veuillez réessayer.');
        return false;
      }
      
    } catch (error) {
      console.error('❌ [hook/useAuthHandlers] handleSocialLogin:', error);
      toast.error('Erreur lors de la connexion sociale. Veuillez réessayer.');
      return false;
    }
  };

  /**
   * Gère la création d'un nouveau compte utilisateur
   * ✅ Utilise l'action signupUser du store
   */
  const handleSignup = async (userData: {
    name: string;
    email: string;
    password: string;
    location?: string;
    preciseAddress?: string;
    birthYear?: number;
  }): Promise<boolean> => {
    try {
      // ✅ Appel à l'action du store
      const newUser = await signupUser(userData);
      
      if (newUser) {
        toast.success(`Bienvenue ${newUser.name} ! Votre compte a été créé avec succès 🎉`);
        handleEnterPlatform();
        return true;
      } else {
        toast.error('Cet email est déjà utilisé. Essayez de vous connecter.');
        return false;
      }
      
    } catch (error: any) {
      console.error('❌ [hook/useAuthHandlers] handleSignup:', error);
      
      // Gérer les différents types d'erreur
      if (error?.message === 'EMAIL_EXISTS') {
        toast.error('Cet email est déjà utilisé. Essayez de vous connecter ou utilisez un autre email.');
        return false;
      }
      
      if (error?.message === 'INVALID_DATA') {
        toast.error('Données invalides. Veuillez vérifier les informations saisies.');
        return false;
      }
      
      // Erreur générique
      toast.error('Erreur lors de la création du compte. Veuillez réessayer.');
      return false;
    }
  };

  /**
   * Gère l'inscription à la newsletter
   * ✅ Utilise l'action subscribeToNewsletter du store
   */
  const handleNewsletterSubscribe = async (data: {
    email: string;
    location: string;
    frequency: string;
  }): Promise<boolean> => {
    try {
      // ✅ Appel à l'action du store
      const success = await subscribeToNewsletter(data.email);
      
      if (success) {
        const frequencyText = data.frequency === 'daily' ? 'quotidienne' : 
                             data.frequency === 'weekly' ? 'hebdomadaire' : 
                             data.frequency === 'monthly' ? 'mensuelle' : 'événements importants';
        
        toast.success(`Abonnement confirmé ! Vous recevrez la newsletter ${frequencyText} pour ${data.location} 📧`);
        return true;
      } else {
        toast.error('Erreur lors de l\'inscription à la newsletter. Veuillez réessayer.');
        return false;
      }
      
    } catch (error) {
      console.error('❌ [hook/useAuthHandlers] handleNewsletterSubscribe:', error);
      toast.error('Erreur lors de l\'inscription à la newsletter. Veuillez réessayer.');
      return false;
    }
  };

  return {
    handleLogin,
    handleSocialLogin,
    handleSignup,
    handleNewsletterSubscribe
  };
}
