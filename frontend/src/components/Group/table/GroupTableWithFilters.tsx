import { useState } from "react";
import { GroupTable } from "./GroupTable";
import { Category, Subcategory } from "../../../utils/utils";
import { GroupTableRow, Student } from "../../../hooks/Group/useGroupTableData";
import FilterMenu from "../../StudentProfile/table/FilterMenu/FilterMenu";
import { Styles } from "../../../utils/Styles";
import { NotEditableInfo } from "../../StudentProfile/NotEditableInfo";

type GroupTableWithFiltersProps = {
  rows: GroupTableRow[];
  categories: Category[];
  handleStudentClick: (student: Student) => void;
  handleSubcategoryClick: (subcategory: Subcategory) => void;
  editable: boolean;
  disableEditMode: boolean;
  hasEditableRights: boolean;
  isSelectedEditionActive: boolean;
};

export const GroupTableWithFilters = ({
  rows,
  categories,
  handleStudentClick,
  handleSubcategoryClick,
  editable,
  disableEditMode,
  hasEditableRights,
  isSelectedEditionActive,
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
    <>
      <div style={styles.filterWrapper}>
        {disableEditMode && (
          <NotEditableInfo
            hasEditableRights={hasEditableRights}
            isSelectedEditionActive={isSelectedEditionActive}
            type={"group"}
          />
        )}

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
      </div>

      <div style={styles.tableWrapper}>
        <GroupTable
          rows={rowsToDisplay}
          handleStudentClick={handleStudentClick}
          handleSubcategoryClick={handleSubcategoryClick}
          editable={editable}
          showAggregatedValues={
            !applyFilters || selectedCategoryIds.length === categories.length
          }
        />
      </div>
    </>
  );
};

const styles: Styles = {
  filterWrapper: {
    padding: 12,
    paddingBottom: 0,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  tableWrapper: {
    flex: 1,
    overflowY: "auto",
    padding: 12,
    paddingTop: 0,
  },
};
