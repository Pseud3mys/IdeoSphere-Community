import { Badge } from "../ui/badge";
import { GroupType } from "../../types";
import { Users, Target, MapPin, Lightbulb } from "lucide-react";
import { getGroupTypeInfo } from "../../config/clientConfig";

interface GroupTypeBadgeProps {
  type: GroupType;
  size?: 'sm' | 'md';
}

// Configuration par défaut avec icônes et couleurs
const typeVisualConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  community: {
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    icon: <Users className="w-3 h-3" />,
  },
  project: {
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    icon: <Target className="w-3 h-3" />,
  },
  local: {
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    icon: <MapPin className="w-3 h-3" />,
  },
  challenge: {
    color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
    icon: <Lightbulb className="w-3 h-3" />,
  },
};

export function GroupTypeBadge({ type, size = 'md' }: GroupTypeBadgeProps) {
  // Récupérer le label depuis la config
  const typeInfo = getGroupTypeInfo(type);
  const label = typeInfo?.label || type;
  
  // Récupérer les visuels (icône et couleur)
  const visual = typeVisualConfig[type] || {
    color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    icon: <Users className="w-3 h-3" />,
  };

  return (
    <Badge className={`${visual.color} gap-1 border-0 ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`} variant="secondary">
      {visual.icon}
      <span>{label}</span>
    </Badge>
  );
}
