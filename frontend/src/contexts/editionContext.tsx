import { createContext, useState, ReactNode } from "react";
import { Category } from "../hooks/Edition/categories/useCategoriesSection";

export type ShowEntryType = Category;

type EditionContextType = {
  selectedEntry: ShowEntryType | undefined;
  isShowDialogOpen: boolean;
  openShowDialog: (entry: ShowEntryType) => void;
  closeShowDialog: () => void;
};

export const EditionContext = createContext<EditionContextType | undefined>(
  undefined,
);

export const EditionProvider = ({ children }: { children: ReactNode }) => {
  const [selectedEntry, setSelectedEntry] = useState<ShowEntryType | undefined>(
    undefined,
  );

  const [isShowDialogOpen, setIsShowDialogOpen] = useState(false);

  const openShowDialog = (entry: ShowEntryType) => {
    setSelectedEntry(entry);
    setIsShowDialogOpen(true);
  };

  const closeShowDialog = () => {
    setSelectedEntry(undefined);
    setIsShowDialogOpen(false);
  };

  return (
    <EditionContext.Provider
      value={{
        selectedEntry,
        isShowDialogOpen,
        openShowDialog,
        closeShowDialog,
      }}
    >
      {children}
    </EditionContext.Provider>
  );
};
