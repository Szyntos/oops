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

  if (error) return <div>Error: {error.message}</div>;
  if (loading) return <div>Loading</div>;

  if (!initData) return <div>something went wrong...</div>;

  return (
    <Dialog open={isChangeGroupOpen}>
      <CloseHeader onCloseClick={closeChangeGroup} />
      <ChangeGroupForm
        handleConfirm={handleChangeGroupConfirm}
        title={"Change student group"}
        groups={groups}
        initGroupId={initData.groupId}
        formError={formError}
      />
    </Dialog>
  );
};
