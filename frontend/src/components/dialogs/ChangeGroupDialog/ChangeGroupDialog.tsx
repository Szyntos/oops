import { useChangeGroup } from "../../../hooks/common/useChangeGroup";
import {
  GroupsQuery,
  useGroupsQuery,
} from "../../../graphql/groups.graphql.types";
import { ChangeGroupForm } from "./ChangeGroupForm";
import { ERROR_MESSAGE } from "../../../utils/utils";
import { CustomText } from "../../CustomText";
import { CustomDialog } from "../CustomDialog";

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
    if (loading) return <></>;
    if (error || !data || !initData)
      return <CustomText>{ERROR_MESSAGE}</CustomText>;

    return (
      <ChangeGroupForm
        handleConfirm={handleChangeGroupConfirm}
        groups={groups}
        initGroupId={initData.groupId}
        formError={formError}
      />
    );
  };

  return (
    <CustomDialog
      isOpen={isChangeGroupOpen}
      onCloseClick={closeChangeGroup}
      title="Zmień grupę studenta"
    >
      {getDialogContent()}
    </CustomDialog>
  );
};
