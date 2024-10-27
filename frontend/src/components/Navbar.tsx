import { useLocation, useNavigate } from "react-router-dom";
import { navigationItems } from "../router/paths";
import { Styles } from "../utils/Styles";
import { useEditionSelection } from "../hooks/common/useEditionSelection";
import { useUser } from "../hooks/common/useUser";
import { hasRole, isEditionActive } from "../utils/utils";
import { useLogin } from "../hooks/auth/useLogin";
import { UsersRolesType } from "../__generated__/schema.graphql.types";

export const NAV_BAR_HEIGHT = 52;

export const Navbar = () => {
  const navigate = useNavigate();
  const { selectedEdition } = useEditionSelection();
  const { user } = useUser();
  const { logout } = useLogin();
  const location = useLocation();

  return (
    <div style={styles.container}>
      <div style={styles.itemsContainer}>
        {navigationItems
          .filter((item) => hasRole(user, item.allowedRoles))
          .map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navbarItem,
                backgroundColor: item.path === location.pathname ? "#ddd" : "",
              }}
            >
              {item.title}
            </div>
          ))}
      </div>

      {selectedEdition ? (
        <div style={styles.editionName}>
          edition: {selectedEdition.editionId},{" "}
          {isEditionActive(selectedEdition) ? "active" : "not active"}
        </div>
      ) : (
        <div>no edition selected</div>
      )}

      {user.role !== UsersRolesType.UnauthenticatedUser && (
        <div onClick={async () => await logout()} style={styles.navbarItem}>
          Logout
        </div>
      )}
    </div>
  );
};

const styles: Styles = {
  container: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid black",
    height: NAV_BAR_HEIGHT,
    justifyContent: "space-between",
  },
  navbarItem: {
    border: "1px solid black",
    padding: 12,
    cursor: "pointer",
  },
  editionName: {
    marginLeft: "auto",
    padding: 12,
  },
  itemsContainer: {
    display: "flex",
    flexDirection: "row",
  },
};
