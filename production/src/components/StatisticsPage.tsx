import { useState, useEffect } from 'react';
import { useEntityStoreSimple } from '../hooks/useEntityStoreSimple';
import {
  fetchGlobalHealthStats,
  fetchGroupHealthStats,
  fetchKumuData,
  fetchRawDataExport,
  GlobalHealthStats,
  GroupHealthStats,
  KumuData,
} from '../api/statisticsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BarChart, 
  Bar, 
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
} from 'recharts';
import {
  Activity,
  Users,
  FileText,
  Lightbulb,
  TrendingUp,
  BarChart3,
  Download,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  Share2,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { clientConfig } from '../config/clientConfig';

interface StatisticsPageProps {
  onNavigateBack?: () => void;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

export function StatisticsPage({ onNavigateBack }: StatisticsPageProps) {
  const [globalStats, setGlobalStats] = useState<GlobalHealthStats | null>(null);
  const [groupStats, setGroupStats] = useState<GroupHealthStats | null>(null);
  const [kumuData, setKumuData] = useState<KumuData | null>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('global');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  
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
  
  // Recharger quand le groupe change
  useEffect(() => {
    if (selectedGroupId !== 'global') {
      loadGroupStatistics(selectedGroupId);
    } else {
      setGroupStats(null);
    }
  }, [selectedGroupId]);
  
  const loadStatistics = async () => {
    setIsLoading(true);
    try {
      const [stats, kumu] = await Promise.all([
        fetchGlobalHealthStats(users, ideas, posts),
        fetchKumuData(users, ideas, posts, groups),
      ]);
      setGlobalStats(stats);
      setKumuData(kumu);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadGroupStatistics = async (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;
    
    try {
      const stats = await fetchGroupHealthStats(groupId, group.name, users, ideas, posts);
      setGroupStats(stats);
    } catch (error) {
      console.error('Erreur lors du chargement des stats du groupe:', error);
    }
  };
  
  const handleExportRawData = async () => {
    try {
      const data = await fetchRawDataExport(users, ideas, posts, groups);
      setRawData(data);
      
      // Télécharger le JSON
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
  
  const currentStats = groupStats || globalStats;
  
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
  
  // Préparer les données pour le graphique de contenu dans le temps
  const timeRangeData = currentStats.contentOverTime[selectedTimeRange];
  
  // Préparer les données pour le graphique de distribution
  const participationData = [
    { name: 'Médiane (P50)', value: currentStats.participationDistribution.percentiles.p50 },
    { name: 'P75', value: currentStats.participationDistribution.percentiles.p75 },
    { name: 'P90', value: currentStats.participationDistribution.percentiles.p90 },
    { name: 'P95', value: currentStats.participationDistribution.percentiles.p95 },
  ];
  
  // Interpréter le Gini
  const getGiniInterpretation = (gini: number) => {
    if (gini < 0.3) return { text: 'Excellente égalité', color: 'text-green-600', icon: CheckCircle };
    if (gini < 0.5) return { text: 'Bonne distribution', color: 'text-blue-600', icon: CheckCircle };
    if (gini < 0.7) return { text: 'Distribution modérée', color: 'text-yellow-600', icon: AlertCircle };
    return { text: 'Forte concentration', color: 'text-red-600', icon: AlertCircle };
  };
  
  const giniInterpretation = getGiniInterpretation(currentStats.participationDistribution.gini);
  const GiniIcon = giniInterpretation.icon;
  
  // Données pour le graphique camembert
  const contentTypesData = [
    { name: 'Idées', value: currentStats.totalIdeas },
    { name: 'Posts', value: currentStats.totalPosts },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          
          {/* Sélecteur de groupe */}
          <div className="flex gap-4 items-center">
            <label className="text-sm text-gray-600">Filtrer par groupe:</label>
            <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">🌍 Global (tous les groupes)</SelectItem>
                {groups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.avatar || '📁'} {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {groupStats && (
              <Badge variant="secondary">{groupStats.groupName}</Badge>
            )}
          </div>
        </div>
        
        {/* Tabs principales */}
        <Tabs defaultValue="health" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="health">Santé de la plateforme</TabsTrigger>
            <TabsTrigger value="kumu">Visualisation & Export</TabsTrigger>
          </TabsList>
          
          {/* Tab 1: Santé de la plateforme */}
          <TabsContent value="health" className="space-y-6">
            {/* Cartes de statistiques globales */}
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
                  <div className="text-2xl">{currentStats.avgContributionsPerUser.toFixed(1)}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    par utilisateur actif
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Distribution de participation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distribution de participation
                  </CardTitle>
                  <CardDescription>
                    Analyse de l'égalité de contribution entre utilisateurs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Coefficient de Gini */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Coefficient de Gini</span>
                      <Badge variant="secondary" className={giniInterpretation.color}>
                        <GiniIcon className="h-3 w-3 mr-1" />
                        {giniInterpretation.text}
                      </Badge>
                    </div>
                    <div className="text-3xl mb-1">
                      {currentStats.participationDistribution.gini.toFixed(3)}
                    </div>
                    <p className="text-xs text-gray-500">
                      0 = égalité parfaite, 1 = inégalité maximale
                    </p>
                  </div>
                  
                  {/* Index Herfindahl */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Index Herfindahl-Hirschman</span>
                    </div>
                    <div className="text-3xl mb-1">
                      {currentStats.participationDistribution.herfindahl.toFixed(3)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Mesure de concentration (0 = dispersion, 1 = concentration)
                    </p>
                  </div>
                  
                  {/* Graphique des percentiles */}
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={participationData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              {/* Répartition du contenu */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition du contenu</CardTitle>
                  <CardDescription>
                    Distribution entre idées et posts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={contentTypesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {contentTypesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            {/* Contenu dans le temps */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contenu dans le temps</CardTitle>
                    <CardDescription>
                      Évolution de la création de contenu
                    </CardDescription>
                  </div>
                  <Select value={selectedTimeRange} onValueChange={(v: any) => setSelectedTimeRange(v)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Journalier</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      <SelectItem value="monthly">Mensuel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeRangeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey={selectedTimeRange === 'daily' ? 'date' : selectedTimeRange === 'weekly' ? 'week' : 'month'} 
                      fontSize={11}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Contenu créé" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            {/* Top contributeurs */}
            <Card>
              <CardHeader>
                <CardTitle>Top contributeurs</CardTitle>
                <CardDescription>
                  Les 10 utilisateurs les plus actifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentStats.topContributors.slice(0, 10).map((contributor, index) => {
                    const user = users.find(u => u.id === contributor.userId);
                    if (!user) return null;
                    
                    return (
                      <div key={contributor.userId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm font-semibold text-gray-500 w-6">
                          #{index + 1}
                        </div>
                        <div className="flex-1">
                          <div>{user.name}</div>
                          <div className="text-xs text-gray-500">
                            {contributor.ideas} idées · {contributor.posts} posts · {contributor.supportsGiven} soutiens
                          </div>
                        </div>
                        <div className="text-sm">
                          <Badge variant="secondary">
                            {contributor.totalContributions} contributions
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab 2: Visualisation Kumu */}
          <TabsContent value="kumu" className="space-y-6">
            {/* Visualisation Kumu iframe */}
            {clientConfig.integrations.kumu.enabled && clientConfig.integrations.kumu.embedUrl && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5" />
                        Graphe de réseau - Kumu.io
                      </CardTitle>
                      <CardDescription>
                        Visualisation interactive des connexions entre les entités de la plateforme
                      </CardDescription>
                    </div>
                    {clientConfig.integrations.kumu.projectUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={clientConfig.integrations.kumu.projectUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ouvrir dans Kumu
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full overflow-hidden rounded-lg border border-gray-200">
                    <iframe
                      src={clientConfig.integrations.kumu.embedUrl}
                      width={clientConfig.integrations.kumu.width}
                      height={clientConfig.integrations.kumu.height}
                      style={{ border: 0, display: 'block' }}
                      title="Visualisation Kumu"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Interagissez avec le graphe : cliquez et glissez les nœuds, zoomez, explorez les connexions.
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Exporter les données pour Kumu
                </CardTitle>
                <CardDescription>
                  Téléchargez les données au format JSON pour les importer dans votre propre visualisation Kumu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Kumu.io est une plateforme de visualisation de réseaux. Téléchargez les données au format JSON pour les importer dans Kumu.
                  </AlertDescription>
                </Alert>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        if (kumuData) {
                          const blob = new Blob([JSON.stringify(kumuData, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `kumu-data-${new Date().toISOString().split('T')[0]}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger pour Kumu
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  {/* URL d'import automatique */}
                  <div className="space-y-2">
                    <Label>URL d'import automatique Kumu</Label>
                    <div className="flex gap-2">
                      <Input 
                        readOnly 
                        value={`${window.location.origin}/api/export_kumu.json`}
                        className="font-mono text-sm"
                      />
                      <Button 
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/api/export_kumu.json`);
                          toast.success('URL copiée dans le presse-papier !');
                        }}
                      >
                        Copier
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Utilisez cette URL dans Kumu pour importer automatiquement vos données (nécessite configuration backend).
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4>Structure des données</h4>
                    <p className="text-sm text-gray-600">
                      Les données exportées contiennent deux tableaux :
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li><strong>nodes</strong> : chaque entité (utilisateur, idée, post, groupe)</li>
                      <li><strong>connections</strong> : les relations entre entités</li>
                    </ul>
                  </div>
                  
                  <Button variant="outline" asChild>
                    <a href="https://docs.kumu.io/guides/import.html" target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Documentation Kumu
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Export de données brutes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Export de données brutes
                </CardTitle>
                <CardDescription>
                  Téléchargez ou consultez toutes les données de la plateforme au format JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <Button onClick={handleExportRawData}>
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger JSON
                  </Button>
                  <Button variant="outline" onClick={handleViewRawData}>
                    Prévisualiser les données
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
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96 text-xs">
                      {JSON.stringify(rawData, null, 2)}
                    </pre>
                  </div>
                )}
                
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Cet export contient toutes les données de la plateforme. Vous pouvez l'utiliser pour :
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Analyse externe dans des outils comme Excel, Python, R</li>
                      <li>Backup / sauvegarde des données</li>
                      <li>Import dans d'autres systèmes</li>
                      <li>Création de visualisations personnalisées</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}