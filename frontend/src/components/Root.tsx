import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Styles } from "../utils/Styles";
import { Button } from "./Button";
import { Dialog } from "@mui/material";
import { CloseHeader } from "./dialogs/CloseHeader";
import { ChestsToOpenQuery } from "../graphql/chestsToOpen.graphql.types";
import { useUser } from "../hooks/common/useUser";
import { UsersRolesType } from "../__generated__/schema.graphql.types";
import { OpenChest } from "./OpenChest";
import { useChests } from "../hooks/chest/useChests";

export type Chest =
  ChestsToOpenQuery["users"][number]["chestHistories"][number];

export const Root = () => {
  const { user } = useUser();

  const {
    chestsToOpen,
    isChestDialogOpen,
    openChestDialog,
    closeChestDialog,
    handleOpenChestConfirm,
    chestError,
  } = useChests();

  return (
    <div style={styles.screenContainer}>
      <Navbar />
      {user.role === UsersRolesType.Student && (
        <Button color={"pink"} onClick={openChestDialog}>
          open chests
        </Button>
      )}
      <div>
        <Dialog open={isChestDialogOpen}>
          <CloseHeader onCloseClick={closeChestDialog} />
          <OpenChest
            chest={chestsToOpen[0]}
            handleOpenChestClick={handleOpenChestConfirm}
            chestError={chestError}
          />
        </Dialog>
        <Outlet />
      </div>
    </div>
  );
};

const styles: Styles = {
  screenContainer: {
    width: "100%",
    minHeight: "100vh",
  },
};
