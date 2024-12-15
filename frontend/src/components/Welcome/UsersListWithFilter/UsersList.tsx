import { Styles } from "../../../utils/Styles";
import { UserFromList } from "./UsersListWithFilter";

type UsersListProps = {
  users: UserFromList[];
  handleUserClick: (user: UserFromList) => void;
};

export const UsersList = ({ users, handleUserClick }: UsersListProps) => {
  const getRoleColorStyle = (user: UserFromList) => {
    let color = "black";
    if (user.role === "teacher") {
      color = "red";
    }
    if (user.role === "coordinator") {
      color = "green";
    }
    return { color };
  };

  return (
    <table style={styles.table}>
      <thead>
        <tr>
          <th>Nick</th>
          <th>Rola</th>
          <th>ID użytkownika</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr
            key={user.userId}
            onClick={() => handleUserClick(user)}
            style={styles.tableRow}
          >
            <td style={getRoleColorStyle(user)}>{user.nick}</td>
            <td style={getRoleColorStyle(user)}>{user.role}</td>
            <td>{user.userId}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const styles: Styles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableRow: {
    cursor: "pointer",
  },
};
