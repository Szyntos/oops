import { createContext, useState, ReactNode } from "react";

type ConfirmPopupType = {
  isConfirmOpen: boolean;
  openConfirmPopup: (onConfirm: () => void) => void;
  closeConfirmPopup: () => void;
  handleConfirm: () => void;
};

export const ConfirmPopupContext = createContext<ConfirmPopupType | undefined>(
  undefined,
);

export const ConfirmPopupProvider = ({ children }: { children: ReactNode }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [handleConfirm, setHandleConfirm] = useState<() => void>(() => {});

  const openConfirmPopup = (handleConfirm: () => void) => {
    setIsConfirmOpen(true);
    setHandleConfirm(() => handleConfirm);
  };

  const closeConfirmPopup = () => {
    setIsConfirmOpen(false);
    setHandleConfirm(() => {});
  };

  return (
    <ConfirmPopupContext.Provider
      value={{
        isConfirmOpen,
        openConfirmPopup,
        closeConfirmPopup,
        handleConfirm,
      }}
    >
      {children}
    </ConfirmPopupContext.Provider>
  );
};
