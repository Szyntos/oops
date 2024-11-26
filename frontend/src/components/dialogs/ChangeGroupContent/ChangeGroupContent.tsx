import {
  GroupsQuery,
  useGroupsQuery,
} from "../../../graphql/groups.graphql.types";
import { useChangeGroup } from "../../../hooks/common/useChangeGroup";
import { ChangeGroupForm } from "./ChangeGroupForm";

export type Group = NonNullable<GroupsQuery["editionByPk"]>["groups"][number];

export const ChangeGroupContent = () => {
  const {
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
    <div>
      <ChangeGroupForm
        handleConfirm={handleChangeGroupConfirm}
        title={"Change student group"}
        groups={groups}
        initGroupId={initData.groupId}
        formError={formError}
      />
    </div>
  );
};
