import { Category } from "../../../hooks/Edition/categories/useCategoriesSection";
import { Styles } from "../../../utils/Styles";

import { TooltipWrapper } from "../../TooltipWrapper";

type Permissions = Category["permissions"];

type SetupButtonsProps = {
  permissions: Permissions;
  handleSelect?: () => void;
  handleEdit?: () => void;
  handleDelete?: () => void;
  handleCopy?: () => void;
  isSelected: boolean;
};

export const SetupButtons = ({
  permissions,
  handleSelect,
  handleDelete,
  handleCopy,
  handleEdit,
  isSelected,
}: SetupButtonsProps) => {
  if (!permissions) {
    return <></>;
  }
  const copy: SetupButtonProps | undefined = handleCopy
    ? {
        handleClick: handleCopy,
        isClickable: permissions.canCopy.allow,
        reason: permissions.canCopy.reason,
        title: "copy",
      }
    : undefined;

  const edit: SetupButtonProps | undefined = handleEdit
    ? {
        handleClick: handleEdit,
        isClickable: permissions.canEdit.allow,
        reason: permissions.canEdit.reason,
        title: "edit",
      }
    : undefined;

  const select: SetupButtonProps | undefined = handleSelect
    ? {
        handleClick: handleSelect,
        isClickable: isSelected
          ? permissions.canUnselect.allow
          : permissions.canSelect.allow,
        reason: isSelected
          ? permissions.canUnselect.reason
          : permissions.canSelect.reason,
        title: isSelected ? "unselect" : "select",
      }
    : undefined;

  const remove: SetupButtonProps | undefined = handleDelete
    ? {
        handleClick: handleDelete,
        isClickable: permissions.canRemove.allow,
        reason: permissions.canRemove.reason,
        title: "delete",
      }
    : undefined;

  return (
    <div style={styles.buttonsContainer}>
      {select && <SetupButton {...select} />}
      {copy && <SetupButton {...copy} />}
      {edit && <SetupButton {...edit} />}
      {remove && <SetupButton {...remove} />}
    </div>
  );
};

type SetupButtonProps = {
  handleClick: <T>(item: T) => void;
  isClickable: boolean;
  reason: string | null | undefined;
  title: string;
};

const emptyReason = "no reason";

const SetupButton = ({
  handleClick,
  isClickable,
  reason,
  title,
}: SetupButtonProps) => {
  {
    return isClickable ? (
      <button disabled={!isClickable} onClick={handleClick}>
        {title}
      </button>
    ) : (
      <TooltipWrapper tooltipContent={<div>{reason ?? emptyReason}</div>}>
        <button disabled={!isClickable} onClick={handleClick}>
          {title}
        </button>
      </TooltipWrapper>
    );
  }
};

const styles: Styles = {
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
  },
};
