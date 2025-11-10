import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { GroupType } from "../../types";
import { getGroupTypes } from "../../config/clientConfig";

interface GroupTypeFilterProps {
  selectedType: GroupType | "all";
  onFilterChange: (type: GroupType | "all") => void;
}

export function GroupTypeFilter({ selectedType, onFilterChange }: GroupTypeFilterProps) {
  const groupTypes = getGroupTypes();

  return (
    <Tabs value={selectedType} onValueChange={(value) => onFilterChange(value as GroupType | "all")}>
      {/* Conteneur avec scroll horizontal sur mobile */}
      <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <TabsList className="inline-flex min-w-min">
          <TabsTrigger value="all" className="whitespace-nowrap px-2 md:px-3">
            Tous
          </TabsTrigger>
          {groupTypes.map((groupType) => (
            <TabsTrigger 
              key={groupType.id} 
              value={groupType.id} 
              className="whitespace-nowrap px-2 md:px-3"
            >
              <span className="hidden md:inline">{groupType.label}</span>
              <span className="md:hidden">{groupType.icon}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
}
