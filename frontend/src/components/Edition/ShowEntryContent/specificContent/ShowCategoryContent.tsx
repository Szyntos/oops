import { Category } from "../../../../hooks/Edition/categories/useCategoriesSection";

type ShowCategoryContentProps = {
  entry: Category;
};
export const ShowCategoryContent = ({ entry }: ShowCategoryContentProps) => {
  return (
    <div>
      {entry.category.categoryName}
      <pre>{JSON.stringify(entry)}</pre>
    </div>
  );
};
