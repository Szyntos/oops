import { Styles } from "../../../utils/Styles";
import { useState } from "react";
import { GroupTable } from "./GroupTable";
import { Category, Subcategory } from "../../../utils/utils";
import { GroupTableRow, Student } from "../../../hooks/Group/useGroupTableData";
import FilterMenu from "../../StudentProfile/table/FilterMenu/FilterMenu";

type GroupTableWithFiltersProps = {
  rows: GroupTableRow[];
  categories: Category[];
  handleStudentClick: (student: Student) => void;
  handleSubcategoryClick: (subcategory: Subcategory) => void;
  editable: boolean;
};

export const GroupTableWithFilters = ({
  rows,
  categories,
  handleStudentClick,
  handleSubcategoryClick,
  editable,
}: GroupTableWithFiltersProps) => {
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const applyFilters = selectedCategoryIds.length !== 0;

  const rowsToDisplay: GroupTableRow[] = rows.map((row) => {
    const filteredRow: GroupTableRow = {
      student: row.student,
      categories: applyFilters
        ? row.categories.filter((c) =>
            selectedCategoryIds.some((id) => id === c.categoryId),
          )
        : row.categories,
    };
    return filteredRow;
  });

  return (
    <div style={styles.container}>
      <FilterMenu
        pickedCategoryIds={selectedCategoryIds}
        onSelectChange={(selectedIds) => {
          setSelectedCategoryIds(selectedIds);
        }}
        filterItems={categories.map((c) => {
          return {
            id: c.id,
            name: c.name,
            lightColor: c.lightColor,
            darkColor: c.darkColor,
          };
        })}
      />

      <GroupTable
        rows={rowsToDisplay}
        handleStudentClick={handleStudentClick}
        handleSubcategoryClick={handleSubcategoryClick}
        editable={editable}
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
