import { useState, useEffect } from 'react';
import { Post } from '../../types';
import { FeedPostCard } from '../../api/feedService';
import { fetchGroupFeed } from '../../api/groupService';
import { toggleSupportOnApi } from '../../api/interactionService';
import { QuickPostCard } from './QuickPostCard';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface QuickPostFeedProps {
  groupIds: string[];
  feedSize?: number;
  currentUserId?: string;
  onCreateAnother?: () => void;
  onClose?: () => void;
}

export function QuickPostFeed({ 
  groupIds, 
  feedSize = 6,
  currentUserId = 'unknown',
  onCreateAnother,
  onClose 
}: QuickPostFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [supportingPosts, setSupportingPosts] = useState<Set<string>>(new Set());
  const [supportedPosts, setSupportedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadFeed();
  }, [groupIds]);

  const loadFeed = async () => {
    setIsLoading(true);
    
    try {
      // On utilise le premier groupId pour récupérer le feed
      // TODO: Si plusieurs groupIds, on pourrait merger les feeds
      const primaryGroupId = groupIds[0] || '';
      
      if (!primaryGroupId) {
        console.warn('⚠️ Aucun groupId fourni pour le feed');
        setPosts([]);
        setIsLoading(false);
        return;
      }

      // Récupérer le feed du groupe (idées et posts)
      const { posts: groupPosts } = await fetchGroupFeed(primaryGroupId, currentUserId);
      
      // Limiter aux N premiers posts
      const limitedPosts = groupPosts.slice(0, feedSize);
      setPosts(limitedPosts);
      
      // Initialiser les posts déjà supportés par l'utilisateur
      const alreadySupported = new Set(
        limitedPosts
          .filter(post => post.supporters && post.supporters.includes(currentUserId))
          .map(post => post.id)
      );
      setSupportedPosts(alreadySupported);
      
    } catch (error) {
      console.error('Erreur lors du chargement du feed:', error);
      toast.error('Impossible de charger les contributions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSupport = async (postId: string) => {
    if (supportingPosts.has(postId)) return;

    setSupportingPosts(prev => new Set(prev).add(postId));
    
    const isCurrentlySupporting = supportedPosts.has(postId);
    
    try {
      const result = await toggleSupportOnApi(
        postId, 
        currentUserId, 
        'post', 
        isCurrentlySupporting
      );

      if (result.success) {
        // Mettre à jour l'état local
        setSupportedPosts(prev => {
          const newSet = new Set(prev);
          if (isCurrentlySupporting) {
            newSet.delete(postId);
          } else {
            newSet.add(postId);
          }
          return newSet;
        });

        // Mettre à jour le compteur dans la liste des posts
        setPosts(prev => prev.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              supportCount: isCurrentlySupporting 
                ? post.supportCount - 1 
                : post.supportCount + 1,
              supporters: isCurrentlySupporting
                ? post.supporters.filter(id => id !== currentUserId)
                : [...post.supporters, currentUserId]
            };
          }
          return post;
        }));

        toast.success(isCurrentlySupporting ? 'Soutien retiré' : 'Merci pour votre soutien !');
      } else {
        toast.error('Erreur lors du soutien');
      }
    } catch (error) {
      console.error('Erreur lors du toggle support:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setSupportingPosts(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
    }
  };

  // Convertir Post en FeedPostCard pour le composant QuickPostCard
  const convertToFeedCard = (post: Post): FeedPostCard => ({
    id: post.id,
    content: post.content,
    location: post.location,
    authorId: post.authorId,
    createdAt: post.createdAt,
    supporters: post.supporters || [],
    supportCount: post.supportCount || 0,
    replyCount: post.replies?.length || 0,
    tags: post.tags || [],
    type: 'post'
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-sm text-gray-600">Chargement des contributions...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Merci pour votre contribution ! 🎉
        </CardTitle>
        <p className="text-sm text-gray-600">
          Soutenez d'autres contributions similaires
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Aucune contribution à afficher pour le moment.</p>
            <p className="text-sm mt-2">Soyez le premier à partager vos idées !</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {posts.map(post => (
              <QuickPostCard
                key={post.id}
                post={convertToFeedCard(post)}
                onSupport={handleSupport}
                isSupporting={supportingPosts.has(post.id)}
                isSupported={supportedPosts.has(post.id)}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t">
          {onCreateAnother && (
            <Button
              variant="outline"
              onClick={onCreateAnother}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Créer un autre post
            </Button>
          )}
          {onClose && (
            <Button
              variant="default"
              onClick={onClose}
              className={onCreateAnother ? 'flex-1' : 'w-full'}
            >
              Fermer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
