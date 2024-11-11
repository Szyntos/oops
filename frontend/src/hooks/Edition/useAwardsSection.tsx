import { useState } from "react";

import {
  SetupAwardsQuery,
  useSetupAwardsQuery,
} from "../../graphql/setupAwards.graphql.types";
import { useSetupAwardCreateMutation } from "../../graphql/setupAwardCreate.graphql.types";
import { useSetupAwardEditionAddMutation } from "../../graphql/setupAwardEditionAdd.graphql.types";
import { useSetupAwardEditionRemoveMutation } from "../../graphql/setupAwardEditionRemove.graphql.types";
import { AwardFormValues } from "../../components/Edition/Sections/AwardsSection/AddAwardForm/AddAwardForm";
import { useCategoriesSection } from "./categories/useCategoriesSection";
import { useSetupAwardEditMutation } from "../../graphql/setupAwardEdit.graphql.types";
import { useError } from "../common/useGlobalError";
import { useFilesQuery } from "../../graphql/files.graphql.types";
import { useDeleteAwardMutation } from "../../graphql/deleteAward.graphql.types";
import { useCopyAwardMutation } from "../../graphql/copyAward.graphql.types";

export type Award = SetupAwardsQuery["listSetupAwards"][number];

export const useAwardsSection = (editionId: number) => {
  const { globalErrorWrapper, localErrorWrapper } = useError();

  const {
    selectedCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesSection(editionId);

  const {
    data,
    loading: awardsLoading,
    error: awardsError,
    refetch,
  } = useSetupAwardsQuery({ variables: { editionId } });

  const {
    data: imageData,
    loading: imageLoading,
    error: imageError,
  } = useFilesQuery({ variables: { paths: ["image/award"] } });

  const imageIds: string[] =
    imageData?.getFilesGroupedByTypeBySelectedTypes.flatMap((i) =>
      i.files.map((f) => f.fileId),
    ) ?? [];

  const awards: Award[] = data?.listSetupAwards ?? [];

  const selectedAwards: Award[] = awards.filter((a) =>
    a.award.awardEditions.some(
      (e) => e.edition.editionId === editionId.toString(),
    ),
  );

  const [formError, setFormError] = useState<string | undefined>(undefined);
  const [selectedAward, setSelectedAward] = useState<Award | undefined>(
    undefined,
  );

  // ADD AWARD
  const [isAddAward, setIsAddAward] = useState(false);
  const openAddAward = () => {
    setIsAddAward(true);
  };
  const closeAddAward = () => {
    setIsAddAward(false);
    setFormError(undefined);
  };

  const [createAward] = useSetupAwardCreateMutation();
  const handleAddAward = async (values: AwardFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await createAward({
        variables: {
          ...values,
          categoryId: parseInt(values.categoryId),
          fileId: parseInt(values.imageId ?? "-1"),
          label: "",
        },
      });
      refetch();
      closeAddAward();
    });
  };

  const [addAward] = useSetupAwardEditionAddMutation();
  const [removeAward] = useSetupAwardEditionRemoveMutation();
  const handleSelectAward = async (award: Award) => {
    const isAwardSelected = selectedAwards.some(
      (a) => a.award.awardId === award.award.awardId,
    );
    const variables = {
      editionId,
      awardId: parseInt(award.award.awardId),
    };
    globalErrorWrapper(async () => {
      isAwardSelected
        ? await removeAward({ variables })
        : await addAward({ variables });
      refetch();
    });
  };

  // EDIT AWARD
  const [isEditAward, setIsEditAward] = useState(false);
  const openEditAward = (award: Award) => {
    setSelectedAward(award);
    setIsEditAward(true);
  };
  const closeEditAward = () => {
    setIsEditAward(false);
    setSelectedAward(undefined);
    setFormError(undefined);
  };

  const [editAward] = useSetupAwardEditMutation();
  const handleEditAward = (values: AwardFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await editAward({
        variables: {
          ...values,
          awardId: parseInt(selectedAward?.award.awardId ?? "-1"),
          categoryId: parseInt(values.categoryId),
          fileId: parseInt(values.imageId ?? "-1"),
        },
      });
      refetch();
      closeEditAward();
    });
  };

  // DELETE
  const [deleteAward] = useDeleteAwardMutation();
  const handleDeleteAward = (award: Award) => {
    globalErrorWrapper(async () => {
      await deleteAward({
        variables: {
          awardId: parseInt(award.award.awardId),
        },
      });
      refetch();
    });
  };

  // COPY
  const [copyAward] = useCopyAwardMutation();
  const handleCopyAward = (award: Award) => {
    globalErrorWrapper(async () => {
      await copyAward({
        variables: {
          awardId: parseInt(award.award.awardId),
        },
      });
      refetch();
    });
  };

  return {
    awards,
    selectedAwards,
    formCategories: selectedCategories,
    imageIds,
    loading: awardsLoading || categoriesLoading || imageLoading,
    error: awardsError || categoriesError || imageError,

    handleSelectAward,
    formError,

    isAddAward,
    closeAddAward,
    openAddAward,
    handleAddAward,

    isEditAward,
    openEditAward,
    closeEditAward,
    handleEditAward,

    selectedAward,

    handleDeleteAward,
    handleCopyAward,
  };

  // TODO maybe section handles - edit, select, copy, delete should be returned in one object
};
