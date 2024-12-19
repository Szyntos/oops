import { useEditionSections } from "../../../../../hooks/common/useEditionSection";
import { Category } from "../../../../../hooks/Edition/categories/useCategoriesSection";
import { SetupButtons } from "../../SetupButtons";
import { coordinatorStyles, getCardStyles } from "../../../../../utils/utils";
import { CustomText } from "../../../../CustomText";
import { Styles } from "../../../../../utils/Styles";
import { tokens } from "../../../../../tokens";

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

  return (
    <div
      style={{ ...getCardStyles(isSelected), justifyContent: "space-between" }}
    >
      <div style={coordinatorStyles.textContainer}>
        <CustomText style={coordinatorStyles.title}>
          {category.category.categoryName}
        </CustomText>
        {category.category.subcategories.map((s, index) => {
          return (
            <div style={styles.subcategoryRow}>
              <CustomText>
                {index + 1}. {s.subcategoryName}{" "}
              </CustomText>
              <CustomText color={tokens.color.text.tertiary}>
                {s.maxPoints}pkt
              </CustomText>
            </div>
          );
        })}
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

const styles: Styles = {
  subcategoryRow: {
    display: "flex",
    gap: 8,
  },
};
