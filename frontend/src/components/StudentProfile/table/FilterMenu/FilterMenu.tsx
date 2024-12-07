import { Styles } from "../../../../utils/Styles";
import { FilterItem } from "../../../Groups/FilterBar/FilterOptionsSection";
import { FilterMenuItem } from "./FilterMenuItem";

type FilterMenuProps = {
  pickedCategoryIds: string[];
  onSelectChange: (pickedCategoryIds: string[]) => void;
  filterItems: FilterMenuItemm[];
};

export type FilterMenuItemm = FilterItem & {
  lightColor: string;
  darkColor: string;
};

export default function FilterMenu({
  pickedCategoryIds,
  onSelectChange,
  filterItems,
}: FilterMenuProps) {
  const isSelected = (item: FilterItem) => {
    return pickedCategoryIds.some((selectedId) => selectedId === item.id);
  };

  const handleCategoryClick = (item: FilterMenuItemm) => {
    if (isSelected(item)) {
      const updatedSelectedCategories = pickedCategoryIds.filter(
        (selectedId) => selectedId !== item.id,
      );
      onSelectChange(updatedSelectedCategories);
    } else {
      onSelectChange([...pickedCategoryIds, item.id]);
    }
  };

  return (
    <div style={styles.container}>
      {filterItems.map((item) => (
        <FilterMenuItem
          text={item.name}
          isSelected={isSelected(item)}
          lightColor={item.lightColor}
          darkColor={item.darkColor}
          onClick={() => handleCategoryClick(item)}
        />
      ))}
    </div>
  );
}

const styles: Styles = {
  container: {
    display: "flex",
    gap: 12,
  },
};
