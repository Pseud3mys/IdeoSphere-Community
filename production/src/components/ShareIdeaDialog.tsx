import { ShareDialog } from './ShareDialog';

interface ShareIdeaDialogProps {
  ideaId: string;
  ideaTitle: string;
  children: React.ReactNode;
}

/**
 * @deprecated Utilisez ShareDialog directement avec contentType='idea'
 * Ce wrapper est conservé pour compatibilité rétrograde
 */
export function ShareIdeaDialog({ ideaId, ideaTitle, children }: ShareIdeaDialogProps) {
  return (
    <ShareDialog 
      contentId={ideaId}
      contentTitle={ideaTitle}
      contentType="idea"
    >
      {children}
    </ShareDialog>
  );
}
