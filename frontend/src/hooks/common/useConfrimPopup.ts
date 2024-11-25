import { useContext } from "react";
import { ConfirmPopupContext } from "../../contexts/confirmPopupContext";

export function useConfirmPopup() {
  const context = useContext(ConfirmPopupContext);
  if (!context) {
    throw new Error(
      "useConfirmPopup must be used within a ConfirmPopupProvider",
    );
  }
  return context;
}
