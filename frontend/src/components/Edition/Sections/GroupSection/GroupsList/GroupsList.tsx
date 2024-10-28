import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { Group } from "../GroupsSection";
import { GroupCard } from "./GroupCard";

type GroupsListProps = {
  groups: Group[];
  title: string;
  editClick: (group: Group) => void;
};

export const GroupsList = ({ groups, title, editClick }: GroupsListProps) => {
  return (
    <div>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {groups.length > 0
          ? groups.map((group) => (
              <GroupCard group={group} editClick={() => editClick(group)} />
            ))
          : EMPTY_FIELD_STRING}
      </div>
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
  title: {
    color: "blue",
  },
};
