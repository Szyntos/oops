import { Styles } from "../../../../../utils/Styles";
import { Group } from "../GroupsSection";

type GroupCardProps = {
  group: Group;
  editClick: () => void;
  deleteClick: () => void;
};

export const GroupCard = ({
  group,
  editClick,
  deleteClick,
}: GroupCardProps) => {
  return (
    <div style={styles.card}>
      <div>{group.generatedName}</div>
      <div>
        {group.userGroups.map((student, index) => (
          <div>
            {index + 1}. {student.user.fullName}
          </div>
        ))}
      </div>
      <button onClick={editClick}>edit</button>
      <button onClick={deleteClick}>delete</button>
    </div>
  );
};

const styles: Styles = {
  card: {
    padding: 12,
    border: "1px solid black",
  },
};
