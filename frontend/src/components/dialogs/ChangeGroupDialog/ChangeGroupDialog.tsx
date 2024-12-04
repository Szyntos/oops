import { Dialog } from "@mui/material";
import { useChangeGroup } from "../../../hooks/common/useChangeGroup";
import { CloseHeader } from "../CloseHeader";
import {
  GroupsQuery,
  useGroupsQuery,
} from "../../../graphql/groups.graphql.types";
import { ChangeGroupForm } from "./ChangeGroupForm";

export type Group = NonNullable<GroupsQuery["editionByPk"]>["groups"][number];

export const ChangeGroupDialog = () => {
  const {
    isChangeGroupOpen,
    closeChangeGroup,
    handleChangeGroupConfirm,
    data: initData,
    formError,
  } = useChangeGroup();

  const { data, error, loading } = useGroupsQuery({
    variables: { editionId: initData?.editionId as string },
    skip: initData?.editionId === undefined,
  });

  const groups: Group[] = data?.editionByPk?.groups ?? [];

  const getDialogContent = () => {
    if (loading) return <div>Ładowanie...</div>;
    if (error) return <div>ERROR: {error.message}</div>;
    if (!data || !initData) return <div>something went wrong...</div>;
    return (
      <ChangeGroupForm
        handleConfirm={handleChangeGroupConfirm}
        title={"Zmiana grupy studenta"}
        groups={groups}
        initGroupId={initData.groupId}
        formError={formError}
      />
    );
  };

  return (
    <Dialog open={isChangeGroupOpen}>
      <CloseHeader onCloseClick={closeChangeGroup} />
      {getDialogContent()}
    </Dialog>
  );
};
