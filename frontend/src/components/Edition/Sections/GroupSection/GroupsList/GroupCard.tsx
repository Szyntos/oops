import { Styles } from "../../../../../utils/Styles";
import { Group } from "../GroupsSection";

type GroupCardProps = {
  group: Group;
};

export const GroupCard = ({ group }: GroupCardProps) => {
  return (
    <div style={styles.card}>
      <div>{group.groupName}</div>
      <div>
        {group.userGroups.map((student, index) => (
          <div>
            {index + 1}. {student.user.fullName}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Styles = {
  card: {
    padding: 12,
    border: "1px solid black",
  },
};
