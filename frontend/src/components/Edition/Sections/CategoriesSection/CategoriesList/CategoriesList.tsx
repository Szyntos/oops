import { Category } from "../../../../../hooks/Edition/categories/useCategoriesSection";
import { EMPTY_FIELD_STRING } from "../../../../../utils/constants";
import { Styles } from "../../../../../utils/Styles";
import { CategoryCard } from "./CategoryCard";

type CategoriesListProps = {
  categories: Category[];
  selectedCategories: Category[];
  handleSelectClick: (category: Category) => void;
  handleEditClick: (category: Category) => void;
  handleDeleteClick: (category: Category) => void;
  handleCopyClick: (category: Category) => void;
  title: string;
};

export const CategoriesList = ({
  categories,
  selectedCategories,
  handleSelectClick,
  handleEditClick,
  handleDeleteClick,
  handleCopyClick,
  title,
}: CategoriesListProps) => {
  return (
    <div>
      <div style={styles.title}>{title}</div>
      <div style={styles.container}>
        {categories.length !== 0
          ? categories.map((category) => (
              <CategoryCard
                category={category}
                isSelected={
                  !!selectedCategories.find(
                    (c) =>
                      c.category.categoryId === category.category.categoryId,
                  )
                }
                handleSelectClick={() => handleSelectClick(category)}
                handleEditClick={() => handleEditClick(category)}
                handleDeleteClick={() => handleDeleteClick(category)}
                handleCopyClick={() => handleCopyClick(category)}
              />
            ))
          : EMPTY_FIELD_STRING}
      </div>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  title: {
    color: "blue",
  },
};
