import { Group } from "../../types";
import { Button } from "../ui/button";
import { GroupTypeBadge } from "./GroupTypeBadge";
import { Users, Lightbulb, FolderKanban, Check, Settings } from "lucide-react";

interface GroupHeaderProps {
  group: Group;
  isMember: boolean;
  isAnimator: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onManage?: () => void;
}

export function GroupHeader({
  group,
  isMember,
  isAnimator,
  onJoin,
  onLeave,
  onManage,
}: GroupHeaderProps) {
  return (
    <div className="border-b bg-card">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="flex items-start gap-4 md:gap-6">
          {/* Avatar */}
          {group.avatar && (
            <div className="text-4xl md:text-6xl flex-shrink-0">{group.avatar}</div>
          )}

          {/* Informations principales */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="mb-2">{group.name}</h1>
                <div className="mb-3">
                  <GroupTypeBadge type={group.type} />
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-2 shrink-0">
                {isAnimator && onManage && (
                  <Button variant="outline" onClick={onManage} size="sm" className="md:h-10">
                    <Settings className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Gérer</span>
                  </Button>
                )}
                {isMember ? (
                  <Button variant="outline" onClick={onLeave} size="sm" className="md:h-10">
                    <Check className="w-4 h-4 md:mr-2" />
                    <span className="hidden md:inline">Membre</span>
                  </Button>
                ) : (
                  <Button onClick={onJoin} size="sm" className="md:h-10">
                    Rejoindre
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-muted-foreground mb-4">{group.description}</p>

            {/* Métadonnées */}
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-muted-foreground">
              <div className="flex items-center gap-1 md:gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden md:inline">{group.memberCount} membres</span>
                <span className="md:hidden">{group.memberCount}</span>
              </div>
              <div className="flex items-center gap-1 md:gap-2">
                <Lightbulb className="w-4 h-4" />
                <span className="hidden md:inline">{group.ideaCount} idées</span>
                <span className="md:hidden">{group.ideaCount}</span>
              </div>
              {group.projectCount > 0 && (
                <div className="flex items-center gap-1 md:gap-2">
                  <FolderKanban className="w-4 h-4" />
                  <span className="hidden md:inline">{group.projectCount} projets</span>
                  <span className="md:hidden">{group.projectCount}</span>
                </div>
              )}
              {group.location && (
                <div className="flex items-center gap-1 md:gap-2">
                  <span>📍</span>
                  <span className="hidden md:inline">
                    {typeof group.location === 'string' ? group.location : group.location.label}
                  </span>
                  <span className="md:hidden truncate max-w-[80px]">
                    {typeof group.location === 'string' ? group.location : group.location.city || group.location.label}
                  </span>
                </div>
              )}
            </div>

            {/* Tags */}
            {group.tags && group.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted text-muted-foreground rounded text-sm"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
