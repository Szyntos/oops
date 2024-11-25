import { useState } from "react";
import { EditionFormValues } from "../../components/Editions/AddEditionForm";
import { useCreateEditionMutation } from "../../graphql/createEdition.graphql.types";
import { useDeleteEditionMutation } from "../../graphql/deleteEdition.graphql.types";
import { useError } from "../common/useGlobalError";
import { useCopyEditionMutation } from "../../graphql/copyEdition.graphql.types";
import { useEditEditionMutation } from "../../graphql/editEdition.graphql.types";
import {
  SetupEditionsQuery,
  useSetupEditionsQuery,
} from "../../graphql/setupEditions.graphql.types";
import { useConfirmPopup } from "../common/useConfrimPopup";

export type Edition = SetupEditionsQuery["listSetupEditions"][number];

export const useEditionsScreen = () => {
  const { localErrorWrapper, globalErrorWrapper } = useError();
  const { data, loading, error, refetch } = useSetupEditionsQuery();
  const editions: Edition[] = data?.listSetupEditions ?? [];

  const [formError, setFormError] = useState<string>();
  const [selectedEdition, setSelectedEdition] = useState<Edition | undefined>(
    undefined,
  );

  // ADD
  const [isAddOpen, setIsAddOpen] = useState(false);
  const openAddDialog = () => {
    setIsAddOpen(true);
  };
  const closeAddDialog = () => {
    setFormError(undefined);
    setIsAddOpen(false);
  };
  const [createEdition] = useCreateEditionMutation();
  const handleCreateClick = async (values: EditionFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await createEdition({
        variables: {
          editionName: values.name,
          editionYear: values.year,
        },
      });
      refetch();
      closeAddDialog();
    });
  };

  // COPY
  const [isCopyOpen, setIsCopyOpen] = useState(false);
  const openCopyDialog = (edition: Edition) => {
    setSelectedEdition(edition);
    setIsCopyOpen(true);
  };
  const closeCopyDialog = () => {
    setSelectedEdition(undefined);
    setFormError(undefined);
    setIsCopyOpen(false);
  };
  const [copyEdition] = useCopyEditionMutation();
  const handleCopyClick = async (values: EditionFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await copyEdition({
        variables: {
          editionId: parseInt(selectedEdition?.edition.editionId as string),
          editionName: values.name,
          editionYear: values.year,
        },
      });
      refetch();
      closeCopyDialog();
    });
  };

  // EDIT
  const [isEditOpen, setIsEditOpen] = useState(false);
  const openEditDialog = (edition: Edition) => {
    setSelectedEdition(edition);
    setIsEditOpen(true);
  };
  const closeEditDialog = () => {
    setSelectedEdition(undefined);
    setFormError(undefined);
    setIsEditOpen(false);
  };
  const [editEdition] = useEditEditionMutation();
  const handleEditClick = async (values: EditionFormValues) => {
    localErrorWrapper(setFormError, async () => {
      await editEdition({
        variables: {
          editionId: parseInt(selectedEdition?.edition.editionId as string),
          editionName: values.name,
          editionYear: values.year,
        },
      });
      refetch();
      closeEditDialog();
    });
  };

  // DELETE
  // TODO this confrim can be moved to setup buttons
  const { openConfirmPopup } = useConfirmPopup();
  const [deleteEdition] = useDeleteEditionMutation();
  const handleDeleteClick = async (edition: Edition) => {
    openConfirmPopup(() => {
      globalErrorWrapper(async () => {
        await deleteEdition({
          variables: { editionId: parseInt(edition.edition.editionId) },
        });
        refetch();
      });
    });
  };

  return {
    loading,
    error,
    editions,
    selectedEdition,
    formError,
    // ADD
    isAddOpen,
    openAddDialog,
    closeAddDialog,
    handleCreateClick,
    // COPY
    isCopyOpen,
    openCopyDialog,
    closeCopyDialog,
    handleCopyClick,
    // EDIT
    isEditOpen,
    openEditDialog,
    closeEditDialog,
    handleEditClick,
    // DELETE
    handleDeleteClick,
  };
};
