import { Styles } from "../../../utils/Styles";
import { TooltipWrapper } from "../../TooltipWrapper";

type SetupButtonsProps = {
  select?: SetupButtonProps;
  copy?: SetupButtonProps;
  edit?: SetupButtonProps;
  remove?: SetupButtonProps;
  isSelected: boolean;
};

export const SetupButtons = ({
  copy,
  remove,
  edit,
  select,
  isSelected,
}: SetupButtonsProps) => {
  return (
    <div style={styles.buttonsContainer}>
      {select && (
        <SetupButton {...select} title={isSelected ? "unselect" : "select"} />
      )}
      {copy && <SetupButton {...copy} title="copy" />}
      {edit && <SetupButton {...edit} title="edit" />}
      {remove && <SetupButton {...remove} title="remove" />}
    </div>
  );
};

type SetupButtonProps = {
  handleClick: <T>(item: T) => void;
  isClickable: boolean;
  reason: string | null | undefined;
  title?: string;
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
