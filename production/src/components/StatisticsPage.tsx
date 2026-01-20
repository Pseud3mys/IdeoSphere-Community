import { useState, useEffect } from 'react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import {
  fetchGlobalHealthStats,
  fetchRawDataExport,
  GlobalHealthStats,
} from '../api/statisticsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  Activity,
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  Download,
  AlertCircle,
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface StatisticsPageProps {
  onNavigateBack?: () => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function StatisticsPage({ onNavigateBack }: StatisticsPageProps) {
  const [globalStats, setGlobalStats] = useState<GlobalHealthStats | null>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    getAllUsers,
    getAllIdeas,
    getAllPosts,
    getAllGroups,
  } = useEntityStoreSimple();
  
  const users = getAllUsers();
  const ideas = getAllIdeas();
  const posts = getAllPosts();
  const groups = getAllGroups();
  
  // Charger les statistiques au montage
  useEffect(() => {
    loadStatistics();
  }, []);
  
  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      const stats = await fetchGlobalHealthStats(users, ideas, posts);
      setGlobalStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExportRawData = async () => {
    try {
      const data = await fetchRawDataExport(users, ideas, posts, groups);
      setRawData(data);
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ideosphere-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
    }
  };
  
  const handleViewRawData = async () => {
    try {
      const data = await fetchRawDataExport(users, ideas, posts, groups);
      setRawData(data);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  };
  
  const currentStats = globalStats;
  
  if (isLoading || !currentStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }
  
  const contentTimeData = currentStats.contentOverTime.daily;
  const usersTimeData = currentStats.usersOverTime?.daily || [];
  
  const getGiniInterpretation = (gini: number) => {
    if (gini < 0.3) return { text: 'Excellente égalité', color: 'text-green-600', icon: CheckCircle };
    if (gini < 0.5) return { text: 'Bonne distribution', color: 'text-blue-600', icon: CheckCircle };
    if (gini < 0.7) return { text: 'Distribution modérée', color: 'text-yellow-600', icon: AlertCircle };
    return { text: 'Forte concentration', color: 'text-red-600', icon: AlertCircle };
  };
  
  const giniInterpretation = getGiniInterpretation(currentStats.participationDistribution.gini);
  const GiniIcon = giniInterpretation.icon;
  
  const contentTypesData = [
    { name: 'Idées', value: currentStats.totalIdeas },
    { name: 'Posts', value: currentStats.totalPosts },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">Statistiques et Données</h1>
              <p className="text-gray-600">
                Vue d'ensemble de la santé et de l'activité de la plateforme
              </p>
            </div>
            {onNavigateBack && (
              <Button variant="outline" onClick={onNavigateBack}>
                Retour
              </Button>
            )}
          </div>
        </div>
        
        <div className="space-y-6">
            {/* Cartes KPI */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Utilisateurs</CardTitle>
                  <Users className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{currentStats.totalUsers}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentStats.activeUsers} actifs ({Math.round((currentStats.activeUsers / currentStats.totalUsers) * 100)}%)
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Contenu total</CardTitle>
                  <FileText className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{currentStats.totalContent}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {currentStats.totalIdeas} idées + {currentStats.totalPosts} posts
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Soutiens</CardTitle>
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{currentStats.totalSupports}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    ~{Math.round(currentStats.totalSupports / currentStats.totalContent)} par contenu
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">Contributions moy.</CardTitle>
                  <Activity className="h-4 w-4 text-gray-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{currentStats.avgContributionsPerUser.toFixed(0) / 10}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    par utilisateur actif
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* SECTION GRAPHIQUES TEMPORELS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Graphique 1 : Contenu */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Création de contenu
                    </CardTitle>
                    <CardDescription>
                      Évolution journalière
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={contentTimeData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} dot={false} name="Contenu créé" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Graphique 2 : Utilisateurs (Nouveaux) */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Croissance de la communauté
                    </CardTitle>
                    <CardDescription>
                      Nouveaux inscrits et visiteurs actifs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={usersTimeData}>
                        <defs>
                          <linearGradient id="colorRegistered" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorAnon" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickMargin={10}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Area 
                            type="monotone" 
                            dataKey="registered" 
                            stroke="#10b981" 
                            fillOpacity={1} 
                            fill="url(#colorRegistered)" 
                            name="Nouveaux inscrits" 
                        />
                        <Area 
                            type="monotone" 
                            dataKey="activeAnonymous" 
                            stroke="#f59e0b" 
                            fillOpacity={1} 
                            fill="url(#colorAnon)" 
                            name="Visiteurs actifs (sans compte)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
            </div>

            {/* Distribution & Top Contributeurs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Colonne Gauche: Distribution & Pie Chart */}
              <div className="lg:col-span-1 space-y-6">
                  {/* Carte Gini simplifiée */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Égalité
                      </CardTitle>
                      <CardDescription>
                        Distribution de l'effort
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center p-4">
                            <div className="text-4xl font-bold mb-2 text-gray-800">
                                {currentStats.participationDistribution.gini.toFixed(3)}
                            </div>
                            <Badge variant="outline" className={`${giniInterpretation.color} mb-2`}>
                                <GiniIcon className="h-3 w-3 mr-1" />
                                {giniInterpretation.text}
                            </Badge>
                            <p className="text-xs text-center text-gray-500">
                                Coefficient de Gini<br/>(0 = égalité parfaite)
                            </p>
                        </div>
                    </CardContent>
                  </Card>
              
                  <Card>
                    <CardHeader>
                    <CardTitle>Contenu</CardTitle>
                    <CardDescription>
                        Répartition par type
                    </CardDescription>
                    </CardHeader>
                    <CardContent>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                        <Pie
                            data={contentTypesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {contentTypesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[0]}}></div>
                            Idées
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[1]}}></div>
                            Posts
                        </div>
                    </div>
                    </CardContent>
                </Card>
              </div>

              {/* Colonne Droite: Top Contributeurs (2/3 largeur) */}
              <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Top Contributeurs</CardTitle>
                    <CardDescription>
                    Membres ayant le plus fort impact (qualité x diversité)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {currentStats.topContributors.map((contributor, index) => {
                        // Utiliser le nom renvoyé par le backend si possible, sinon fallback
                        const user = users.find(u => u.id === contributor.userId);
                        const displayName = contributor.name || user?.name || 'Utilisateur inconnu';
                        
                        return (
                        <div key={contributor.userId} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div className={`
                                flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}
                            `}>
                                #{index + 1}
                            </div>
                            
                            <div className="flex-1">
                                <div className="font-medium text-gray-900">{displayName}</div>
                                <div className="flex gap-3 text-xs text-gray-500 mt-1">
                                    <span className="flex items-center">
                                        Impact: <span className="font-semibold ml-1 text-primary">{contributor.score.toFixed(1)}</span>
                                    </span>
                                    <span>·</span>
                                    <span className="flex items-center">
                                        Masse d'activité: <span className="font-semibold ml-1">{contributor.totalContributions.toFixed(1)}</span>
                                    </span>
                                </div>
                            </div>
                            
                            {index === 0 && (
                                <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                    🏆 Top Impact
                                </Badge>
                            )}
                        </div>
                        );
                    })}
                    
                    {currentStats.topContributors.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            Pas encore assez de données pour établir le classement.
                        </div>
                    )}
                    </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Export de données brutes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export de données
                </CardTitle>
                <CardDescription>
                  Accédez aux données brutes pour vos propres analyses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button onClick={handleExportRawData}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger JSON
                  </Button>
                  <Button variant="outline" onClick={handleViewRawData}>
                    Prévisualiser
                  </Button>
                </div>
                
                {rawData && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm">Date d'export: {new Date(rawData.exportDate).toLocaleString()}</span>
                      <Badge variant="secondary">
                        {rawData.users.length} users · {rawData.ideas.length} ideas · {rawData.posts.length} posts
                      </Badge>
                    </div>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-64 text-xs font-mono">
                      {JSON.stringify(rawData, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}