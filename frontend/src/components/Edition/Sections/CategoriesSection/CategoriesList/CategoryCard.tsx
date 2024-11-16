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
        permissions={category.permissions}
        handleCopy={handleCopyClick}
        handleSelect={handleSelectClick}
        handleEdit={handleEditClick}
        handleDelete={handleDeleteClick}
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
