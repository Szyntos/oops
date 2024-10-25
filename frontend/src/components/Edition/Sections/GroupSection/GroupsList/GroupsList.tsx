import { Styles } from "../../../../../utils/Styles";
import { Group } from "../GroupsSection";
import { GroupCard } from "./GroupCard";

type GroupsListProps = {
  groups: Group[];
};

export const GroupsList = ({ groups }: GroupsListProps) => {
  return (
    <div style={styles.container}>
      {groups.map((group) => (
        <GroupCard group={group} />
      ))}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
};
