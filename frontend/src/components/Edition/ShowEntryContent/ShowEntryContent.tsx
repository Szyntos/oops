import { EMPTY_FIELD_STRING } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { ShowAwardContent } from "./specificContent/ShowAwardContent";
import { ShowChestContent } from "./specificContent/ShowChestContent";
import { ShowGroupContent } from "./specificContent/ShowGroupContent";
import { ShowLevelSetContent } from "./specificContent/ShowLevelSetContent";
import { ShowUserContent } from "./specificContent/ShowUserContent";
import { ShowCategoryContent } from "./specificContent/ShowCategoryContent";
import { CustomText } from "../../CustomText";
import { Category } from "../../../hooks/Edition/categories/useCategoriesSection";
import { LevelSet } from "../../../hooks/Edition/useLevelSetsSection";
import { Award } from "../../../hooks/Edition/useAwardsSection";
import { Chest } from "../../../hooks/Edition/useChestsSection";
import { User } from "../../../hooks/Edition/users/useUsersSection";
import { Group } from "../../../hooks/Edition/useGroupsSection";

export type ShowEntryContentProps = {
  selectedEntry?: Entry;
  type?: EntryType;
};

export type Entry = Category | LevelSet | Award | Chest | Group | User;
export type EntryType =
  | "award"
  | "category"
  | "level"
  | "chest"
  | "group"
  | "user";

const getSpecificContent = (entry: Entry, type: EntryType) => {
  switch (type) {
    case "award":
      return <ShowAwardContent entry={entry as Award} />;
    case "category":
      return <ShowCategoryContent entry={entry as Category} />;
    case "level":
      return <ShowLevelSetContent entry={entry as LevelSet} />;
    case "chest":
      return <ShowChestContent entry={entry as Chest} />;
    case "group":
      return <ShowGroupContent entry={entry as Group} />;
    case "user":
      return <ShowUserContent entry={entry as User} />;
  }
};

export const ShowEntryContent = ({
  selectedEntry,
  type,
}: ShowEntryContentProps) => {
  return (
    <div style={styles.container}>
      {selectedEntry && type ? (
        getSpecificContent(selectedEntry, type)
      ) : (
        <CustomText>{EMPTY_FIELD_STRING}</CustomText>
      )}
    </div>
  );
};

const styles: Styles = {
  container: {
    padding: 50,
  },
};
