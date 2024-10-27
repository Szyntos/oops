import { Dialog } from "@mui/material";
import { SetupGroupsQuery } from "../../../../graphql/setupGroups.graphql.types";
import { GroupsList } from "./GroupsList/GroupsList";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { AddGroupForm } from "./GroupAddForm";
import { useGroupsSection } from "../../../../hooks/Edition/useGroupsSection";

type GroupsSectionProps = {
  editionId: number;
};

export type Group = NonNullable<
  SetupGroupsQuery["editionByPk"]
>["groups"][number];

export const GroupsSection = ({ editionId }: GroupsSectionProps) => {
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
        />
      </Dialog>
    </div>
  );
};
