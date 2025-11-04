import { Group } from "../../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { GroupTypeBadge } from "./GroupTypeBadge";
import { Users, Lightbulb, FolderKanban, Check } from "lucide-react";

interface GroupCardProps {
  group: Group;
  isMember: boolean;
  onJoin: () => void;
  onClick: () => void;
}

export function GroupCard({ group, isMember, onJoin, onClick }: GroupCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Ne pas propager si on clique sur le bouton
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onClick();
  };

  const handleJoinClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onJoin();
  };

  return (
    <Card
      className="hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 md:gap-3">
          <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
            {group.avatar && (
              <div className="text-2xl md:text-3xl flex-shrink-0">{group.avatar}</div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="line-clamp-1">{group.name}</CardTitle>
              <div className="mt-1">
                <GroupTypeBadge type={group.type} />
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant={isMember ? "outline" : "default"}
            onClick={handleJoinClick}
            className="flex-shrink-0"
          >
            {isMember ? (
              <>
                <Check className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Membre</span>
              </>
            ) : (
              <>
                <span className="hidden md:inline">Rejoindre</span>
                <span className="md:hidden">+</span>
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <CardDescription className="line-clamp-2 mb-3">
          {group.shortDescription}
        </CardDescription>
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">{group.memberCount} membres</span>
            <span className="md:hidden">{group.memberCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Lightbulb className="w-4 h-4" />
            <span className="hidden md:inline">{group.ideaCount} idées</span>
            <span className="md:hidden">{group.ideaCount}</span>
          </div>
          {group.projectCount > 0 && (
            <div className="flex items-center gap-1">
              <FolderKanban className="w-4 h-4" />
              <span className="hidden md:inline">{group.projectCount} projets</span>
              <span className="md:hidden">{group.projectCount}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
