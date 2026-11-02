import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { AppHeader } from './AppHeader';
import { LocationSearch } from './LocationSearch';
import { NewsletterSubscription } from './NewsletterSubscription';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import { useNavigationActions } from '../hooks/useNavigationActions';
import { fetchHomePageStats, HomePageData } from '../api/feedService';
import { Location } from '../types';
import { AlertTriangle, ArrowRight, Heart, Lightbulb, MapPin, Send, TrendingUp } from 'lucide-react';
import { clientConfig } from '../config/clientConfig';
import './CitizenWelcome.css';

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
  onLoginSSO?: () => void;
  onRegisterSSO?: () => void;
}

const QUICK_IDEA_INPUT_ID = 'cw-quick-idea';

// Fonction pour formater la date
const formatTimeAgo = (date: Date) => {
  const diffInHours = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60));

  if (diffInHours < 1) {
    return "il y a moins d'1 heure";
  } else if (diffInHours < 24) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
};

export function CitizenWelcome({ onEnterPlatformWithTempUser, onNavigateToHowItWorks, onLogin, onSocialLogin, onNewsletterSubscribe }: CitizenWelcomeProps) {
  const [quickIdea, setQuickIdea] = useState('');
  const [showLocationStep, setShowLocationStep] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestLocation, setGuestLocation] = useState<Location | null>(null);
  const [isEntering, setIsEntering] = useState(false);

  // État pour les données autonomes
  const [homeData, setHomeData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Utiliser l'Entity Store uniquement pour les actions (pas pour les données)
  const { actions, getCurrentUser } = useEntityStoreSimple();
  const navigation = useNavigationActions();

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

  const handleExplore = async () => {
    setIsEntering(true);
    try {
      await onEnterPlatformWithTempUser();
    } finally {
      setIsEntering(false);
    }
  };

  const focusQuickIdea = () => {
    const input = document.getElementById(QUICK_IDEA_INPUT_ID);
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
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

      const newPost = await actions.publishPost({
        content: quickIdea,
        location: guestLocation || undefined
      });

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

    console.log('✅ [CitizenWelcome] Compte invité créé avec succès via l\'API !', tempUser.id);

    // Entrer dans la plateforme puis publier le post avec l'utilisateur temporaire
    actions.enterPlatform();

    // ✅ IMPORTANT: Passer explicitement l'ID de l'utilisateur temporaire
    const newPost = await actions.publishPost({
      content: quickIdea,
      location: guestLocation || undefined,
      authorId: tempUser.id
    });

    if (newPost) {
      navigation.goToPost(newPost.id);
    }
  };

  // Statistiques basées sur les données de l'API
  const stats = [
    { key: 'totalContributions', value: homeData?.totalContributions, label: 'Contributions' },
    { key: 'totalIdeas', value: homeData?.totalIdeas, label: 'Projets partagés' },
    { key: 'totalSupports', value: homeData?.totalSupports, label: 'Soutiens reçus' }
  ]
    // Masquer "Projets partagés" tant qu'il n'y en a aucun
    .filter(s => !(s.key === 'totalIdeas' && s.value === 0));

  // Aperçu des propositions les plus soutenues : volontairement non cliquable,
  // l'accès aux contenus passe par le fil (bouton "Explorer")
  const topPropositions = (homeData?.recentSharedPropositions ?? [])
    .map(item => ({
      id: item.id,
      text: item.type === 'idea' ? item.title : item.content,
      time: formatTimeAgo(item.createdAt),
      supportersCount: item.supporters?.length ?? 0
    }))
    .sort((a, b) => b.supportersCount - a.supportersCount)
    .slice(0, 4);

  return (
    <div className="cw">
      <AppHeader
        currentUserData={currentUser}
        onHomeClick={() => navigation.goToHome()}
        onProfileClick={() => navigation.goToProfile()}
        onLogin={onLogin}
        onSocialLogin={onSocialLogin}
        onNavigateToHowItWorks={onNavigateToHowItWorks}
        isWelcomePage={true}
      />

      {clientConfig.features.showBetaBanner && (
        <div className="cw-beta" role="note">
          <div className="cw-container">
            <AlertTriangle className="w-4 h-4" />
            <p>
              <strong>Version bêta</strong>
              <span className="cw-beta-long"> : certaines fonctionnalités arrivent bientôt et des bugs peuvent survenir.</span>
              <span className="cw-beta-short">.</span>
              {' '}Un souci ou une envie ? Ajoutez <code>#bug</code> ou <code>#suggestion</code> dans un post.
            </p>
          </div>
        </div>
      )}

      {/* Hero : présentation + accès au fil */}
      <section className="cw-hero">
        <div className="cw-container cw-hero-grid">
          <div>
            <h1 className="cw-title">{clientConfig.welcome.title.replace(/-/g, '‑')}</h1>
            <div className="cw-lead">
              {clientConfig.welcome.descriptionParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <div className="cw-actions">
              <button type="button" className="cw-cta" onClick={handleExplore} disabled={isEntering}>
                Explorer les idées de la communauté
                <ArrowRight className="w-5 h-5" />
              </button>
              <button type="button" className="cw-link" onClick={focusQuickIdea}>
                ou partager une idée
              </button>
            </div>

            <ul className="cw-stats">
              {stats.map(stat => (
                <li key={stat.key}>
                  <span className="cw-stat-value">{stat.value ?? '–'}</span>
                  <span className="cw-stat-label">{stat.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <aside className="cw-preview" aria-label="Aperçu des propositions les plus soutenues">
            <div className="cw-preview-head">
              <span className="cw-preview-title">
                <TrendingUp className="w-4 h-4" />
                Les plus soutenues
              </span>
              <span className="cw-preview-badge">Aperçu</span>
            </div>

            {isLoading ? (
              <p className="cw-preview-empty">Chargement des propositions…</p>
            ) : topPropositions.length > 0 ? (
              <ul className="cw-preview-list">
                {topPropositions.map(item => (
                  <li key={item.id} className="cw-preview-item">
                    <span className="cw-preview-support" title={`${item.supportersCount} soutiens`}>
                      <Heart className="w-3 h-3" />
                      {item.supportersCount}
                    </span>
                    <div className="cw-preview-text">
                      <p>{item.text}</p>
                      <span className="cw-preview-time">{item.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="cw-preview-empty">Aucune proposition soutenue pour le moment.</p>
            )}

            <div className="cw-preview-fade">
              <button type="button" className="cw-preview-more" onClick={handleExplore} disabled={isEntering}>
                Voir toutes les idées
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* Partage rapide d'idée */}
      <section className="cw-share">
        <div className="cw-container">
          <div className={`cw-share-card${showLocationStep ? ' is-step' : ''}`}>
            <div className="cw-share-intro">
              <span className="cw-share-icon">
                <Lightbulb className="w-5 h-5" />
              </span>
              <div>
                <h2 className="cw-share-title">
                  {showLocationStep ? 'Finalisation de votre idée' : 'Une idée, une remarque, une question ?'}
                </h2>
                {!showLocationStep && (
                  <p className="cw-share-subtitle">
                    Partagez-la en quelques mots, sans créer de compte. La communauté pourra la soutenir et l'enrichir.
                  </p>
                )}
              </div>
            </div>

            {!showLocationStep ? (
              <div className="cw-share-row">
                <Textarea
                  id={QUICK_IDEA_INPUT_ID}
                  placeholder={clientConfig.welcome.quickIdeaPlaceholder}
                  value={quickIdea}
                  onChange={(e) => setQuickIdea(e.target.value)}
                  rows={2}
                  className="text-base"
                />
                <button
                  type="button"
                  onClick={handleShareIdea}
                  disabled={!quickIdea.trim()}
                  className="cw-share-submit"
                >
                  Partager
                  <Send className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="cw-share-step">
                <p className="cw-share-quote">« {quickIdea} »</p>

                <div>
                  <h3 className="text-base font-medium text-gray-900 flex items-center mb-3">
                    <MapPin className="w-4 h-4 mr-2 text-primary" />
                    Localisation de l'idée (optionnelle)
                  </h3>
                  <LocationSearch
                    onLocationSelect={setGuestLocation}
                    initialLocation={guestLocation || undefined}
                    placeholder={clientConfig.placeholders.idea.location}
                  />
                </div>

                {/* ✅ Afficher cette section seulement si l'utilisateur n'est PAS connecté ou est un invité */}
                {(!currentUser || !currentUser.isRegistered) && (
                  <div>
                    <h3 className="text-base font-medium text-gray-900 mb-3">
                      Souhaitez-vous suivre l'évolution de votre idée ? (optionnel)
                    </h3>
                    <div className="cw-share-fields">
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
                    <p className="text-sm text-muted-foreground mt-2">
                      Ces informations nous permettront de vous tenir informé des évolutions de votre idée.
                    </p>
                  </div>
                )}

                <div className="cw-share-buttons">
                  <Button onClick={handleSkipLocation} className="bg-primary hover:bg-primary/90 text-white">
                    <Send className="w-4 h-4 mr-2" />
                    Partager cette idée
                  </Button>
                  <Button onClick={() => setShowLocationStep(false)} variant="ghost">
                    Modifier
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {clientConfig.features.enableNewsletters && (
        <section className="cw-newsletter">
          <div className="cw-container">
            <NewsletterSubscription onSubscribe={onNewsletterSubscribe} />
          </div>
        </section>
      )}
    </div>
  );
}
