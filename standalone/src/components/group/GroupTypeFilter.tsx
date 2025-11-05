import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { GroupType } from "../../types";

interface GroupTypeFilterProps {
  selectedType: GroupType | "all";
  onFilterChange: (type: GroupType | "all") => void;
}

export function GroupTypeFilter({ selectedType, onFilterChange }: GroupTypeFilterProps) {
  return (
    <Tabs value={selectedType} onValueChange={(value) => onFilterChange(value as GroupType | "all")}>
      {/* Conteneur avec scroll horizontal sur mobile */}
      <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <TabsList className="inline-flex min-w-min">
          <TabsTrigger value="all" className="whitespace-nowrap px-2 md:px-3">
            Tous
          </TabsTrigger>
          <TabsTrigger value="community" className="whitespace-nowrap px-2 md:px-3">
            <span className="hidden md:inline">Communauté</span>
            <span className="md:hidden">Comm.</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="whitespace-nowrap px-2 md:px-3">
            Équipe
          </TabsTrigger>
          <TabsTrigger value="project" className="whitespace-nowrap px-2 md:px-3">
            Projet
          </TabsTrigger>
          <TabsTrigger value="local" className="whitespace-nowrap px-2 md:px-3">
            Locale
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}
