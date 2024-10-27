import { User } from "../../../../../hooks/Edition/useUsersSection";
import { Styles } from "../../../../../utils/Styles";
import { UserCard } from "./UserCard";

type UsersListProps = {
  users: User[];
  title: string;
};

export const UsersList = ({ users, title }: UsersListProps) => {
  return (
    <div style={styles.wrap}>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {users.map((u) => (
          <UserCard user={u} />
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
