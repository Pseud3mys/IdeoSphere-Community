import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { AppHeader } from './AppHeader';
import { AuthButtons } from './AuthButtons';
import { NewsletterSubscription } from './NewsletterSubscription';
import { LocationSearch } from './LocationSearch';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { fetchHomePageStats, HomePageData } from '../api/feedService';
import { Location } from '../types';
import { 
  ArrowRight, 
  MapPin, 
  Lightbulb,
  Users,
  MessageSquare,
  CheckCircle2,
  Heart,
  Clock,
  TrendingUp,
  Send
} from 'lucide-react';
import { clientConfig, getCityName, getMemberTerm } from '../config/clientConfig';

interface CitizenWelcomeProps {
  onEnterPlatform: () => void;
  onEnterPlatformWithTempUser: () => Promise<void>;
  onNavigateToCreateIdea: () => void;
  onNavigateToHowItWorks?: () => void; // Navigation vers la page "Comment ça marche"
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSocialLogin: (provider: string) => Promise<boolean>;
  onSignup: (userData: {
    name: string;
    email: string;
    password: string;
    location?: string;
    bio?: string;
  }) => Promise<boolean>;
  onNewsletterSubscribe: (data: {
    email: string;
    location: string;
    frequency: string;
  }) => Promise<boolean>;
  cityName: string;
  onLoginSSO?: () => void;
  onRegisterSSO?: () => void;
}

export function CitizenWelcome({ onEnterPlatform, onEnterPlatformWithTempUser, onNavigateToCreateIdea, onNavigateToHowItWorks, onLogin, onSocialLogin, onSignup, onNewsletterSubscribe, cityName, onLoginSSO, onRegisterSSO }: CitizenWelcomeProps) {
  const [quickIdea, setQuickIdea] = useState('');
  const [showLocationStep, setShowLocationStep] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestLocation, setGuestLocation] = useState<Location | null>(null);
  
  // État pour les données autonomes
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Utiliser l'Entity Store uniquement pour les actions (pas pour les données)
  const { actions, getUserById, getCurrentUser } = useEntityStoreSimple();
  const navigation = useNavigationActions();
  
  // Récupérer l'utilisateur actuel pour le composant AuthButtons
  const currentUser = getCurrentUser();
  
  // Charger les données de manière autonome
  useEffect(() => {
    async function loadHomeData() {
      try {
        setIsLoading(true);
        const data = await fetchHomePageStats();
        setHomeData(data);
      } catch (error) {
        console.error('❌ [CitizenWelcome] Erreur lors du chargement:', error);
        // Utiliser des données par défaut en cas d'erreur
        setHomeData({
          totalContributions: 0,
          totalIdeas: 0,
          totalSupports: 0,
          recentSharedPropositions: [],
          featuredIdeas: []
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    loadHomeData();
  }, []);

  const handleProfileClick = () => {
    navigation.goToProfile();
  };

  const handleShareIdea = () => {
    if (quickIdea.trim()) {
      setShowLocationStep(true);
    }
  };

  const handleSkipLocation = async () => {
    // ✅ Si l'utilisateur est connecté et enregistré, publier directement sans créer de compte invité
    if (currentUser && currentUser.isRegistered) {
      console.log('✅ [CitizenWelcome] Utilisateur connecté, publication directe du post...');
      
      // Publier le post directement avec l'utilisateur actuel
      const newPost = await actions.publishPost({
        content: quickIdea,
        location: guestLocation || undefined
      });
      
      // Navigate to the created post
      if (newPost) {
        navigation.goToPost(newPost.id);
      }
      return;
    }
    
    // ✅ Sinon, créer un utilisateur temporaire via le service API avec les données saisies
    const guestData = {
      name: guestName.trim() || undefined,
      email: guestEmail.trim() || undefined,
      address: guestLocation?.label || undefined
    };
    
    console.log('🔄 [CitizenWelcome] Création d\'un compte invité via l\'API pour partager l\'idée...');
    const tempUser = await actions.createTemporaryGuest(guestData);
    
    if (!tempUser) {
      console.error('❌ [CitizenWelcome] Impossible de créer un utilisateur temporaire');
      return;
    }
    
    console.log('✅ [CitizenWelcome] Compte invité créé avec succès via l\'API !');
    console.log('   - ID:', tempUser.id);
    console.log('   - Nom:', tempUser.name);
    console.log('   - Email:', tempUser.email);
    
    // 2. Entrer dans la plateforme
    actions.enterPlatform();
    
    // 3. Publier le post avec l'utilisateur temporaire
    // ✅ IMPORTANT: Passer explicitement l'ID de l'utilisateur temporaire
    const newPost = await actions.publishPost({
      content: quickIdea,
      location: guestLocation || undefined,
      authorId: tempUser.id // ✅ Utiliser l'utilisateur temporaire qu'on vient de créer
    });
    
    // Navigate to the created post
    if (newPost) {
      navigation.goToPost(newPost.id);
    }
  };

  const handleAddLocation = () => {
    // Même comportement que skip location mais avec capture des données
    handleSkipLocation();
  };

  // Statistiques basées sur les données de l'API
  const recentStats = (() => {
    if (!homeData) {
      return [
        { value: "...", label: clientConfig.welcome.stats.totalContributions },
        { value: "...", label: clientConfig.welcome.stats.totalIdeas },
        { value: "...", label: clientConfig.welcome.stats.totalSupports }
      ];
    }

    const stats = [
      { key: 'totalContributions', value: homeData.totalContributions, label: clientConfig.welcome.stats.totalContributions },
      { key: 'totalIdeas', value: homeData.totalIdeas, label: clientConfig.welcome.stats.totalIdeas },
      { key: 'totalSupports', value: homeData.totalSupports, label: clientConfig.welcome.stats.totalSupports }
    ];

    // Exclure spécifiquement "totalIdeas" (projets partagées) quand sa valeur est exactement 0
    return stats
      .filter(s => !(s.key === 'totalIdeas' && s.value === 0))
      .map(s => ({ value: s.value.toString(), label: s.label }));
  })();

  // Fonction pour formater la date
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "il y a moins d'1 heure";
    } else if (diffInHours < 24) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  };

  // Transformer les données de l'API en format d'affichage (idées et posts)
  const recentPropositions = homeData ? homeData.recentSharedPropositions.slice(0, 5).map(item => {
    if (item.type === 'idea') {
      return {
        id: item.id,
        title: item.title,
        content: item.summary, // Pour les idées, utiliser le summary comme contenu
        time: formatTimeAgo(item.createdAt),
        lastUpdate: formatTimeAgo(item.createdAt),
        type: 'idea' as const,
        supporters: item.supporters // ✅ Passer le tableau de supporters pour le calcul dynamique
      };
    } else {
      // C'est un post
      return {
        id: item.id,
        title: item.content.length > 60 ? item.content.substring(0, 60) + '...' : item.content,
        content: item.content,
        time: formatTimeAgo(item.createdAt),
        lastUpdate: formatTimeAgo(item.createdAt),
        type: 'post' as const,
        supporters: item.supporters // ✅ Passer le tableau de supporters pour le calcul dynamique
      };
    }
  }) : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header unifié */}
      <AppHeader
        currentUserData={currentUser}
        onHomeClick={() => navigation.goToHome()}
        onProfileClick={handleProfileClick}
        onLogin={onLogin}
        onSocialLogin={onSocialLogin}
        onNavigateToHowItWorks={onNavigateToHowItWorks}
        isWelcomePage={true}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section principale */}
        <div className="py-8 sm:py-12 space-y-8">
          {/* ✅ Bandeau d'avertissement démonstration */}
          {clientConfig.features.showBetaBanner && (
            <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-amber-800 mb-1">
                    {clientConfig.welcome.betaBanner.title}
                  </h3>
                  <div className="text-sm text-amber-700 space-y-1">
                    <p dangerouslySetInnerHTML={{ __html: clientConfig.welcome.betaBanner.description }} />
                    <p className="pt-1" dangerouslySetInnerHTML={{ __html: clientConfig.welcome.betaBanner.feedbackInstructions }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Titre principal */}
          <div>
            <h1 className="text-4xl mb-4 text-gray-900 leading-tight">
              {clientConfig.welcome.hero.title}
            </h1>
            
            {/* Boucle pour afficher les paragraphes */}
            <div className="text-lg text-muted-foreground space-y-4">
              {clientConfig.welcome.hero.descriptionParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Idées récemment partagées */}
        <section className="py-8 sm:py-12 border-t border-gray-100">
          <h2 className="text-2xl mb-6 text-gray-900">{clientConfig.welcome.recentPropositions.title}</h2>
          
          <div className="space-y-4">
            {isLoading ? (
              // État de chargement
              <div className="text-center py-8">
                <p className="text-muted-foreground">{clientConfig.welcome.recentPropositions.loadingText}</p>
              </div>
            ) : recentPropositions.length > 0 ? (
              recentPropositions.map((item, index) => (
                <Card key={item.id || index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="mb-2">
                      <h3 className="text-lg text-gray-900">{item.title}</h3>
                    </div>
                    
                    {/* Afficher le contenu pour les posts */}
                    {item.type === 'post' && item.content && item.content !== item.title && (
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{item.content}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {item.time}
                        {item.lastUpdate && item.lastUpdate !== item.time && (
                          <>
                            <span className="mx-2">•</span>
                            <span>dernière mise à jour {item.lastUpdate}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback si pas de données
              <div className="text-center py-8">
                <p className="text-muted-foreground">{clientConfig.welcome.recentPropositions.emptyText}</p>
              </div>
            )}
          </div>
        </section>

        {/* Zone de partage rapide d'idée */}
        <section className="py-8 sm:py-12 border-t border-gray-100">
          {!showLocationStep ? (
            <div className="space-y-4">
              <h2 className="text-2xl mb-6 text-gray-900 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                {clientConfig.welcome.quickIdea.sectionTitle}
              </h2>
              <div className="space-y-3">
                <Textarea
                  placeholder={clientConfig.welcome.quickIdea.placeholder}
                  value={quickIdea}
                  onChange={(e) => setQuickIdea(e.target.value)}
                  rows={3}
                  className="text-base"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleShareIdea}
                    disabled={!quickIdea.trim()}
                    className="bg-primary hover:bg-primary/90 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {clientConfig.welcome.quickIdea.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl mb-6 text-gray-900">{clientConfig.welcome.quickIdea.finalizationTitle}</h2>
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 italic">"{quickIdea}"</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 flex items-center mb-4">
                      <MapPin className="w-5 h-5 mr-2 text-primary" />
                      {clientConfig.welcome.quickIdea.locationSectionTitle}
                    </h3>
                    <LocationSearch
                      onLocationSelect={setGuestLocation}
                      initialLocation={guestLocation || undefined}
                      placeholder={clientConfig.welcome.quickIdea.locationPlaceholder}
                    />
                  </div>
                  
                  {/* ✅ Afficher cette section seulement si l'utilisateur n'est PAS connecté ou est un invité */}
                  {(!currentUser || !currentUser.isRegistered) && (
                    <div className="space-y-4 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        {clientConfig.welcome.quickIdea.followUpSectionTitle}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          placeholder={clientConfig.welcome.quickIdea.namePlaceholder}
                          className="text-base"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                        <Input
                          type="email"
                          placeholder={clientConfig.welcome.quickIdea.emailPlaceholder}
                          className="text-base"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {clientConfig.welcome.quickIdea.followUpDescription}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-6">
                    <Button
                      onClick={handleAddLocation}
                      className="bg-primary hover:bg-primary/90 text-white"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {clientConfig.welcome.quickIdea.submitButtonText}
                    </Button>
                    <Button
                      onClick={handleSkipLocation}
                      variant="outline"
                    >
                      {clientConfig.welcome.quickIdea.skipButtonText}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
        
        {/* CTA pour explorer */}
        <section className="py-8 sm:py-12 border-t border-gray-100">
          <div className="text-center">
            <Button 
              onClick={onEnterPlatformWithTempUser}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-base"
            >
              {clientConfig.welcome.cta.buttonText}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>

        {/* Newsletter personnalisée */}
        {clientConfig.features.enableNewsletters && (
          <section className="py-8 sm:py-12 border-t border-gray-100">
            <NewsletterSubscription onSubscribe={onNewsletterSubscribe} />
          </section>
        )}
      </div>
    </div>
  );
}