import { useState } from "react";

import {
  ChestsQuery,
  useChestsQuery,
} from "../../graphql/chests.graphql.types";
import { useAddChestToUserMutation } from "../../graphql/addChestToUser.graphql.types";
import { useEditionSelection } from "../common/useEditionSelection";
import { useError } from "../common/useGlobalError";
import { useRegenerateGradeMutation } from "../../graphql/regenerateGrade.graphql.types";
import { useConfirmPopup } from "../common/useConfirmPopup";
import { useApolloClient } from "@apollo/client";

export type Chest = ChestsQuery["chests"][number];

export const useCoordinatorActions = (studentId: string, teacherId: string) => {
  const { localErrorWrapper, globalErrorWrapper } = useError();
  const { selectedEdition } = useEditionSelection();
  const editionId = selectedEdition?.editionId;

  const { data, loading, error } = useChestsQuery({
    variables: { editionId: editionId as string },
    skip: !editionId,
  });

  const chests: Chest[] = data?.chests ?? [];

  const [formError, setFormError] = useState<string | undefined>(undefined);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openAddDialog = () => {
    setIsDialogOpen(true);
  };
  const closeAddDialog = () => {
    setFormError(undefined);
    setIsDialogOpen(false);
  };

  const [addChestToUser] = useAddChestToUserMutation();
  const handleAddChestConfirmation = async (formProps: {
    subcategoryId: string;
    chestId: string;
  }) => {
    localErrorWrapper(setFormError, async () => {
      await addChestToUser({
        variables: {
          teacherId: parseInt(teacherId),
          userId: parseInt(studentId),
          chestId: parseInt(formProps.chestId),
          subcategoryId: parseInt(formProps.subcategoryId),
        },
      });
      closeAddDialog();
    });
  };

  const client = useApolloClient();
  const { openConfirmPopup } = useConfirmPopup();
  const [regenerateGrade] = useRegenerateGradeMutation();
  const handleRegenerateGrade = (userId: string) => {
    openConfirmPopup(() => {
      globalErrorWrapper(async () => {
        await regenerateGrade({
          variables: {
            userId: parseInt(userId),
            editionId: parseInt(editionId as string),
          },
        });
        client.refetchQueries({ include: "all" });
      });
    });
  };

  return {
    chests,
    loading,
    error,
    isDialogOpen,
    openAddDialog,
    closeAddDialog,
    handleAddChestConfirmation,
    formError,
    handleRegenerateGrade,
  };
};
