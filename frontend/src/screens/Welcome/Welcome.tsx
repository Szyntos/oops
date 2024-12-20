import { useAllUsersQuery } from "../../graphql/allUsers.graphql.types";
import { useUser } from "../../hooks/common/useUser";
import { Styles } from "../../utils/Styles";
import { LoginForm } from "../../components/Welcome/LoginForm";
import { SelectedUserInfo } from "../../components/Welcome/SelectedUserInfo";
import { UsersListWithFilter } from "../../components/Welcome/UsersListWithFilter/UsersListWithFilter";
import { useLogin } from "../../hooks/auth/useLogin";

export const Welcome = () => {
  const { user: selectedUser } = useUser();
  const { loading, error, data } = useAllUsersQuery();

  const { loginWithUserSelect } = useLogin();

  if (loading) return <div>Ładowanie...</div>;
  if (error) return <div>Błąd podczas ładowania użytkowników.</div>;

  return (
    <div style={styles.screenContainer}>
      <div style={styles.leftSectionContainer}>
        <h1>Witaj!</h1>
        <UsersListWithFilter
          data={data}
          handleUserSelect={loginWithUserSelect}
        />
      </div>

      <div style={styles.rightSectionContainer}>
        <SelectedUserInfo user={selectedUser} />
        <LoginForm />
      </div>
    </div>
  );
};

const styles: Styles = {
  screenContainer: {
    display: "flex",
    flexDirection: "row",
  },
  leftSectionContainer: {
    flex: 1,
  },
  rightSectionContainer: {
    margin: 20,
    flex: 1,
  },
  container: {
    display: "flex",
    flexDirection: "row",
  },
  userList: {
    flex: 1,
  },
  searchInput: {
    marginBottom: "10px",
    padding: "8px",
    width: "100%",
    boxSizing: "border-box",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableRow: {
    cursor: "pointer",
  },
  selectedUser: {
    flex: 1,
    marginLeft: "20px",
  },
  loginForm: {
    marginTop: "20px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
  },
};
