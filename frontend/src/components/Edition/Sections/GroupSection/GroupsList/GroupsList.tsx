import { Group } from "../../../../../hooks/Edition/useGroupsSection";
import { CardsSection } from "../../../CardsSection";
import { GroupCard } from "./GroupCard";

type GroupsListProps = {
  groups: Group[];
  title: string;
  editClick: (group: Group) => void;
  deleteClick: (group: Group) => void;
};

export const GroupsList = ({
  groups,
  title,
  editClick,
  deleteClick,
}: GroupsListProps) => {
  return (
    <CardsSection
      title={title}
      cards={groups.map((group) => (
        <GroupCard
          group={group}
          editClick={() => editClick(group)}
          deleteClick={() => deleteClick(group)}
        />
      ))}
    />
  );
};
