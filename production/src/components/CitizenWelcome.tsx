import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { LoginDialog } from './auth/LoginDialog';
import { SignupDialog } from './auth/SignupDialog';
import { NewsletterSubscription } from './NewsletterSubscription';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { fetchHomePageStats, HomePageData } from '../api/feedService';
import logoImage from '../assets/logo.png';
import { 
  ArrowRight, 
  MapPin, 
  LogIn, 
  UserPlus, 
  Lightbulb,
  Users,
  MessageSquare,
  CheckCircle2,
  Heart,
  Clock,
  TrendingUp,
  Send
} from 'lucide-react';

interface CitizenWelcomeProps {
  onEnterPlatform: () => void;
  onEnterPlatformWithTempUser: () => Promise<void>; // Nouvelle fonction pour entrer avec utilisateur temporaire
  onNavigateToCreateIdea: () => void; // Nouvelle action pour diriger vers la création d'idée
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
}

export function CitizenWelcome({ onEnterPlatform, onEnterPlatformWithTempUser, onNavigateToCreateIdea, onLogin, onSocialLogin, onSignup, onNewsletterSubscribe, cityName }: CitizenWelcomeProps) {
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showSignupDialog, setShowSignupDialog] = useState(false);
  const [quickIdea, setQuickIdea] = useState('');
  const [showLocationStep, setShowLocationStep] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestLocation, setGuestLocation] = useState('');
  
  // État pour les données autonomes
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Utiliser l'Entity Store uniquement pour les actions (pas pour les données)
  const { actions } = useEntityStoreSimple();
  
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

  const handleAuthAction = (action: 'login' | 'signup') => {
    if (action === 'login') {
      setShowLoginDialog(true);
    } else {
      // Rediriger vers la page d'inscription au lieu du dialog
      actions.goToSignup();
    }
  };

  const handleShareIdea = () => {
    if (quickIdea.trim()) {
      setShowLocationStep(true);
    }
  };

  const handleSkipLocation = async () => {
    // 1. Créer un utilisateur temporaire via le service API avec les données saisies
    const guestData = {
      name: guestName.trim() || undefined,
      email: guestEmail.trim() || undefined,
      address: guestLocation.trim() || undefined
    };
    
    const tempUser = await actions.createTemporaryGuest(guestData);
    
    if (!tempUser) {
      console.error('❌ Impossible de créer un utilisateur temporaire');
      return;
    }
    
    console.log('✅ [CitizenWelcome] Utilisateur temporaire créé:', tempUser.id, tempUser.name);
    
    // 2. Entrer dans la plateforme
    actions.enterPlatform();
    
    // 3. Publier le post avec l'utilisateur temporaire
    // ✅ IMPORTANT: Passer explicitement l'ID de l'utilisateur temporaire
    // publishPost navigue automatiquement vers la page de détail du post
    await actions.publishPost({
      content: quickIdea,
      location: guestLocation.trim() || undefined,
      authorId: tempUser.id // ✅ Utiliser l'utilisateur temporaire qu'on vient de créer
    });
  };

  const handleAddLocation = () => {
    // Même comportement que skip location mais avec capture des données
    handleSkipLocation();
  };

  // Statistiques basées sur les données de l'API
  const recentStats = homeData ? [
    { value: homeData.totalContributions.toString(), label: "contributions totales" },
    { value: homeData.totalIdeas.toString(), label: "idées partagées" },
    { value: homeData.totalSupports.toString(), label: "soutiens reçus" }
  ] : [
    { value: "...", label: "contributions totales" },
    { value: "...", label: "idées partagées" },
    { value: "...", label: "soutiens reçus" }
  ];

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
        location: item.location || item.creators[0]?.name + " (créateur)" || "Localisation non précisée",
        time: formatTimeAgo(item.createdAt),
        lastUpdate: formatTimeAgo(item.createdAt),
        category: item.tags?.[0] || "Idée citoyenne",
        type: 'idea' as const,
        supporters: item.supporters // ✅ Passer le tableau de supporters pour le calcul dynamique
      };
    } else {
      // C'est un post
      return {
        id: item.id,
        title: item.content.length > 60 ? item.content.substring(0, 60) + '...' : item.content,
        content: item.content,
        location: item.location || item.author?.name + " (auteur)" || "Localisation non précisée",
        time: formatTimeAgo(item.createdAt),
        lastUpdate: formatTimeAgo(item.createdAt),
        category: item.tags?.[0] || "Discussion citoyenne",
        type: 'post' as const,
        supporters: item.supporters // ✅ Passer le tableau de supporters pour le calcul dynamique
      };
    }
  }) : [];

  return (
    <div className="min-h-screen bg-white">
      {/* Header simple */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src={logoImage} alt="IdeoSphere Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-xl text-gray-900">IdeoSphere</h1>
                <p className="text-sm text-muted-foreground">Votre communauté d'idées</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button 
                variant="ghost" 
                onClick={() => actions.goToTab('how-it-works')}
                className="text-muted-foreground hover:text-gray-900 text-sm sm:text-base px-2 sm:px-4"
              >
                Comment ça marche ?
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleAuthAction('login')}
                className="text-muted-foreground hover:text-gray-900 text-sm sm:text-base px-2 sm:px-4"
              >
                <LogIn className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Se connecter</span>
              </Button>
              <Button 
                onClick={() => handleAuthAction('signup')}
                className="bg-primary hover:bg-primary/90 text-white text-sm sm:text-base px-2 sm:px-4"
              >
                <UserPlus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Créer un compte</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6">
        {/* Section principale */}
        <div className="py-12">
          {/* ✅ Bandeau d'avertissement démonstration */}
          <div className="mb-6 bg-amber-50 border-l-4 border-amber-400 rounded-lg p-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-amber-800 mb-1">
                  Version Bêta d'ideoSphere !
                </h3>
                <div className="text-sm text-amber-700 space-y-1">
                  <p>
                    Cette plateforme est en <span className="font-medium">version bêta ouverte</span> : son objectif principal est de vous permettre de découvrir et tester IdeoSphere. 
                    Certaines fonctionnalités (comme les communautés) ne sont pas encore actives et des bugs peuvent survenir. Vous pouvez déjà l'utiliser pour tester la plateforme et partager vos idées.
                  </p>
                  <p className="pt-1">
                    💡 <span className="font-medium">Signaler un bug ou suggérer une amélioration :</span> ajoutez simplement <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">#bug</code> ou <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900">#suggestion</code> dans vos posts pour me les faire remonter !
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Titre principal */}
          <div className="mb-8">
            <h1 className="text-4xl mb-4 text-gray-900 leading-tight">
              Partagez, explorez ou discutez d'idées locales
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Aménagement urbain, services publics, initiatives citoyennes, environnement, mobilité, culture, solidarité... 
              Des grandes transformations aux petites améliorations du quotidien, votre liste municipale recueille toutes vos propositions pour améliorer votre territoire.
            </p>
          </div>

          {/* Zone de partage rapide d'idée EN PREMIER */}
          <div className="mb-8">
            {!showLocationStep ? (
              <div className="space-y-4">
                <h2 className="text-xl mb-4 text-gray-900 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                  Partagez votre idée en quelques mots
                </h2>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Ex: Des bancs supplémentaires place de la République pour que les personnes âgées puissent se reposer..."
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
                      Continuer
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <h2 className="text-xl mb-4 text-gray-900">Finalisation de votre idée</h2>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700 italic">"{quickIdea}"</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 flex items-center mb-3">
                        <MapPin className="w-5 h-5 mr-2 text-primary" />
                        Localisation de l'idée (optionnelle)
                      </h3>
                      <Input
                        placeholder="Ex: Place de la République, Le Blanc"
                        className="text-base"
                        value={guestLocation}
                        onChange={(e) => setGuestLocation(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <h3 className="text-base font-medium text-gray-900">
                        Souhaitez-vous suivre l'évolution de votre idée ? (optionnel)
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input
                          placeholder="Votre nom"
                          className="text-base"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                        />
                        <Input
                          type="email"
                          placeholder="Votre email"
                          className="text-base"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ces informations nous permettront de vous tenir informé des évolutions de votre idée.
                      </p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button
                        onClick={handleAddLocation}
                        className="bg-primary hover:bg-primary/90 text-white"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Partager cette idée
                      </Button>
                      <Button
                        onClick={handleSkipLocation}
                        variant="outline"
                      >
                        Partager sans ces informations
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Comment partager une idée - APRÈS le formulaire */}
          {!showLocationStep && (
            <div className="mb-8">
              <h2 className="text-xl mb-4 text-gray-900">Comment ça marche ?</h2>
              <ol className="space-y-2 text-muted-foreground">
                <li>1. Décrivez votre idée ci-dessus</li>
                <li>2. Ajoutez une localisation si nécessaire</li>
                <li>3. Laissez vos coordonnées pour suivre son évolution</li>
                <li>4. Nous la partageons avec votre communauté</li>
              </ol>
            </div>
          )}

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {recentStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Idées récemment partagées */}
        <section className="py-12 border-t border-gray-100">
          <h2 className="text-2xl mb-8 text-gray-900">Propositions récemment partagées</h2>
          
          <div className="space-y-4">
            {isLoading ? (
              // État de chargement
              <div className="text-center py-8">
                <p className="text-muted-foreground">Chargement des propositions récentes...</p>
              </div>
            ) : recentPropositions.length > 0 ? (
              recentPropositions.map((item, index) => (
                <Card key={item.id || index} className="border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg text-primary hover:underline">{item.title}</h3>
                      <Badge variant="secondary" className="text-xs bg-primary/5 text-primary border-primary/20 ml-4">
                        {item.category}
                      </Badge>
                    </div>
                    
                    {/* Afficher le contenu pour les posts */}
                    {item.type === 'post' && item.content && item.content !== item.title && (
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">{item.content}</p>
                    )}
                    
                    <p className="text-sm text-muted-foreground mb-2">{item.location}</p>
                    
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
                      
                      {/* Afficher le nombre de soutiens ou de likes selon le type */}
                      {item.type === 'idea' && 'supporters' in item && (
                        <div className="flex items-center text-primary">
                          <Heart className="w-4 h-4 mr-1" />
                          <span>{item.supporters?.length || 0} soutien{(item.supporters?.length || 0) > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {item.type === 'post' && 'supporters' in item && (
                        <div className="flex items-center text-primary">
                          <Heart className="w-4 h-4 mr-1" />
                          <span>{item.supporters?.length || 0} soutien{(item.supporters?.length || 0) > 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              // Fallback si pas de données
              <div className="text-center py-8">
                <p className="text-muted-foreground">Aucune proposition récente trouvée.</p>
              </div>
            )}
          </div>

          {/* CTA pour explorer */}
          <div className="text-center mt-12">
            <Button 
              onClick={onEnterPlatformWithTempUser}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-base"
            >
              Explorer toutes les propositions
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <div className="flex items-center justify-center space-x-6 mt-6 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-primary/60" />
                Participation citoyenne
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-primary/60" />
                Projets concrets
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 mr-2 text-primary/60" />
                Budget municipal dédié
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter personnalisée */}
        <section className="py-12 border-t border-gray-100">
          <NewsletterSubscription onSubscribe={onNewsletterSubscribe} />
        </section>

        {/* Accès démo en bas de page */}
        <section className="py-12 border-t border-gray-100">
          <div className="text-center">
            <h2 className="text-2xl mb-4 text-gray-900">Envie de découvrir la plateforme ?</h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Explorez les propositions déjà partagées par les citoyens et découvrez comment participer à l'amélioration de notre commune.
            </p>
            
            <Button 
              onClick={onEnterPlatformWithTempUser}
              size="lg"
              className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 px-12 py-4 text-lg"
            >
              <CheckCircle2 className="w-5 h-5 mr-3" />
              Accès démo instantané
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              Aucune inscription requise • Accès immédiat • Toutes les fonctionnalités
            </p>
          </div>
        </section>
      </div>

      {/* Dialogs d'authentification */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onLogin={onLogin}
        onSocialLogin={onSocialLogin}
        onEnterPlatform={onEnterPlatform}
        onSwitchToSignup={() => {
          setShowLoginDialog(false);
          setShowSignupDialog(true);
        }}
      />

      <SignupDialog
        isOpen={showSignupDialog}
        onClose={() => setShowSignupDialog(false)}
        onSignup={onSignup}
        onSocialLogin={onSocialLogin}
        onSwitchToLogin={() => {
          setShowSignupDialog(false);
          setShowLoginDialog(true);
        }}
        onDemoAccess={() => {
          setShowSignupDialog(false);
          onEnterPlatformWithTempUser();
        }}
      />
    </div>
  );
}