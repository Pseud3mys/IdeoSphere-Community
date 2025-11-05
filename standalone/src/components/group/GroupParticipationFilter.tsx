import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

export type ParticipationFilter = "all" | "my" | "pending";

interface GroupParticipationFilterProps {
  selectedFilter: ParticipationFilter;
  onFilterChange: (filter: ParticipationFilter) => void;
  myGroupsCount?: number;
  pendingCount?: number;
}

export function GroupParticipationFilter({ 
  selectedFilter, 
  onFilterChange,
  myGroupsCount = 0,
  pendingCount = 0
}: GroupParticipationFilterProps) {
  return (
    <Tabs value={selectedFilter} onValueChange={(value) => onFilterChange(value as ParticipationFilter)}>
      <div className="w-full overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <TabsList className="inline-flex min-w-min">
          <TabsTrigger value="all" className="whitespace-nowrap px-3 md:px-4">
            Tous
          </TabsTrigger>
          <TabsTrigger value="my" className="whitespace-nowrap px-3 md:px-4">
            Mes groupes {myGroupsCount > 0 && `(${myGroupsCount})`}
          </TabsTrigger>
          <TabsTrigger value="pending" className="whitespace-nowrap px-3 md:px-4">
            En attente {pendingCount > 0 && `(${pendingCount})`}
          </TabsTrigger>
        </TabsList>
      </div>
    </Tabs>
  );
}
