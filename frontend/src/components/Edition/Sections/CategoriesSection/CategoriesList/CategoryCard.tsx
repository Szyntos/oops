import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Category } from "../../../../../hooks/Edition/categories/useCategoriesSection";
import { SetupButtons } from "../../SetupButtons";
import { cardStyles, getCardStyles } from "../../../../../utils/utils";
import { CustomText } from "../../../../CustomText";

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
  const { openShowDialog } = useEditionSections();

  const getSubcategoriesString = (category: Category) => {
    const subcategoryNames = category.category.subcategories.map(
      (subcategory) => subcategory.subcategoryName,
    );
    const n = subcategoryNames.length;
    return `(${n}) ${subcategoryNames.splice(0, Math.min(2, n)).join(", ")}${n > 2 ? "..." : ""}`;
  };

  return (
    <div style={getCardStyles(isSelected)}>
      <div style={cardStyles.textContainer}>
        <CustomText style={cardStyles.title}>
          {category.category.categoryName}
        </CustomText>
        <CustomText>
          subkategorie: {getSubcategoriesString(category)}
        </CustomText>
      </div>

      <SetupButtons
        isSelected={isSelected}
        permissions={category.permissions}
        handleCopy={handleCopyClick}
        handleSelect={handleSelectClick}
        handleEdit={handleEditClick}
        handleDelete={handleDeleteClick}
        handleShow={() => openShowDialog(category)}
      />
    </div>
  );
};
