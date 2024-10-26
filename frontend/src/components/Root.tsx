import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Styles } from "../utils/Styles";
import { Button } from "./Button";
import { useEffect, useState } from "react";
import { Dialog } from "@mui/material";
import { CloseHeader } from "./dialogs/CloseHeader";
import {
  ChestsToOpenQuery,
  useChestsToOpenQuery,
} from "../graphql/chestsToOpen.graphql.types";
import { useUser } from "../hooks/common/useUser";
import { UsersRolesType } from "../__generated__/schema.graphql.types";
import { useSelectAwardFromChestMutation } from "../graphql/selectAwardFromChest.graphql.types";
import { useSubscribeChestToOpenSubscription } from "../graphql/subscribeChestToOpen.graphql.types";

export type Chest =
  ChestsToOpenQuery["users"][number]["chestHistories"][number];

export const Root = () => {
  const { user } = useUser();

  const [isOpen, setIsOpen] = useState(false);
  const { data, refetch } = useChestsToOpenQuery({
    variables: { userId: user.userId },
  });

  const { data: subscribeData } = useSubscribeChestToOpenSubscription({
    variables: { userId: user.userId },
  });

  useEffect(() => {
    console.log("SUBSCRIPTION");
    refetch();
  }, [refetch, subscribeData]);

  const chestsToOpen: Chest[] = data?.users[0].chestHistories ?? [];

  const [selectAwardFormChest] = useSelectAwardFromChestMutation();

  // if (loading) return <div>loading...</div>;
  // if (error) return <div>error: {error.message}</div>;

  const handleOpenChestClick = async (
    awardId: string,
    chestHistoryId: string,
  ) => {
    try {
      await selectAwardFormChest({
        variables: {
          awardId: parseInt(awardId),
          chestHistoryId: parseInt(chestHistoryId),
        },
      });
    } catch (error) {
      console.log("ERROR: ", error);
    }
  };

  return (
    <div style={styles.screenContainer}>
      <Navbar />
      {user.role === UsersRolesType.Student && (
        <Button color={"pink"} onClick={() => setIsOpen(true)}>
          open chests
        </Button>
      )}
      <div>
        <Dialog open={isOpen}>
          <CloseHeader onCloseClick={() => setIsOpen(false)} />

          <div style={styles.container}>
            {chestsToOpen.map((c) => (
              <div color={"pink"}>
                {`${c.chestHistoryId}, ${c.chestId} ${c.opened ? "opened" : "to open"}`}
                <div style={styles.awardsContainer}>
                  {c.chest.chestAwards.map((a) => (
                    <button
                      onClick={() =>
                        handleOpenChestClick(a.awardId, c.chestHistoryId)
                      }
                    >
                      {a.awardId}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
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
  awardsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
  },
  container: {
    width: 300,
    padding: 12,
  },
};
