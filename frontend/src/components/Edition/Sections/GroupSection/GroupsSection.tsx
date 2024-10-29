import { Dialog } from "@mui/material";
import { SetupGroupsQuery } from "../../../../graphql/setupGroups.graphql.types";
import { GroupsList } from "./GroupsList/GroupsList";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { AddGroupForm } from "./GroupAddForm";
import {
  Student,
  useGroupsSection,
} from "../../../../hooks/Edition/useGroupsSection";
import { useParams } from "react-router-dom";

export type Group = NonNullable<
  SetupGroupsQuery["editionByPk"]
>["groups"][number];

export const GroupsSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    groups,
    weekdays,
    teachers,
    students,
    loading,
    error,
    formError,
    isAddGroupOpen,
    openAddGroup,
    closeAddGroup,
    handleAddGroup,
    isEditGroupOpen,
    openEditDialog,
    closeEditDialog,
    handleEditGroupConfirm,
    handleDeleteGroup,
    handleUploadStudents,
    // handleStudentGroupChange,
    variant,
    selectedGroup,
  } = useGroupsSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div>
      <div>
        <button onClick={() => openAddGroup("select")}>add group</button>
        <button onClick={() => openAddGroup("import")}>import group</button>
      </div>
      <GroupsList
        groups={groups}
        title="groups"
        editClick={openEditDialog}
        deleteClick={handleDeleteGroup}
      />

      <Dialog open={isAddGroupOpen}>
        <CloseHeader onCloseClick={closeAddGroup} />
        <AddGroupForm
          createError={formError}
          handleAddGroup={handleAddGroup}
          weekdays={weekdays}
          teachers={teachers}
          students={students}
          handleUploadStudents={handleUploadStudents}
          editionId={editionId}
          variant={variant}
        />
      </Dialog>

      <Dialog open={isEditGroupOpen}>
        <CloseHeader onCloseClick={closeEditDialog} />
        <AddGroupForm
          createError={formError}
          handleAddGroup={handleEditGroupConfirm}
          weekdays={weekdays}
          teachers={teachers}
          students={students}
          editionId={editionId}
          variant={"select"}
          initSelected={
            selectedGroup?.userGroups.map((u) => u.user as Student) ?? []
          }
          initValues={
            selectedGroup
              ? {
                  ...selectedGroup,
                  weekdayId: selectedGroup.weekday.weekdayId,
                  teacherId: selectedGroup.teacher.userId,
                }
              : undefined
          }
        />
      </Dialog>
    </div>
  );
};
