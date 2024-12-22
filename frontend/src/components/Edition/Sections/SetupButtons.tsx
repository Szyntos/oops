import { Category } from "../../../hooks/Edition/categories/useCategoriesSection";
import { tokens } from "../../../tokens";
import { Styles } from "../../../utils/Styles";
import { CustomButton } from "../../CustomButton";
import { HooverWrapper } from "../../HooverWrapper";

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
  isBigVariant?: boolean;
  onDisplayClick?: () => void;
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
  isBigVariant,
  onDisplayClick,
}: SetupButtonsProps) => {
  const copy: SetupButtonProps | undefined = handleCopy
    ? {
        handleClick: handleCopy,
        isClickable: permissions.canCopy.allow,
        reason: permissions.canCopy.reason,
        title: "Kopiuj",
      }
    : undefined;

  const edit: SetupButtonProps | undefined = handleEdit
    ? {
        handleClick: handleEdit,
        isClickable: permissions.canEdit.allow,
        reason: permissions.canEdit.reason,
        title: "Edytuj",
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
        title: isSelected ? "Odrzuć" : "Wybierz",
      }
    : undefined;

  const remove: SetupButtonProps | undefined = handleDelete
    ? {
        handleClick: handleDelete,
        isClickable: permissions.canRemove.allow,
        reason: permissions.canRemove.reason,
        title: "Usuń",
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
          title: isStudentActive ? "Dezaktywuj" : "Aktywuj",
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
          title: isChestActive ? "Dezaktywuj" : "Aktywuj",
        }
      : undefined;

  const show: SetupButtonProps | undefined = handleShow
    ? {
        handleClick: handleShow,
        isClickable: true,
        reason: undefined,
        title: "JSON",
      }
    : undefined;

  const add: SetupButtonProps | undefined = handleAdd
    ? {
        handleClick: handleAdd,
        isClickable: permissions.canAdd.allow,
        reason: permissions.canAdd.reason,
        title: "Dodaj",
      }
    : undefined;

  const disp: SetupButtonProps | undefined = onDisplayClick
    ? {
        handleClick: onDisplayClick,
        isClickable: true,
        reason: undefined,
        title: "Pokaż",
      }
    : undefined;
  return (
    <div
      style={
        isBigVariant ? styles.bigButtonsContainer : styles.buttonsContainer
      }
    >
      {add && <SetupButton {...add} isBigVariant={isBigVariant} />}
      {select && <SetupButton {...select} isBigVariant={isBigVariant} />}
      {copy && <SetupButton {...copy} isBigVariant={isBigVariant} />}
      {edit && <SetupButton {...edit} isBigVariant={isBigVariant} />}
      {remove && <SetupButton {...remove} isBigVariant={isBigVariant} />}
      {studentActiveness && (
        <SetupButton {...studentActiveness} isBigVariant={isBigVariant} />
      )}
      {chestActiveness && (
        <SetupButton {...chestActiveness} isBigVariant={isBigVariant} />
      )}
      {show && <SetupButton {...show} isBigVariant={isBigVariant} />}
      {disp && <SetupButton {...disp} isBigVariant={isBigVariant} />}
    </div>
  );
};

type SetupButtonProps = {
  handleClick: () => void;
  isClickable: boolean;
  reason: string | null | undefined;
  title: string;
  isBigVariant?: boolean;
};

const emptyReason = "Brak powodu";

const SetupButton = ({
  handleClick,
  isClickable,
  reason,
  title,
  isBigVariant,
}: SetupButtonProps) => {
  {
    if (isBigVariant) {
      return isClickable ? (
        <CustomButton onClick={handleClick} disabled={false}>
          {title}
        </CustomButton>
      ) : (
        <TooltipWrapper tooltipContent={<div>{reason ?? emptyReason}</div>}>
          <CustomButton onClick={handleClick} disabled={true}>
            {title}
          </CustomButton>
        </TooltipWrapper>
      );
    }

    return isClickable ? (
      <HooverWrapper>
        <button
          disabled={!isClickable}
          onClick={handleClick}
          style={styles.button}
        >
          {title}
        </button>
      </HooverWrapper>
    ) : (
      <TooltipWrapper tooltipContent={<div>{reason ?? emptyReason}</div>}>
        <button
          disabled={!isClickable}
          onClick={handleClick}
          style={{ ...styles.button, ...styles.disabled }}
        >
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
    gap: 6,
  },
  button: {
    border: "none",
    fontSize: tokens.font.small,
    color: tokens.color.text.primary,
    borderRadius: 4,
    cursor: "pointer",
    padding: 4,
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: tokens.color.accent.dark,
  },
  disabled: {
    cursor: "auto",
    backgroundColor: tokens.color.state.disabled,
  },
  bigButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
