import { Entry } from "../../../contexts/editionContext";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";
import { Styles } from "../../../utils/Styles";
import { ShowAwardContent } from "./specificContent/ShowAwardContent";
import { ShowChestContent } from "./specificContent/ShowChestContent";
import { ShowGroupContent } from "./specificContent/ShowGroupContent";
import { ShowLevelSetContent } from "./specificContent/ShowLevelSetContent";
import { ShowUserContent } from "./specificContent/ShowUserContent";
import { ShowCategoryContent } from "./specificContent/ShowCategoryContent";

export type ShowEntryContentProps = {
  selectedEntry?: Entry;
};

const getSpecificContent = (entry: Entry) => {
  switch (entry.__typename) {
    case "AwardWithPermissionsType":
      return <ShowAwardContent entry={entry} />;
    case "CategoryWithPermissionsType":
      return <ShowCategoryContent entry={entry} />;
    case "LevelSetWithPermissionsType":
      return <ShowLevelSetContent entry={entry} />;
    case "ChestWithPermissionsType":
      return <ShowChestContent entry={entry} />;
    case "GroupWithPermissionsType":
      return <ShowGroupContent entry={entry} />;
    case "UserWithPermissionsType":
      return <ShowUserContent entry={entry} />;
  }
};

export const ShowEntryContent = ({ selectedEntry }: ShowEntryContentProps) => {
  return (
    <div style={styles.container}>
      {selectedEntry ? getSpecificContent(selectedEntry) : EMPTY_FIELD_STRING}
    </div>
  );
};

const styles: Styles = {
  container: {
    padding: 50,
  },
};
