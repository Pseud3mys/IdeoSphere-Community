import { Group, User } from "../../types";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { GroupTypeBadge } from "./GroupTypeBadge";
import { GroupMembersList } from "./GroupMembersList";
import { GroupLinksModule } from "./GroupLinksModule";
import { MapPin } from "lucide-react";

interface GroupInfoDialogProps {
  group: Group;
  animators: User[];
  members: User[];
  isAnimator: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Fenêtre "Infos" d'un groupe : description complète, tags, lieu, membres et liens.
 */
export function GroupInfoDialog({ group, animators, members, isAnimator, open, onOpenChange }: GroupInfoDialogProps) {
  const locationLabel = group.location
    ? (typeof group.location === 'string' ? group.location : group.location.label)
    : '';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gh gh-info">
        <DialogHeader>
          <DialogTitle>{group.name}</DialogTitle>
          <DialogDescription asChild>
            <div className="gh-meta">
              <GroupTypeBadge type={group.type} size="sm" />
              {locationLabel && (
                <span className="gh-meta-item">
                  <MapPin className="w-3 h-3" />
                  {locationLabel}
                </span>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        {group.description && <p className="gh-info-desc">{group.description}</p>}

        {group.tags && group.tags.length > 0 && (
          <div className="gh-info-tags">
            {group.tags.map(tag => (
              <span key={tag} className="gh-info-tag">#{tag}</span>
            ))}
          </div>
        )}

        <div className="gh-info-section">
          <GroupMembersList groupId={group.id} animators={animators} members={members} showAll={true} />
        </div>

        <div className="gh-info-section">
          <GroupLinksModule groupId={group.id} isAnimator={isAnimator} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
