import { createContext, useState, ReactNode } from "react";
import { Category } from "../hooks/Edition/categories/useCategoriesSection";

export type ShowEntryType = Category;

type EditionSectionsContextType = {
  selectedEntry: ShowEntryType | undefined;
  isShowDialogOpen: boolean;
  openShowDialog: (entry: ShowEntryType) => void;
  closeShowDialog: () => void;
};

export const EditionSectionsContext = createContext<
  EditionSectionsContextType | undefined
>(undefined);

export const EditionSectionsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
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
    <EditionSectionsContext.Provider
      value={{
        selectedEntry,
        isShowDialogOpen,
        openShowDialog,
        closeShowDialog,
      }}
    >
      {children}
    </EditionSectionsContext.Provider>
  );
};
