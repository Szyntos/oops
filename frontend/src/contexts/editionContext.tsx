import { createContext, useState, ReactNode } from "react";
import { Category } from "../hooks/Edition/categories/useCategoriesSection";
import { LevelSet } from "../hooks/Edition/useLevelSetsSection";
import { Award } from "../hooks/Edition/useAwardsSection";
import { Chest } from "../hooks/Edition/useChestsSection";
import { Group } from "../hooks/Edition/useGroupsSection";
import { User } from "../hooks/Edition/users/useUsersSection";

export type Entry = Category | LevelSet | Award | Chest | Group | User;

type EditionSectionsContextType = {
  selectedEntry: Entry | undefined;
  isShowDialogOpen: boolean;
  openShowDialog: (entry: Entry) => void;
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
  const [selectedEntry, setSelectedEntry] = useState<Entry | undefined>(
    undefined,
  );

  const [isShowDialogOpen, setIsShowDialogOpen] = useState(false);

  const openShowDialog = (entry: Entry) => {
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
