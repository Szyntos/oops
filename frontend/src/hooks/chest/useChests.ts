import { useEffect, useState } from "react";
import { useUser } from "../common/useUser";
import {
  SubscribeChestToOpenSubscription,
  useSubscribeChestToOpenSubscription,
} from "../../graphql/subscribeChestToOpen.graphql.types";
import { useSelectAwardFromChestMutation } from "../../graphql/selectAwardFromChest.graphql.types";
import { useError } from "../common/useGlobalError";
import { useApolloClient } from "@apollo/client";
import { UsersRolesType } from "../../__generated__/schema.graphql.types";

export type Chest =
  SubscribeChestToOpenSubscription["users"][number]["chestHistories"][number];

export const useChests = () => {
  const { user } = useUser();
  const client = useApolloClient();
  const { localErrorWrapper, globalErrorWrapper } = useError();

  const { data, error } = useSubscribeChestToOpenSubscription({
    variables: { userId: user.userId },
    skip: !user.userId || user.role === UsersRolesType.UnauthenticatedUser,
  });

  useEffect(() => {
    if (error) {
      globalErrorWrapper(() => {
        throw new Error(error.message);
      });
    }
  }, [globalErrorWrapper, error]);

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
