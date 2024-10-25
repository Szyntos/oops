import { useState } from "react";

import {
  ChestsQuery,
  useChestsQuery,
} from "../../graphql/chests.graphql.types";
import { useAddChestToUserMutation } from "../../graphql/addChestToUser.graphql.types";
import { useEditionSelection } from "../common/useEditionSelection";

export type Chest = ChestsQuery["chests"][number];

export const useCoordinatorActions = (studentId: string, teacherId: string) => {
  const { selectedEdition } = useEditionSelection();
  const editionId = selectedEdition?.editionId;

  const { data, loading, error } = useChestsQuery({
    variables: { editionId: editionId as string },
    skip: !editionId,
  });

  const chests: Chest[] = data?.chests ?? [];

  const [addChestToUser] = useAddChestToUserMutation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openAddDialog = () => {
    setIsDialogOpen(true);
  };
  const closeAddDialog = () => {
    setIsDialogOpen(false);
  };

  const handleAddChestConfirmation = async (formProps: {
    subcategoryId: string;
    chestId: string;
  }) => {
    try {
      await addChestToUser({
        variables: {
          teacherId: parseInt(teacherId),
          userId: parseInt(studentId),
          chestId: parseInt(formProps.chestId),
          subcategoryId: parseInt(formProps.subcategoryId),
        },
      });

      closeAddDialog();
    } catch (error) {
      console.log("error: ", error);
    }
  };

  return {
    chests,
    loading,
    error,
    isDialogOpen,
    openAddDialog,
    closeAddDialog,
    handleAddChestConfirmation,
  };
};
