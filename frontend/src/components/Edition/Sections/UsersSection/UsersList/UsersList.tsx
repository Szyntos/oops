import { User } from "../../../../../hooks/Edition/users/useUsersSection";
import { Styles } from "../../../../../utils/Styles";
import { UserCard } from "./UserCard";

type UsersListProps = {
  users: User[];
  title: string;
  handleDeleteClick: (user: User) => void;
  handleEditClick: (user: User) => void;
};

export const UsersList = ({
  users,
  title,
  handleDeleteClick,
  handleEditClick,
}: UsersListProps) => {
  return (
    <div style={styles.wrap}>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {users.map((user) => (
          <UserCard
            user={user}
            handleDeleteClick={() => handleDeleteClick(user)}
            handleEditClick={() => handleEditClick(user)}
          />
        ))}
      </div>
    </div>
  );
};

const styles: Styles = {
  wrap: {
    margin: 10,
    display: "flex",
    flexDirection: "column",
  },
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
