import { useEffect, useState } from "react";
import { Styles } from "../../../utils/Styles";
import { UsersList } from "./UsersList";
import { AllUsersQuery } from "../../../graphql/allUsers.graphql.types";

export type UserFromList = AllUsersQuery["users"][number];

type UsersListWithFilterProps = {
  data: AllUsersQuery | undefined;
  handleUserSelect: (user: UserFromList) => void;
};

export const UsersListWithFilter = ({
  data,
  handleUserSelect,
}: UsersListWithFilterProps) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredUsers, setFilteredUsers] = useState<UserFromList[]>([]);

  useEffect(() => {
    if (data) {
      setFilteredUsers(
        data.users.filter((user) =>
          user.nick.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
    }
  }, [searchTerm, data]);

  return (
    <div>
      <input
        type="text"
        placeholder="Wyszukaj studentów"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={styles.searchInput}
      />
      <UsersList
        users={filteredUsers}
        handleUserClick={(user: UserFromList) => handleUserSelect(user)}
      />
    </div>
  );
};

const styles: Styles = {
  searchInput: {
    marginBottom: "10px",
    padding: "8px",
    width: "100%",
    boxSizing: "border-box",
  },
};
