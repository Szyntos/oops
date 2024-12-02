import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { User } from "../../../../../hooks/Edition/users/useUsersSection";
import { Styles } from "../../../../../utils/Styles";
import { SetupButtons } from "../../SetupButtons";

type GroupCardProps = {
  user: User;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleStudentActiveness?: (user: User) => void;
};

export const UserCard = ({
  user,
  handleDeleteClick,
  handleEditClick,
  handleStudentActiveness,
}: GroupCardProps) => {
  const { openShowDialog } = useEditionSections();

  return (
    <div style={styles.card}>
      <div>
        [{user.user.userId}] {user.user.firstName} {user.user.secondName}
      </div>
      {handleStudentActiveness ? (
        <SetupButtons
          permissions={user.permissions}
          handleDelete={handleDeleteClick}
          handleEdit={handleEditClick}
          isStudentActive={user.user.active}
          handleMarkChestActiveness={() => handleStudentActiveness(user)}
        />
      ) : (
        <SetupButtons
          permissions={user.permissions}
          handleDelete={handleDeleteClick}
          handleEdit={handleEditClick}
          handleShow={() => openShowDialog(user)}
        />
      )}
    </div>
  );
};

const styles: Styles = {
  card: {
    padding: 12,
    border: "1px solid black",
    width: 160,
  },
};
