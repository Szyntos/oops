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
    loading,
    error,
    handleAddGroup,
    openAddDialog,
    isAddDialogOpen,
    closeAddDialog,
    formError,
    students,
    handleUploadStudents,
    variant,
    isEditOpen,
    closeEditDialog,
    openEditDialog,
    selectedGroup,
    handleUpdateConfirmation,
  } = useGroupsSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div>
      <div>
        <button onClick={() => openAddDialog("select")}>add group</button>
        <button onClick={() => openAddDialog("import")}>import group</button>
      </div>
      <GroupsList groups={groups} title="groups" editClick={openEditDialog} />

      <Dialog open={isAddDialogOpen}>
        <CloseHeader onCloseClick={closeAddDialog} />
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

      <Dialog open={isEditOpen}>
        <CloseHeader onCloseClick={closeEditDialog} />
        <AddGroupForm
          createError={formError}
          handleAddGroup={handleUpdateConfirmation}
          weekdays={weekdays}
          teachers={teachers}
          students={students}
          editionId={editionId}
          variant={"select"}
          initSelected={
            selectedGroup?.userGroups.map((u) => {
              const s = u.user;
              const t: Student = {
                __typename: "Users",
                firstName: s.firstName,
                imageFileId: s.imageFileId,
                fullName: s.fullName,
                indexNumber: s.indexNumber,
                nick: s.nick,
                role: s.role,
                secondName: s.secondName,
                userId: s.userId,
              };
              return t;
            }) ?? []
          }
          initValues={{
            startTime: selectedGroup?.startTime as string,
            endTime: selectedGroup?.endTime as string,
            weekdayId: selectedGroup?.weekday.weekdayId as string,
            teacherId: selectedGroup?.teacher.userId as string,
            usosId: selectedGroup?.usosId as number,
          }}
        />
      </Dialog>
    </div>
  );
};
