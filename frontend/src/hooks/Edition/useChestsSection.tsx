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
import { useConfirmPopup } from "../common/useConfirmPopup";
import { useActivateChestMutation } from "../../graphql/activateChest.graphql.types";
import { useDeactivateChestMutation } from "../../graphql/deactivateChest.graphql.types";
import { isChestActive } from "../../utils/utils";

export type Chest = SetupChestsQuery["listSetupChests"][number];

export const useChestsSection = (editionId: number) => {
  const { globalErrorWrapper, localErrorWrapper } = useError();

  const {
    data,
    loading: chestsLoading,
    error: chestsError,
    refetch,
  } = useSetupChestsQuery({
    variables: { editionId },
  });

  const {
    data: imageData,
    loading: imageLoading,
    error: imageError,
  } = useFilesQuery({
    variables: { paths: ["image/chest"] },
  });

  const imageIds: string[] =
    imageData?.getFilesGroupedByTypeBySelectedTypes.flatMap((i) =>
      i.files.map((f) => f.file.fileId),
    ) ?? [];

  const {
    awards,
    selectedAwards,
    loading: awardsLoading,
    error: awardsError,
  } = useAwardsSection(editionId);

  const chests: Chest[] = data?.listSetupChests ?? [];

  const selectedChests: Chest[] = chests.filter((c) =>
    c.chest.chestEdition.some(
      (e) => e?.edition.editionId === editionId.toString(),
    ),
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
      (c) => c.chest.chestId === chest.chest.chestId,
    );
    const variables = {
      editionId,
      chestId: parseInt(chest.chest.chestId),
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
          chestId: parseInt(selectedChest?.chest.chestId as string),
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
  const { openConfirmPopup } = useConfirmPopup();
  const [deleteChest] = useDeleteChestMutation();
  const handleDeleteChest = (chest: Chest) => {
    openConfirmPopup(() => {
      globalErrorWrapper(async () => {
        await deleteChest({
          variables: {
            chestId: parseInt(chest.chest.chestId),
          },
        });
        refetch();
      });
    });
  };

  // COPY CHEST
  const [copyChest] = useCopyChestMutation();
  const handleCopyChest = (chest: Chest) => {
    globalErrorWrapper(async () => {
      await copyChest({
        variables: {
          chestId: parseInt(chest.chest.chestId),
        },
      });
      refetch();
    });
  };

  // ACTIVATE / DEACTIVATE
  const [activateChest] = useActivateChestMutation();
  const [deactivateChest] = useDeactivateChestMutation();
  const handleActivateChest = (chest: Chest) => {
    globalErrorWrapper(async () => {
      const isActive = isChestActive(
        chest.chest.chestEdition.map((e) => ({
          id: e?.edition.editionId ?? "",
          active: Boolean(e?.active ?? false),
        })),
        editionId.toString(),
      );

      const variables = {
        variables: {
          chestId: parseInt(chest.chest.chestId),
          editionId: editionId,
        },
      };
      isActive
        ? await deactivateChest(variables)
        : await activateChest(variables);
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

    handleActivateChest,
  };
};
