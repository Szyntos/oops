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

export type Award = SetupAwardsQuery["award"][number];

export const useAwardsSection = (editionId: number) => {
  const {
    data,
    loading: awardsLoading,
    error: awardsError,
    refetch,
  } = useSetupAwardsQuery();

  const {
    selectedCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesSection(editionId);

  const awards: Award[] = data?.award ?? [];

  const selectedAwards: Award[] = awards.filter((a) => {
    const found = a.awardEditions.find(
      (edition) => edition.editionId === editionId.toString(),
    );
    return found !== undefined;
  });

  const [formError, setFormError] = useState<string | undefined>(undefined);

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
    errorWrapper(async () => {
      await createAward({
        variables: {
          awardName: values.awardName,
          awardType: values.awardType,
          awardValue: values.awardValue,
          categoryId: parseInt(values.categoryId),
          description: values.description,
          maxUsages: values.maxUsages,
          label: "",
          fileId: values.imageId,
        },
      });

      refetch();
      closeAddAward();
    });
  };

  const [addAward] = useSetupAwardEditionAddMutation();
  const [removeAward] = useSetupAwardEditionRemoveMutation();
  const handleSelectAward = async (award: Award) => {
    const isAwardSelected = !!selectedAwards.find((a) => {
      return a.awardId === award.awardId;
    });

    const variables = {
      variables: {
        editionId,
        awardId: parseInt(award.awardId),
      },
    };

    try {
      // TODO add some kind of global error
      if (isAwardSelected) {
        await removeAward(variables);
      } else {
        await addAward(variables);
      }
      refetch();
    } catch (error) {
      console.error(error);
    }
  };

  const [isEditAward, setIsEditAward] = useState(false);
  const [selectedAward, setSelectedAward] = useState<Award | undefined>(
    undefined,
  );
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
    errorWrapper(async () => {
      await editAward({
        variables: {
          awardId: parseInt(selectedAward?.awardId ?? "-1"),
          awardName: values.awardName,
          awardType: values.awardType,
          awardValue: values.awardValue,
          categoryId: parseInt(values.categoryId),
          description: values.description,
          maxUsages: values.maxUsages,
          fileId: values.imageId,
        },
      });
      refetch();
      closeEditAward();
    });
  };

  const errorWrapper = (foo: () => void) => {
    try {
      foo();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unexpected error received.",
      );
    }
  };

  return {
    awards,
    selectedAwards,
    formCategories: selectedCategories,
    loading: awardsLoading || categoriesLoading,
    error: awardsError || categoriesError,

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
  };
};
