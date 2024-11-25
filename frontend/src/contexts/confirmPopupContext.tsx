import { createContext, useState, ReactNode } from "react";

type ConfirmPopupContextType = {
  isConfirmOpen: boolean;
  handleConfirm: () => void;
  openConfirmPopup: (onConfirm: () => void) => void;
  closeConfirmPopup: () => void;
};

export const ConfirmPopupContext = createContext<
  ConfirmPopupContextType | undefined
>(undefined);

export const ConfirmPopupProvider = ({ children }: { children: ReactNode }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [onConfirm, setOnConfirm] = useState<() => void>(() => {});

  const openConfirmPopup = (onConfirm: () => void) => {
    setIsConfirmOpen(true);
    setOnConfirm(() => onConfirm);
  };

  const closeConfirmPopup = () => {
    setIsConfirmOpen(false);
    setOnConfirm(() => {});
  };

  const handleConfirm = () => {
    onConfirm();
    closeConfirmPopup();
  };

  return (
    <ConfirmPopupContext.Provider
      value={{
        isConfirmOpen,
        handleConfirm,
        openConfirmPopup,
        closeConfirmPopup,
      }}
    >
      {children}
    </ConfirmPopupContext.Provider>
  );
};
