import { User } from "../../../../../hooks/Edition/users/useUsersSection";
import { Styles } from "../../../../../utils/Styles";

type GroupCardProps = {
  user: User;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
};

export const UserCard = ({
  user,
  handleDeleteClick,
  handleEditClick,
}: GroupCardProps) => {
  return (
    <div style={styles.card}>
      <div>
        [{user.userId}] {user?.fullName}
      </div>
      <button onClick={handleEditClick}>edit</button>
      <button onClick={handleDeleteClick}>delete</button>
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
