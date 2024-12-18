import { Category } from "../../../../../hooks/Edition/categories/useCategoriesSection";
import { CardsSection } from "../../../CardsSection";
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
    <CardsSection
      title={title}
      cards={categories.map((category) => (
        <CategoryCard
          category={category}
          isSelected={
            !!selectedCategories.find(
              (c) => c.category.categoryId === category.category.categoryId,
            )
          }
          handleSelectClick={() => handleSelectClick(category)}
          handleEditClick={() => handleEditClick(category)}
          handleDeleteClick={() => handleDeleteClick(category)}
          handleCopyClick={() => handleCopyClick(category)}
        />
      ))}
    />
  );
};
