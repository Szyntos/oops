import { useLocation, useNavigate } from "react-router-dom";
import { navigationItems } from "../../../router/paths";
import { Styles } from "../../../utils/Styles";
import { useEditionSelection } from "../../../hooks/common/useEditionSelection";
import { useUser } from "../../../hooks/common/useUser";
import { hasRole, isEditionActive } from "../../../utils/utils";
import { useLogin } from "../../../hooks/auth/useLogin";
import { UsersRolesType } from "../../../__generated__/schema.graphql.types";
import { useChests } from "../../../hooks/chest/useChests";
import { Dialog } from "@mui/material";
import { CloseHeader } from "../../dialogs/CloseHeader";
import { OpenChest } from "../../OpenChest";
import { Settings } from "../../Settings/Settings";
import { useSettings } from "../../../hooks/useSettings";
import { ChangeGroupDialog } from "../../dialogs/ChangeGroupDialog/ChangeGroupDialog";
import { ConfirmPopupDialog } from "../../dialogs/ConfirmPopupDialog/ConfirmPopupDialog";
import { OverrideGradeDialog } from "../../dialogs/OverrideGradeDialog/OverrideGradeDialog";
import { tokens } from "../../../tokens";
import { NavbarItem } from "./NavarItem";
import { IconMapper } from "../../IconMapper";
import { ChestsNavbarItem } from "./ChestsNavbarItem";

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
    <div style={styles.navbar}>
      <div style={styles.itemsContainer}>
        {navigationItems
          .filter((item) => hasRole(user, item.allowedRoles))
          .map((item) => (
            <NavbarItem
              onClick={() => navigate(item.path)}
              title={item.title}
              isActive={item.path === location.pathname}
            />
          ))}
      </div>

      <div style={styles.itemsContainer}>
        {/* logged in user items */}
        {user.role !== UsersRolesType.UnauthenticatedUser && (
          <>
            <NavbarItem
              color={tokens.color.accent.light}
              title={
                selectedEdition
                  ? `${selectedEdition.name}${isEditionActive(selectedEdition) ? "" : " [not active]"}`
                  : "no edition selected"
              }
            />
            {/* student items */}
            {user.role === UsersRolesType.Student && (
              <ChestsNavbarItem
                quantity={chestsToOpen.length}
                onClick={openChestDialog}
              />
            )}
            <IconMapper onClick={async () => await logout()} icon="logout" />
            {editions.length > 1 && (
              <IconMapper onClick={openSettings} icon="settings" />
            )}
          </>
        )}
      </div>

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
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    paddingRight: tokens.padding.xl,
    paddingLeft: tokens.padding.xl,
    minHeight: NAV_BAR_HEIGHT,
    backgroundColor: tokens.color.card.blue,
    borderBottom: `1px solid ${tokens.color.accent.dark}`,
  },
  itemsContainer: {
    display: "flex",
    gap: tokens.padding.l,
    alignItems: "center",
  },
  editionName: {
    marginLeft: "auto",
    padding: 12,
  },
};
