import { Category } from "../../../../../hooks/Edition/categories/useCategoriesSection";
import { Styles } from "../../../../../utils/Styles";
import { SetupButtons } from "../../SetupButtons";

type CategoryCardProps = {
  category: Category;
  isSelected: boolean;
  handleSelectClick: () => void;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
  handleCopyClick: () => void;
};

export const CategoryCard = ({
  category,
  isSelected,
  handleSelectClick,
  handleEditClick,
  handleDeleteClick,
  handleCopyClick,
}: CategoryCardProps) => {
  const getSubcategoriesString = (category: Category) => {
    const subcategoryNames = category.category.subcategories.map(
      (subcategory) => subcategory.subcategoryName,
    );
    const n = subcategoryNames.length;
    return `(${n}) ${subcategoryNames.splice(0, Math.min(2, n)).join(", ")}${n > 2 ? "..." : ""}`;
  };

  return (
    <div
      style={{
        ...styles.card,
        backgroundColor: isSelected ? "pink" : undefined,
      }}
    >
      <div>{category.category.categoryName}</div>
      <div>subcategories: {getSubcategoriesString(category)}</div>

      <SetupButtons
        isSelected={isSelected}
        select={{
          handleClick: handleSelectClick,
          isClickable: isSelected
            ? category.permissions.canUnselect.allow
            : category.permissions.canSelect.allow,
          reason: isSelected
            ? category.permissions.canUnselect.reason
            : category.permissions.canSelect.reason,
        }}
        edit={{
          handleClick: handleEditClick,
          isClickable: category.permissions.canEdit.allow,
          reason: category.permissions.canEdit.reason,
        }}
        copy={{
          handleClick: handleCopyClick,
          isClickable: category.permissions.canCopy.allow,
          reason: category.permissions.canCopy.reason,
        }}
        remove={{
          handleClick: handleDeleteClick,
          isClickable: category.permissions.canRemove.allow,
          reason: category.permissions.canRemove.reason,
        }}
      />
    </div>
  );
};

const styles: Styles = {
  card: {
    border: "1px solid black",
    padding: 12,
  },
};
