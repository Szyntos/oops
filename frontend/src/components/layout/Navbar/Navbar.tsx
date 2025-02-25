import { useLocation, useNavigate } from "react-router-dom";
import { getNavigationItems, pathsGenerator } from "../../../router/paths";
import { Styles } from "../../../utils/Styles";
import { useEditionSelection } from "../../../hooks/common/useEditionSelection";
import { useUser } from "../../../hooks/common/useUser";
import { hasRole, isEditionActive } from "../../../utils/utils";
import { useLogin } from "../../../hooks/auth/useLogin";
import { UsersRolesType } from "../../../__generated__/schema.graphql.types";
import { useChests } from "../../../hooks/chest/useChests";
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
import { CustomDialog } from "../../dialogs/CustomDialog";
import Logo from "../../../assets/logo.svg";

const NAV_BAR_HEIGHT = 64;
const BORDER_HEIGHT = 2;
export const NAV_BAR_HEIGHT_WITH_BORDER = NAV_BAR_HEIGHT + BORDER_HEIGHT;

const LOGO_HEIGHT = 64 - 24;

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

  const getRole = () => {
    switch (user.role) {
      case UsersRolesType.Coordinator:
        return "coordinator";
      case UsersRolesType.Student:
        return "student";
      default:
        return "teacher";
    }
  };

  const navigationItems = getNavigationItems(getRole());

  const handleLogoClick = () => {
    switch (user.role) {
      case UsersRolesType.Student:
        navigate(pathsGenerator.student.StudentProfile);
        break;
      case UsersRolesType.Coordinator:
      case UsersRolesType.Teacher:
        navigate(pathsGenerator.teacher.Groups);
        break;
      default:
        navigate(pathsGenerator.common.Welcome);
        break;
    }
    return;
  };

  return (
    <div style={navbarStyles.navbar}>
      <div style={navbarStyles.itemsContainer}>
        <div style={navbarStyles.leftItemsContainer}>
          {user.avatarSetByUser &&
            user.avatarSetByUser &&
            navigationItems
              .filter((item) => hasRole(user, item.allowedRoles))
              .map((item) => (
                <NavbarItem
                  onClick={() => navigate(item.path)}
                  title={item.title}
                  isActive={item.path === location.pathname}
                />
              ))}
        </div>
      </div>

      <div style={navbarStyles.logo}>
        <img
          src={Logo}
          alt="logo"
          style={{ height: LOGO_HEIGHT, cursor: "pointer" }}
          onClick={handleLogoClick}
        />
      </div>

      <div style={navbarStyles.itemsContainer}>
        <div style={navbarStyles.rightItemsContainer}>
          {/* logged in user items */}
          {user.role !== UsersRolesType.UnauthenticatedUser && (
            <>
              <NavbarItem
                title={
                  selectedEdition
                    ? `${selectedEdition.name}${isEditionActive(selectedEdition.startDate, selectedEdition.endDate) ? "" : " [not active]"}`
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
              {editions.length > 1 && (
                <IconMapper onClick={openSettings} icon="settings" />
              )}
              <IconMapper onClick={async () => await logout()} icon="logout" />
            </>
          )}
        </div>
      </div>

      <CustomDialog
        isOpen={isChestDialogOpen}
        title="Otwórz skrzynkę"
        subtitle={chestsToOpen[0]?.chest.type}
        onCloseClick={closeChestDialog}
      >
        <OpenChest
          chest={chestsToOpen.length > 0 ? chestsToOpen[0] : undefined}
          handleOpenChestClick={handleOpenChestConfirm}
          chestError={chestError}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={AreSettingsOpen}
        onCloseClick={closeSettings}
        title="Ustawienia"
      >
        <Settings
          editions={editions}
          handleChangeEditionConfirm={handleChangeEditionConfirm}
        />
      </CustomDialog>

      <ConfirmPopupDialog />
      <ChangeGroupDialog />
      <OverrideGradeDialog />
    </div>
  );
};

export const navbarStyles: Styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    paddingRight: tokens.padding.xl,
    paddingLeft: tokens.padding.xl,
    height: NAV_BAR_HEIGHT,
    backgroundColor: tokens.color.card.dark,
    borderBottom: `${BORDER_HEIGHT}px solid ${tokens.color.text.secondary}`,
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  itemsContainer: {
    display: "flex",
    alignItems: "center",
    flex: 1,
  },
  leftItemsContainer: {
    gap: tokens.padding.l,
    display: "flex",
  },
  rightItemsContainer: {
    flex: 1,
    gap: tokens.padding.m,
    display: "flex",
    justifyContent: "end",
  },
  logo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
};
