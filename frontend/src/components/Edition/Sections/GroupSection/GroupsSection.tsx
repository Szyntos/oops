import { GroupsList } from "./GroupsList/GroupsList";
import { AddGroupForm } from "./GroupAddForm";
import { useGroupsSection } from "../../../../hooks/Edition/useGroupsSection";
import { useParams } from "react-router-dom";
import { UsersRolesType } from "../../../../__generated__/schema.graphql.types";
import { LoadingScreen } from "../../../../screens/Loading/LoadingScreen";
import { ErrorScreen } from "../../../../screens/Error/ErrorScreen";
import { CustomButton } from "../../../CustomButton";
import { coordinatorStyles } from "../../../../utils/utils";
import { CustomDialog } from "../../../dialogs/CustomDialog";

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
    variant,
    selectedGroup,
    handleMarkAllPassingStudents,
  } = useGroupsSection(editionId);

  if (loading) return <LoadingScreen type="edition" />;
  if (error) return <ErrorScreen type="edition" />;

  return (
    <div style={coordinatorStyles.container}>
      <div style={coordinatorStyles.buttonsContainer}>
        <CustomButton onClick={() => openAddGroup("select")}>
          Dodaj grupę
        </CustomButton>
        <CustomButton onClick={() => openAddGroup("import")}>
          Zaimportuj grupę
        </CustomButton>
        <CustomButton onClick={handleMarkAllPassingStudents}>
          Deaktywuj wszystkich zdających studentów
        </CustomButton>
      </div>
      <GroupsList
        groups={groups}
        title="Grupy"
        editClick={openEditDialog}
        deleteClick={handleDeleteGroup}
      />

      <CustomDialog
        isOpen={isAddGroupOpen}
        onCloseClick={closeAddGroup}
        title={`${variant === "select" ? "Dodaj" : "Importuj"} grupę`}
      >
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
      </CustomDialog>

      <CustomDialog
        isOpen={isEditGroupOpen}
        onCloseClick={closeEditDialog}
        title="Edytuj grupę"
      >
        <AddGroupForm
          createError={formError}
          handleAddGroup={handleEditGroupConfirm}
          weekdays={weekdays}
          teachers={teachers}
          students={students}
          editionId={editionId}
          variant={"select"}
          initSelected={
            selectedGroup?.group.userGroups.map((u) => ({
              ...u.user,
              __typename: "Users",
              role: u.user.role as UsersRolesType,
            })) ?? []
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
        />
      </CustomDialog>
    </div>
  );
};
