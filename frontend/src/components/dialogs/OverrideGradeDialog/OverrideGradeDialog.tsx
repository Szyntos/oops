import { Dialog } from "@mui/material";
import { useOverrideGrade } from "../../../hooks/common/useOverrideGrade";
import { CloseHeader } from "../CloseHeader";
import { GroupsQuery } from "../../../graphql/groups.graphql.types";
import { OverrideGradeForm } from "./OverrideGradeForm";

export type Group = NonNullable<GroupsQuery["editionByPk"]>["groups"][number];

export const OverrideGradeDialog = () => {
  const {
    isOverrideGradeOpen,
    closeOverrideGrade,
    handleOverrideGradeConfirm,
    data,
    formError,
  } = useOverrideGrade();

  return (
    <Dialog open={isOverrideGradeOpen}>
      <CloseHeader onCloseClick={closeOverrideGrade} />
      {data ? (
        <OverrideGradeForm
          handleConfirm={handleOverrideGradeConfirm}
          title={"Override student grade"}
          initGrade={data.grade}
          formError={formError}
        />
      ) : (
        <div>something went wrong...</div>
      )}
    </Dialog>
  );
};