import { useState } from "react";
import { useCategoriesSection } from "./categories/useCategoriesSection";
import { useError } from "../common/useGlobalError";
import { useLevelSetsSection } from "./useLevelSetsSection";
import { useSetupGradingChecksAddMutation } from "../../graphql/setupGradingChecksAdd.graphql.types";
import {
  SetupGradingChecksQuery,
  useSetupGradingChecksQuery,
} from "../../graphql/setupGradingChecks.graphql.types";
import { useSetupGradingChecksEditMutation } from "../../graphql/setupGradingChecksEdit.graphql.types";
import { GradingChecksFormValues } from "../../components/Edition/Sections/GradingChecksSection/ChecksForm";
import { useConfirmPopup } from "../common/useConfirmPopup";
import { useSetupGradingChecksDeleteMutation } from "../../graphql/setupGradingChecksDelete.graphql.types";
import { useQuoteVariablesQuery } from "../../graphql/quoteValues.graphql.types";

export type GradingChecks = SetupGradingChecksQuery["listSetupGradingChecks"];

export const useGradingChecksSection = (editionId: number) => {
  const { localErrorWrapper, globalErrorWrapper } = useError();

  const { data, loading, error, refetch } = useSetupGradingChecksQuery({
    variables: { editionId },
  });

  const {
    data: qData,
    loading: qLoading,
    error: qError,
    refetch: qRefetch,
  } = useQuoteVariablesQuery({
    variables: { editionId: editionId },
  });

  const gradingChecks: GradingChecks | undefined = data?.listSetupGradingChecks;

  const {
    selectedCategories,
    loading: categoriesLoading,
    error: categoriesError,
  } = useCategoriesSection(editionId);

  const {
    activeSet: selectedLevelSet,
    loading: levelsLoading,
    error: levelsError,
  } = useLevelSetsSection(editionId);

  const [formError, setFormError] = useState<string | undefined>(undefined);

  // ADD
  const [isAddOpened, setIsAddOpened] = useState(false);
  const openAdd = () => {
    setIsAddOpened(true);
  };
  const closeAdd = () => {
    setIsAddOpened(false);
    setFormError(undefined);
  };
  const [createGradingChecks] = useSetupGradingChecksAddMutation();
  const handleAdd = async (values: GradingChecksFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await createGradingChecks({
        variables: {
          editionId,
          endOfLabsDate: values.endOfLabsDate,
          endOfLabsLevelsThreshold: parseFloat(values.endOfLabsLevelsThreshold),
          projectId: parseInt(values.projectId),
          projectPointsThreshold: values.projectPointsThreshold,
        },
      });
      refetch();
      qRefetch();
      closeAdd();
    });
  };

  // EDIT
  const [isEditOpened, setIsEditOpened] = useState(false);
  const openEdit = () => {
    setIsEditOpened(true);
  };
  const closeEdit = () => {
    setIsEditOpened(false);
    setFormError(undefined);
  };

  const [editGradingChecks] = useSetupGradingChecksEditMutation();
  const handleEdit = (values: GradingChecksFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await editGradingChecks({
        variables: {
          gradingCheckId: parseInt(
            gradingChecks?.gradingCheck?.gradingCheckId as string,
          ),
          endOfLabsDate: values.endOfLabsDate,
          endOfLabsLevelsThreshold: parseFloat(values.endOfLabsLevelsThreshold),
          projectId: parseInt(values.projectId),
          projectPointsThreshold: values.projectPointsThreshold,
        },
      });
      refetch();
      qRefetch();
      closeEdit();
    });
  };

  // DELETE
  const [deleteGradingChecks] = useSetupGradingChecksDeleteMutation();
  const { openConfirmPopup } = useConfirmPopup();
  const handleDelete = () => {
    openConfirmPopup(() => {
      globalErrorWrapper(async () => {
        await deleteGradingChecks({
          variables: {
            gradingChecksId: parseInt(
              gradingChecks?.gradingCheck?.gradingCheckId as string,
            ),
          },
        });
        refetch();
        qRefetch();
      });
    });
  };

  return {
    gradingChecks,
    formCategories: selectedCategories,
    formLevels: selectedLevelSet ? selectedLevelSet.levelSet.levels : [],
    loading: loading || categoriesLoading || levelsLoading || qLoading,
    error: error || categoriesError || levelsError || qError,
    quotes: qData,

    formError,

    isAddOpened,
    closeAdd,
    openAdd,
    handleAdd,

    isEditOpened,
    openEdit,
    closeEdit,
    handleEdit,

    handleDelete,
  };
};
