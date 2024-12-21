import { createContext, useState, ReactNode } from "react";
import {
  Entry,
  EntryType,
} from "../components/Edition/ShowEntryContent/ShowEntryContent";

type EditionSectionsContextType = {
  selectedEntry: { entry: Entry; type: EntryType } | undefined;
  isShowDialogOpen: boolean;
  openShowDialog: (entry: Entry, type: EntryType) => void;
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
  const [selectedEntry, setSelectedEntry] = useState<
    { entry: Entry; type: EntryType } | undefined
  >(undefined);

  const [isShowDialogOpen, setIsShowDialogOpen] = useState(false);

  const openShowDialog = (entry: Entry, type: EntryType) => {
    setSelectedEntry({ entry, type });
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
