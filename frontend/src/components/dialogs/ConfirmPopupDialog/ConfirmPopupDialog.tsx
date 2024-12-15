import { Dialog } from "@mui/material";
import { useConfirmPopup } from "../../../hooks/common/useConfirmPopup";

export const ConfirmPopupDialog = () => {
  const { isConfirmOpen, handleConfirm, closeConfirmPopup } = useConfirmPopup();

  return (
    <Dialog open={isConfirmOpen}>
      <div>
        <div>are you sure you want to delete this item?</div>
        <button onClick={handleConfirm}>yes</button>
        <button onClick={closeConfirmPopup}>no</button>
      </div>
    </Dialog>
  );
};
