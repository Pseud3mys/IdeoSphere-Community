import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { 
  Globe, 
  ArrowRight, 
  Lightbulb, 
  Users, 
  Zap,
  CheckCircle2
} from 'lucide-react';

interface GlobalIdeaPromptProps {
  onJoinGlobalCommunity: () => void;
}

export function GlobalIdeaPrompt({ onJoinGlobalCommunity }: GlobalIdeaPromptProps) {
  const [showDialog, setShowDialog] = useState(false);

  const handleJoinCommunity = () => {
    setShowDialog(false);
    onJoinGlobalCommunity();
  };

  return (
    <>
      <div className="bg-gradient-to-r from-primary/5 to-purple-50 border border-primary/10 rounded-xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <Globe className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg mb-2 text-gray-900">
              Votre idée n'a pas de localisation précise ?
            </h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Parfait ! Certaines des meilleures idées transcendent les frontières géographiques. 
              Rejoignez notre <strong>communauté globale</strong> pour partager des concepts innovants, 
              des solutions transversales et des visions d'avenir.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Lightbulb className="w-4 h-4 mr-2 text-primary/60" />
                Innovations tech
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2 text-primary/60" />
                Solutions sociales
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Zap className="w-4 h-4 mr-2 text-primary/60" />
                Idées disruptives
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setShowDialog(true)}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                En savoir plus
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button
                onClick={handleJoinCommunity}
                variant="outline"
                className="border-primary/20 text-primary hover:bg-primary/5"
              >
                <Globe className="w-4 h-4 mr-2" />
                Rejoindre directement
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog explicatif */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl">
              <Globe className="w-6 h-6 mr-3 text-primary" />
              Communauté Globale IdeoSphere
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-10 h-10 text-primary" />
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Un espace dédié aux idées <strong>sans frontières</strong> qui peuvent 
                transformer notre façon de travailler, vivre et interagir.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm text-primary mb-3">Types d'idées parfaites pour la communauté globale :</h4>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-900">Applications et plateformes</div>
                    <div className="text-xs text-muted-foreground">Outils numériques, innovations tech, IA</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-900">Concepts sociaux et éducatifs</div>
                    <div className="text-xs text-muted-foreground">Nouvelles méthodes, formations, bien-être</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-900">Solutions environnementales</div>
                    <div className="text-xs text-muted-foreground">Écologie, durabilité, économie circulaire</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 p-3 bg-primary/5 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm text-gray-900">Innovations business</div>
                    <div className="text-xs text-muted-foreground">Nouveaux modèles, startups, entrepreneuriat</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary/10 to-purple-50 p-4 rounded-lg border border-primary/10">
              <div className="flex items-center mb-2">
                <Users className="w-4 h-4 text-primary mr-2" />
                <span className="text-sm text-primary">Avantages exclusifs</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Visibilité internationale pour vos idées</li>
                <li>• Réseau de collaborateurs du monde entier</li>
                <li>• Opportunités de financement et partenariats</li>
                <li>• Retours d'experts sectoriels</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleJoinCommunity}
                className="flex-1 bg-primary hover:bg-primary/90 text-white"
              >
                <Globe className="w-4 h-4 mr-2" />
                Rejoindre la communauté
              </Button>
              
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="sm:w-auto"
              >
                Plus tard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}