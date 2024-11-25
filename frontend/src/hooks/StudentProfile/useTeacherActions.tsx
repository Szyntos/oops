import { useState } from "react";
import { useCreatePointsMutation } from "../../graphql/createPoints.graphql.types";
import { useEditPointsMutation } from "../../graphql/editPoints.graphql.types";
import { useRemovePointsMutation } from "../../graphql/removePoints.graphql.types";
import { FormPoints } from "../../components/StudentProfile/PointsForm/types";
import { Points } from "./types";
import { useError } from "../common/useGlobalError";
import { useConfirmPopup } from "../common/useConfrimPopup";

// TODO: maybe this hook should be separated to 3: add, edit, delete
export const useTeacherActions = (
  refetchStudentScreenData: () => void,
  studentId: string,
  teacherId: string,
) => {
  const { localErrorWrapper, globalErrorWrapper } = useError();

  const [selectedPoints, setSelectedPoints] = useState<Points | undefined>(
    undefined,
  );
  const [formError, setFormError] = useState<string | undefined>(undefined);

  // ADD
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const openAddDialog = (points?: Points) => {
    if (points) {
      setSelectedPoints(points);
    }
    setIsAddDialogOpen(true);
  };

  const [createPoints] = useCreatePointsMutation();
  const closeAddDialog = () => {
    setSelectedPoints(undefined);
    setFormError(undefined);
    setIsAddDialogOpen(false);
  };

  const handleAddPointsConfirmation = async (formPoints: FormPoints) => {
    localErrorWrapper(setFormError, async () => {
      await createPoints({
        variables: {
          studentId: parseInt(studentId),
          subcategoryId: parseInt(formPoints.subcategoryId),
          teacherId: parseInt(teacherId),
          value: formPoints.points,
        },
      });
      closeAddDialog();
      refetchStudentScreenData();
    });
  };

  // EDIT
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const openEditDialog = (points: Points) => {
    setSelectedPoints(points);
    setIsEditDialogOpen(true);
  };
  const closeEditDialog = () => {
    setSelectedPoints(undefined);
    setFormError(undefined);
    setIsEditDialogOpen(false);
  };
  const [editPoints] = useEditPointsMutation();
  const handleEditPointsConfirmation = async (formPoints: FormPoints) => {
    if (!selectedPoints) {
      throw new Error("Points to edit are undefined.");
    }
    const pointsId = selectedPoints?.points.purePoints?.pointsId;
    if (!pointsId) {
      throw new Error("Pure points are undefined - use create instead.");
    }

    localErrorWrapper(setFormError, async () => {
      await editPoints({
        variables: {
          pointsId: parseInt(pointsId),
          teacherId: parseInt(teacherId),
          value: formPoints.points,
        },
      });
      closeEditDialog();
      refetchStudentScreenData();
    });
  };

  // DELETE
  const { openConfirmPopup } = useConfirmPopup();
  const [removePoints] = useRemovePointsMutation();
  const handleDeletePointsClick = async (pointsId: string) => {
    openConfirmPopup(() => {
      globalErrorWrapper(async () => {
        await removePoints({ variables: { pointsId: parseInt(pointsId) } });
        refetchStudentScreenData();
      });
    });
  };

  return {
    selectedPoints,
    formError,

    isAddDialogOpen,
    openAddDialog,
    closeAddDialog,

    isEditDialogOpen,
    openEditDialog,
    closeEditDialog,

    handleAddPointsConfirmation,
    handleEditPointsConfirmation,
    handleDeletePointsClick,
  };
};
