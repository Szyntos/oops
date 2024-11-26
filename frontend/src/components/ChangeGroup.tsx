import { GroupsQuery, useGroupsQuery } from "../graphql/groups.graphql.types";
import { useChangeGroup } from "../hooks/common/useChangeGroup";
import { ChangeGroupForm } from "./ChangeGroupForm";

export type Group = NonNullable<GroupsQuery["editionByPk"]>["groups"][number];

export const ChangeGroup = () => {
  const { handleChangeGroupConfirm, groupId, editionId, formError } =
    useChangeGroup();

  const { data, error, loading } = useGroupsQuery({
    variables: { editionId: editionId as string },
    skip: editionId === undefined,
  });

  const groups: Group[] = data?.editionByPk?.groups ?? [];

  if (error) return <div>Error: {error.message}</div>;
  if (loading) return <div>Loading</div>;

  return (
    <div>
      <ChangeGroupForm
        handleConfirm={handleChangeGroupConfirm}
        title={"Change student group"}
        groups={groups}
        groupId={groupId as string}
        formError={formError}
      />
    </div>
  );
};
