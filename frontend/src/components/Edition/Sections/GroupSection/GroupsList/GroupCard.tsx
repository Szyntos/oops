import { Group } from "../../../../../hooks/Edition/useGroupsSection";
import { Styles } from "../../../../../utils/Styles";
import { SetupButtons } from "../../SetupButtons";

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
      <div>{group.group.generatedName}</div>
      <div>
        {group.group.userGroups.map((student, index) => (
          <div>
            {index + 1}. {student.user.firstName} {student.user.secondName}
          </div>
        ))}
      </div>
      <SetupButtons
        permissions={group.permissions}
        handleEdit={editClick}
        handleDelete={deleteClick}
      />
    </div>
  );
};

const styles: Styles = {
  card: {
    padding: 12,
    border: "1px solid black",
  },
};
