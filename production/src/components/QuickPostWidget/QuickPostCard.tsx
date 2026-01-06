import { FeedPostCard } from '../../api/feedService';
import { Button } from '../ui/button';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface QuickPostCardProps {
  post: FeedPostCard;
  onSupport: (postId: string) => void;
  isSupporting?: boolean;
  isSupported?: boolean;
}

export function QuickPostCard({ post, onSupport, isSupporting = false, isSupported = false }: QuickPostCardProps) {
  const truncateContent = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="rounded-lg border border-gray-300 hover:shadow-md transition-shadow bg-white/80 backdrop-blur-sm">
      <div className="p-4">
        <div className="space-y-3">
          {/* Contenu du post */}
          <p className="text-sm text-gray-700">
            {truncateContent(post.content)}
          </p>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: fr })}
            </span>
            <span>{post.supportCount} soutien{post.supportCount > 1 ? 's' : ''}</span>
          </div>

          {/* Bouton Soutenir */}
          <Button
            size="sm"
            variant={isSupported ? "default" : "outline"}
            className="w-full"
            onClick={() => onSupport(post.id)}
            disabled={isSupporting}
          >
            <Heart className={`h-4 w-4 mr-2 ${isSupported ? 'fill-current' : ''}`} />
            {isSupported ? 'Soutenu' : 'Soutenir'}
          </Button>
        </div>
      </div>
    </div>
  );
}
