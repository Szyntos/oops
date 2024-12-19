import { Dialog } from "@mui/material";
import { useConfirmPopup } from "../../../hooks/common/useConfirmPopup";

export const ConfirmAvatarNickPopupDialog = () => {
  const { isConfirmOpen, handleConfirm, closeConfirmPopup } = useConfirmPopup();

  return (
    <Dialog open={isConfirmOpen} onClose={closeConfirmPopup}>
      <div>
        <div>Those values cannot be changed, proceed?</div>
        <button onClick={handleConfirm}>Yes</button>
        <button onClick={closeConfirmPopup}>No</button>
      </div>
    </Dialog>
  );
};
