import { useLocation, useNavigate } from "react-router-dom";
import { navigationItems } from "../router/paths";
import { Styles } from "../utils/Styles";
import { useEditionSelection } from "../hooks/common/useEditionSelection";
import { useUser } from "../hooks/common/useUser";
import { hasRole, isEditionActive } from "../utils/utils";
import { useLogin } from "../hooks/auth/useLogin";
import { UsersRolesType } from "../__generated__/schema.graphql.types";
import { useChests } from "../hooks/chest/useChests";
import { Dialog } from "@mui/material";
import { CloseHeader } from "./dialogs/CloseHeader";
import { OpenChest } from "./OpenChest";
import { Settings } from "./Settings/Settings";
import { useSettings } from "../hooks/useSettings";
import { ChangeGroupDialog } from "./dialogs/ChangeGroupDialog/ChangeGroupDialog";
import { ConfirmPopupDialog } from "./dialogs/ConfirmPopupDialog/ConfirmPopupDialog";
import { OverrideGradeDialog } from "./dialogs/OverrideGradeDialog/OverrideGradeDialog";

export const NAV_BAR_HEIGHT = 52;

export const Navbar = () => {
  const navigate = useNavigate();
  const { selectedEdition } = useEditionSelection();
  const { user } = useUser();
  const { logout } = useLogin();
  const location = useLocation();

  const {
    chestsToOpen,
    isChestDialogOpen,
    openChestDialog,
    closeChestDialog,
    handleOpenChestConfirm,
    chestError,
  } = useChests();

  const {
    editions,
    AreSettingsOpen,
    openSettings,
    closeSettings,
    handleChangeEditionConfirm,
  } = useSettings();

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
          Edycja: {selectedEdition.editionId},{" "}
          {isEditionActive(selectedEdition) ? "Aktywna" : "Nieaktywna"}
        </div>
      ) : (
        <div>Edycja nie jest wybrana</div>
      )}

      {user.role === UsersRolesType.Student && (
        <button disabled={chestsToOpen.length === 0} onClick={openChestDialog}>
          {chestsToOpen.length} skrzynka/i do otwarcia
        </button>
      )}

      {user.role !== UsersRolesType.UnauthenticatedUser && (
        <>
          <div onClick={async () => await logout()} style={styles.navbarItem}>
            Wyloguj się
          </div>
          <div onClick={openSettings} style={styles.navbarItem}>
            Ustawienia
          </div>
        </>
      )}

      <Dialog open={isChestDialogOpen}>
        <CloseHeader onCloseClick={closeChestDialog} />
        <OpenChest
          chest={chestsToOpen[0]}
          handleOpenChestClick={handleOpenChestConfirm}
          chestError={chestError}
        />
      </Dialog>

      <Dialog open={AreSettingsOpen}>
        <CloseHeader onCloseClick={closeSettings} />
        <Settings
          editions={editions}
          handleChangeEditionConfirm={handleChangeEditionConfirm}
        />
      </Dialog>

      <ConfirmPopupDialog />
      <ChangeGroupDialog />
      <OverrideGradeDialog />
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
