import { Badge } from "../ui/badge";
import { GroupType } from "../../types";
import { Users, Briefcase, Target, MapPin } from "lucide-react";

interface GroupTypeBadgeProps {
  type: GroupType;
}

const typeConfig: Record<GroupType, { label: string; color: string; icon: React.ReactNode }> = {
  community: {
    label: "Communauté",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    icon: <Users className="w-3 h-3" />,
  },
  team: {
    label: "Équipe",
    color: "bg-green-100 text-green-700 hover:bg-green-200",
    icon: <Briefcase className="w-3 h-3" />,
  },
  project: {
    label: "Projet",
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    icon: <Target className="w-3 h-3" />,
  },
  local: {
    label: "Antenne Locale",
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    icon: <MapPin className="w-3 h-3" />,
  },
};

export function GroupTypeBadge({ type }: GroupTypeBadgeProps) {
  const config = typeConfig[type];

  return (
    <Badge className={`${config.color} gap-1 border-0`} variant="secondary">
      {config.icon}
      <span>{config.label}</span>
    </Badge>
  );
}
