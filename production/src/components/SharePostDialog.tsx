import { ShareDialog } from './ShareDialog';

interface SharePostDialogProps {
  postId: string;
  postContent: string;
  children: React.ReactNode;
}

/**
 * @deprecated Utilisez ShareDialog directement avec contentType='post'
 * Ce wrapper est conservé pour compatibilité rétrograde
 */
export function SharePostDialog({ postId, postContent, children }: SharePostDialogProps) {
  return (
    <ShareDialog 
      contentId={postId}
      contentTitle={postContent}
      contentType="post"
    >
      {children}
    </ShareDialog>
  );
}
