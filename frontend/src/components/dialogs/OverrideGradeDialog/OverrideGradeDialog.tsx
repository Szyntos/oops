import { useOverrideGrade } from "../../../hooks/common/useOverrideGrade";
import { GroupsQuery } from "../../../graphql/groups.graphql.types";
import { OverrideGradeForm } from "./OverrideGradeForm";
import { CustomDialog } from "../CustomDialog";
import { CustomText } from "../../CustomText";
import { ERROR_MESSAGE } from "../../../utils/utils";

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
    <CustomDialog
      isOpen={isOverrideGradeOpen}
      onCloseClick={closeOverrideGrade}
      title={"Nadpisz ocenę studenta"}
    >
      {data ? (
        <OverrideGradeForm
          handleConfirm={handleOverrideGradeConfirm}
          initGrade={data.grade}
          formError={formError}
        />
      ) : (
        <CustomText>{ERROR_MESSAGE}</CustomText>
      )}
    </CustomDialog>
  );
};
