import { Category } from "../../../hooks/Edition/categories/useCategoriesSection";
import { Styles } from "../../../utils/Styles";

import { TooltipWrapper } from "../../TooltipWrapper";

export type Permissions = Category["permissions"];

type SetupButtonsProps = {
  permissions: Permissions;
  handleSelect?: () => void;
  handleEdit?: () => void;
  handleDelete?: () => void;
  handleCopy?: () => void;
  handleMarkStudentActiveness?: () => void;
  handleMarkChestActiveness?: () => void;
  handleShow?: () => void;
  handleAdd?: () => void;
  isSelected?: boolean;
  isStudentActive?: boolean;
  isChestActive?: boolean;
};

export const SetupButtons = ({
  permissions,
  handleSelect,
  handleDelete,
  handleCopy,
  handleEdit,
  handleMarkStudentActiveness,
  handleMarkChestActiveness,
  handleShow,
  handleAdd,
  isSelected,
  isStudentActive,
  isChestActive,
}: SetupButtonsProps) => {
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

  const studentActiveness: SetupButtonProps | undefined =
    handleMarkStudentActiveness
      ? {
          handleClick: handleMarkStudentActiveness,
          isClickable: Boolean(
            isStudentActive
              ? permissions.canMarkAsInactive?.allow
              : permissions.canMarkAsActive?.allow,
          ),
          reason: isStudentActive
            ? permissions.canMarkAsInactive?.reason
            : permissions.canMarkAsActive?.reason,
          title: isStudentActive ? "deactivate" : "activate",
        }
      : undefined;

  const chestActiveness: SetupButtonProps | undefined =
    handleMarkChestActiveness
      ? {
          handleClick: handleMarkChestActiveness,
          isClickable: Boolean(
            isChestActive
              ? permissions.canDeactivate?.allow
              : permissions.canActivate?.allow,
          ),
          reason: isChestActive
            ? permissions.canDeactivate?.reason
            : permissions.canActivate?.reason,
          title: isChestActive ? "deactivate" : "activate",
        }
      : undefined;

  const show: SetupButtonProps | undefined = handleShow
    ? {
        handleClick: handleShow,
        isClickable: true,
        reason: undefined,
        title: "show",
      }
    : undefined;

  const add: SetupButtonProps | undefined = handleAdd
    ? {
        handleClick: handleAdd,
        isClickable: permissions.canAdd.allow,
        reason: permissions.canAdd.reason,
        title: "add",
      }
    : undefined;

  return (
    <div style={styles.buttonsContainer}>
      {add && <SetupButton {...add} />}
      {select && <SetupButton {...select} />}
      {copy && <SetupButton {...copy} />}
      {edit && <SetupButton {...edit} />}
      {remove && <SetupButton {...remove} />}
      {studentActiveness && <SetupButton {...studentActiveness} />}
      {chestActiveness && <SetupButton {...chestActiveness} />}
      {show && <SetupButton {...show} />}
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
