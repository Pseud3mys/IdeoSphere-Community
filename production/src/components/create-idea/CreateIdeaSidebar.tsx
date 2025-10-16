import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { User } from '../../types';
import { 
  Save, 
  Send, 
  Eye, 
  Lightbulb, 
  Users, 
  MessageSquare, 
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface CreateIdeaSidebarProps {
  creationMode: 'post' | 'idea';
  onSaveDraft: (title: string, summary: string, description?: string) => void;
  currentUser: User;
}

export function CreateIdeaSidebar({
  creationMode,
  onSaveDraft,
  currentUser
}: CreateIdeaSidebarProps) {
  const handleSaveDraft = () => {
    // Pour l'instant on simule la sauvegarde avec des valeurs vides
    // Dans une vraie implémentation, on passerait les vraies valeurs des formulaires
    onSaveDraft('Brouillon', 'Contenu du brouillon...', '');
  };

  return (
    <div className="space-y-6">
      {/* Mode actuel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            {creationMode === 'post' ? (
              <>
                <MessageSquare className="w-4 h-4" />
                <span>Post rapide</span>
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4" />
                <span>Idée complète</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {creationMode === 'post' ? (
            <p>Partagez rapidement une réflexion, question ou observation avec la communauté. Vous pourrez toujours la développer en idée plus tard.</p>
          ) : (
            <p>Créez une proposition structurée avec description détaillée, évaluations et collaboration possible.</p>
          )}
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            type="button" 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleSaveDraft}
          >
            <Save className="w-4 h-4 mr-2" />
            Sauvegarder brouillon
          </Button>
        </CardContent>
      </Card>

      {/* Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {creationMode === 'post' ? 'Conseils pour votre post' : 'Guide de rédaction'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {creationMode === 'post' ? (
            <>
              <div className="space-y-2">
                <h4>💬 Idées de posts :</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Poser une question à la communauté</li>
                  <li>• Partager une observation</li>
                  <li>• Lancer un débat ou une réflexion</li>
                  <li>• Raconter une expérience</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4>✨ Pour plus d'engagement :</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Soyez authentique et personnel</li>
                  <li>• Posez des questions ouvertes</li>
                  <li>• Partagez des exemples concrets</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <h4>📝 Structure recommandée :</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Contexte et enjeu</li>
                  <li>• Solution proposée</li>
                  <li>• Étapes de mise en œuvre</li>
                  <li>• Ressources nécessaires</li>
                  <li>• Impact attendu</li>
                </ul>
              </div>
              
              <div className="space-y-2">
                <h4>🎯 Conseils :</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>• Soyez concret et précis</li>
                  <li>• Pensez aux bénéfices pour la communauté</li>
                  <li>• Incluez des étapes réalisables</li>
                  <li>• Mentionnez les ressources disponibles</li>
                </ul>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Rappel communauté */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Communauté</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>
            Votre contribution enrichit notre intelligence collective et aide 
            la communauté à identifier les meilleures solutions.
          </p>
          <div className="flex items-center space-x-2 text-primary">
            <Clock className="w-3 h-3" />
            <span>En ligne maintenant: 12 membres</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}