import { User } from "../../types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { UserLink } from "../UserLink";
import { Crown, User as UserIcon } from "lucide-react";
import { Button } from "../ui/button";

interface GroupMembersListProps {
  groupId: string;
  animators: User[];
  members: User[];
  limit?: number;
  showAll?: boolean;
  onShowAll?: () => void;
}

export function GroupMembersList({
  animators,
  members,
  limit = 5,
  showAll = false,
  onShowAll,
}: GroupMembersListProps) {
  // Trier les membres alphabétiquement
  const sortedMembers = [...members].sort((a, b) => a.name.localeCompare(b.name));
  
  // Limiter le nombre de membres si nécessaire
  const displayedMembers = showAll ? sortedMembers : sortedMembers.slice(0, limit);
  const hasMore = !showAll && sortedMembers.length > limit;

  return (
    <div className="space-y-6">
      {/* Animateurs */}
      {animators.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-yellow-600" />
            Animateurs ({animators.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {animators.map((animator) => (
              <div
                key={animator.id}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg"
              >
                <Avatar>
                  <AvatarImage src={animator.avatar} alt={animator.name} />
                  <AvatarFallback>
                    {animator.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <UserLink userId={animator.id} className="hover:underline">
                    {animator.name}
                  </UserLink>
                  {animator.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {animator.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Membres */}
      {displayedMembers.length > 0 && (
        <div>
          <h3 className="flex items-center gap-2 mb-3">
            <UserIcon className="w-5 h-5" />
            Membres ({sortedMembers.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg"
              >
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>
                    {member.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <UserLink userId={member.id} className="hover:underline">
                    {member.name}
                  </UserLink>
                  {member.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {member.bio}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {hasMore && onShowAll && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={onShowAll}>
                Voir tous les {sortedMembers.length} membres
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
