import { Dialog } from "@mui/material";
import { GroupsList } from "./GroupsList/GroupsList";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { AddGroupForm } from "./GroupAddForm";
import { useGroupsSection } from "../../../../hooks/Edition/useGroupsSection";
import { useParams } from "react-router-dom";
import { UsersRolesType } from "../../../../__generated__/schema.graphql.types";
import { mockPermissions } from "../../../../utils/utils";

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
    handleMarkAllPassingStudents,
  } = useGroupsSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div>
      <div>
        <button onClick={() => openAddGroup("select")}>add group</button>
        <button onClick={() => openAddGroup("import")}>import group</button>
        <button onClick={handleMarkAllPassingStudents}>
          mark all passing students as inactive
        </button>
      </div>
      <GroupsList
        groups={groups}
        title="Grupy"
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
          title={"Dodaj grupę"}
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
            selectedGroup?.group.userGroups.map((u) => {
              return {
                user: {
                  ...u.user,
                  __typename: "UserType",
                  role: u.user.role as UsersRolesType,
                },
                permissions: mockPermissions,
              };
            }) ?? []
          }
          initValues={
            selectedGroup
              ? {
                  ...selectedGroup.group,
                  startTime: selectedGroup.group.startTime.slice(0, -3),
                  endTime: selectedGroup.group.endTime.slice(0, -3),
                  weekdayId: selectedGroup.group.weekday.weekdayId,
                  teacherId: selectedGroup.group.teacher.userId,
                }
              : undefined
          }
          title="Edytuj grupę"
        />
      </Dialog>
    </div>
  );
};
