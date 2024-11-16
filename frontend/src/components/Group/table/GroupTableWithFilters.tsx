import { Styles } from "../../../utils/Styles";
import FilterMenu from "./FilterMenu";
import { useState } from "react";
import { GroupTable } from "./GroupTable";
import {
  GroupTableRow,
  SubcategoryPoints,
} from "../../../hooks/Group/useGroupScreenData";
import { Category } from "../../../utils/utils";

type GroupTableWithFiltersProps = {
  rows: GroupTableRow[];
  categories: Category[];
  handleStudentClick: (id: string) => void;
};

export const GroupTableWithFilters = ({
  rows,
  categories,
  handleStudentClick,
}: GroupTableWithFiltersProps) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const isCategorySelected = (category: Category) => {
    return selectedCategoryIds.some((categoryId) => categoryId === category.id);
  };

  const arePointsSelected = (points: SubcategoryPoints) => {
    return selectedCategoryIds.some(
      (categoryId) => categoryId === points.categoryId,
    );
  };

  const applyFilters = selectedCategoryIds.length !== 0;

  const subcategoriesToDisplay = (
    applyFilters ? categories.filter(isCategorySelected) : categories
  )
    .map((category) => category.subcategories)
    .flat();

  const rowsToDisplay: GroupTableRow[] = rows.map((row) => {
    return {
      ...row,
      subcategories: applyFilters
        ? row.subcategories.filter(arePointsSelected)
        : row.subcategories,
    };
  });

  return (
    <div style={styles.container}>
      <FilterMenu
        pickedCategoryIds={selectedCategoryIds}
        onSelectChange={(selectedIds) => {
          setSelectedCategoryIds(selectedIds);
        }}
        filterItems={categories.map((category) => {
          return { id: category.id, name: category.name };
        })}
      />
      <GroupTable
        rows={rowsToDisplay}
        subcategories={subcategoriesToDisplay}
        handleStudentClick={handleStudentClick}
      />
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
