import { Dialog } from "@mui/material";
import { SetupGroupsQuery } from "../../../../graphql/setupGroups.graphql.types";
import { GroupsList } from "./GroupsList/GroupsList";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { AddGroupForm } from "./GroupAddForm";
import { useGroupsSection } from "../../../../hooks/Edition/useGroupsSection";
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
  } = useGroupsSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div>
      <div>
        <button onClick={openAddDialog}>add group</button>
      </div>
      <GroupsList groups={groups} title="groups" />

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
        />
      </Dialog>
    </div>
  );
};
