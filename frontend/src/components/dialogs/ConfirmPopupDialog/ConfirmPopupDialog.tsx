import { useConfirmPopup } from "../../../hooks/common/useConfirmPopup";
import { CustomDialog } from "../CustomDialog";
import { Styles } from "../../../utils/Styles";
import { CustomButton } from "../../CustomButton";
import { tokens } from "../../../tokens";

export const ConfirmPopupDialog = () => {
  const { isConfirmOpen, handleConfirm, closeConfirmPopup } = useConfirmPopup();

  return (
    <CustomDialog
      isOpen={isConfirmOpen}
      title={"Jesteś pewien?"}
      onCloseClick={closeConfirmPopup}
    >
      <div style={styles.buttonsContainer}>
        <CustomButton onClick={handleConfirm}>Potwierdź</CustomButton>
        <CustomButton
          onClick={closeConfirmPopup}
          color={tokens.color.state.error}
        >
          Anuluj
        </CustomButton>
      </div>
    </CustomDialog>
  );
};

const styles: Styles = {
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    justifyContent: "right",
    margin: 12,
  },
};
