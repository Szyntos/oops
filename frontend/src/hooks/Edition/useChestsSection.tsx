import { useState } from "react";

import { useSetupChestEditionAddMutation } from "../../graphql/setupChestEditionAdd.graphql.types";
import { useSetupChestEditionRemoveMutation } from "../../graphql/setupChestEditionRemove.graphql.types";

import { useSetupChestEditMutation } from "../../graphql/setupChestEdit.graphql.types";
import { useError } from "../common/useGlobalError";
import { useFilesQuery } from "../../graphql/files.graphql.types";
import { useDeleteChestMutation } from "../../graphql/deleteChest.graphql.types";
import { useCopyChestMutation } from "../../graphql/copyChest.graphql.types";
import {
  SetupChestsQuery,
  useSetupChestsQuery,
} from "../../graphql/setupChests.graphql.types";
import { ChestFormValues } from "../../components/Edition/Sections/ChestsSection/AddChestForm/AddChestForm";
import { useAwardsSection } from "./useAwardsSection";
import { useSetupChestCreateMutation } from "../../graphql/setupChestCreate.graphql.types";

export type Chest = SetupChestsQuery["chests"][number];

export const useChestsSection = (editionId: number) => {
  const { globalErrorWrapper, localErrorWrapper } = useError();

  const {
    data,
    loading: chestsLoading,
    error: chestsError,
    refetch,
  } = useSetupChestsQuery();

  const {
    data: imageData,
    loading: imageLoading,
    error: imageError,
  } = useFilesQuery({ variables: { paths: ["image/chest"] } });

  const imageIds: string[] =
    imageData?.getFilesGroupedByTypeBySelectedTypes.flatMap((i) =>
      i.files.map((f) => f.fileId),
    ) ?? [];

  const {
    awards,
    selectedAwards,
    loading: awardsLoading,
    error: awardsError,
  } = useAwardsSection(editionId);

  const chests: Chest[] = data?.chests ?? [];

  const selectedChests: Chest[] = chests.filter((c) =>
    c.chestEditions.some((e) => e.editionId === editionId.toString()),
  );

  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [selectedChest, setSelectedChest] = useState<Chest | undefined>(
    undefined,
  );

  // ADD CHEST

  const [isAddChest, setIsAddChest] = useState(false);
  const openAddChest = () => {
    setIsAddChest(true);
  };
  const closeAddChest = () => {
    setIsAddChest(false);
    setFormError(undefined);
  };

  const [createChest] = useSetupChestCreateMutation();
  const handleAddChest = async (values: ChestFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await createChest({
        variables: {
          awardIds: values.awardThisEditionIds.map((id) => parseInt(id)),
          awardBundleCount: values.awardBundleCount,
          fileId: parseInt(values.fileId),
          // NOTE: chest type is name xd
          chestType: values.name,
        },
      });
      refetch();
      closeAddChest();
    });
  };

  const [addChest] = useSetupChestEditionAddMutation();
  const [removeChest] = useSetupChestEditionRemoveMutation();
  const handleSelectChest = async (chest: Chest) => {
    const isChestSelected = selectedChests.some(
      (c) => c.chestId === chest.chestId,
    );
    const variables = {
      editionId,
      chestId: parseInt(chest.chestId),
    };
    globalErrorWrapper(async () => {
      isChestSelected
        ? await removeChest({ variables })
        : await addChest({ variables });
      refetch();
    });
  };

  // EDIT CHEST
  const [isEditChest, setIsEditChest] = useState(false);
  const openEditChest = (chest: Chest) => {
    setSelectedChest(chest);
    setIsEditChest(true);
  };
  const closeEditChest = () => {
    setIsEditChest(false);
    setSelectedChest(undefined);
    setFormError(undefined);
  };

  const [editChest] = useSetupChestEditMutation();
  const handleEditChest = (values: ChestFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await editChest({
        variables: {
          awardIds: [
            ...values.awardThisEditionIds.map((id) => parseInt(id)),
            ...values.awardNotThisEditionIds.map((id) => parseInt(id)),
          ],
          chestId: parseInt(selectedChest?.chestId as string),
          awardBundleCount: values.awardBundleCount,
          fileId: parseInt(values.fileId),
          // NOTE: chest type is name xd
          chestType: values.name,
        },
      });
      refetch();
      closeEditChest();
    });
  };

  // DELETE CHEST
  const [deleteChest] = useDeleteChestMutation();
  const handleDeleteChest = (chest: Chest) => {
    globalErrorWrapper(async () => {
      await deleteChest({
        variables: {
          chestId: parseInt(chest.chestId),
        },
      });
      refetch();
    });
  };

  // COPY CHEST
  const [copyChest] = useCopyChestMutation();
  const handleCopyChest = (Chest: Chest) => {
    globalErrorWrapper(async () => {
      await copyChest({
        variables: {
          chestId: parseInt(Chest.chestId),
        },
      });
      refetch();
    });
  };

  return {
    awards,
    chests,
    selectedChests,
    selectedAwards,
    imageIds,
    loading: chestsLoading || imageLoading || awardsLoading,
    error: chestsError || imageError || awardsError,

    handleSelectChest,
    formError,

    isAddChest,
    closeAddChest,
    openAddChest,
    handleAddChest,

    isEditChest,
    openEditChest,
    closeEditChest,
    handleEditChest,

    selectedChest,

    handleDeleteChest,
    handleCopyChest,
  };
};
