import {
  SetupGroupsQuery,
  useSetupGroupsQuery,
} from "../../../../graphql/setupGroups.graphql.types";
import { GroupsList } from "./GroupsList/GroupsList";

type GroupsSectionProps = {
  editionId: number;
};

export type Group = NonNullable<
  SetupGroupsQuery["editionByPk"]
>["groups"][number];

export const GroupsSection = ({ editionId }: GroupsSectionProps) => {
  const { data, loading, error } = useSetupGroupsQuery({
    variables: { editionId: editionId.toString() },
  });

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  const groups: Group[] = data?.editionByPk?.groups ?? [];

  return (
    <div>
      <GroupsList groups={groups} />
    </div>
  );
};
