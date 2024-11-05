import { Category } from "../../../../../hooks/Edition/categories/useCategoriesSection";
import { Styles } from "../../../../../utils/Styles";
import { SetupButtons } from "../../SetupButtons";

type CategoryCardProps = {
  category: Category;
  isSelected: boolean;
  handleSelectClick: () => void;
  handleEditClick: () => void;
  handleDeleteClick: () => void;
};

export const CategoryCard = ({
  category,
  isSelected,
  handleSelectClick,
  handleEditClick,
  handleDeleteClick,
}: CategoryCardProps) => {
  const getSubcategoriesString = (category: Category) => {
    const subcategoryNames = category.subcategories.map(
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
      <div>{category.categoryName}</div>
      <div>subcategories: {getSubcategoriesString(category)}</div>

      <SetupButtons
        selected={isSelected}
        handleSelect={handleSelectClick}
        handleEdit={handleEditClick}
        handleDelete={handleDeleteClick}
        disableCopy={true}
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
