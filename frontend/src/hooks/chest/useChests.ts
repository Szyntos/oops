import { useEffect, useState } from "react";
import { useUser } from "../common/useUser";
import {
  ChestsToOpenQuery,
  useChestsToOpenQuery,
} from "../../graphql/chestsToOpen.graphql.types";
import { useSubscribeChestToOpenSubscription } from "../../graphql/subscribeChestToOpen.graphql.types";
import { useSelectAwardFromChestMutation } from "../../graphql/selectAwardFromChest.graphql.types";
import { useError } from "../common/useGlobalError";
import { useApolloClient } from "@apollo/client";

export type Chest =
  ChestsToOpenQuery["users"][number]["chestHistories"][number];

// probably refetch will not be needed when subscription works
export const useChests = () => {
  const { user } = useUser();
  const client = useApolloClient();
  const { localErrorWrapper } = useError();

  const { data, refetch } = useChestsToOpenQuery({
    variables: { userId: user.userId },
  });

  const { data: subscribeData } = useSubscribeChestToOpenSubscription({
    variables: { userId: user.userId },
  });

  useEffect(() => {
    console.log("SUBSCRIPTION FIRED");
    refetch();
  }, [refetch, subscribeData]);

  const chestsToOpen: Chest[] = data?.users[0].chestHistories ?? [];

  // OPEN
  const [chestError, setChestError] = useState<string | undefined>(undefined);

  const [isChestDialogOpen, setIsChestDialogOpen] = useState(false);
  const openChestDialog = () => {
    setIsChestDialogOpen(true);
  };
  const closeChestDialog = () => {
    setIsChestDialogOpen(false);
    setChestError(undefined);
  };

  const [selectAwards] = useSelectAwardFromChestMutation();
  const handleOpenChestConfirm = async (
    awardIds: string[],
    chestHistoryId: string,
  ) => {
    localErrorWrapper(setChestError, async () => {
      await selectAwards({
        variables: {
          awardIds: awardIds.map((a) => parseInt(a)),
          chestHistoryId: parseInt(chestHistoryId),
        },
      });
      await client.refetchQueries({
        include: "active",
      });
      closeChestDialog();
    });
  };

  return {
    chestsToOpen,
    isChestDialogOpen,
    openChestDialog,
    closeChestDialog,
    handleOpenChestConfirm,
    chestError,
  };
};
