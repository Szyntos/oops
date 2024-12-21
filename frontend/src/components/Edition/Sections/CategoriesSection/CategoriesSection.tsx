import { AddCategoryForm } from "./AddCategoryForm/AddCategoryForm";
import { CategoriesList } from "./CategoriesList/CategoriesList";
import { useCategoriesSection } from "../../../../hooks/Edition/categories/useCategoriesSection";
import { useParams } from "react-router-dom";
import { LoadingScreen } from "../../../../screens/Loading/LoadingScreen";
import { ErrorScreen } from "../../../../screens/Error/ErrorScreen";
import { CustomButton } from "../../../CustomButton";
import { coordinatorStyles } from "../../../../utils/utils";
import { CustomDialog } from "../../../dialogs/CustomDialog";

export const CategoriesSection = () => {
  const params = useParams();
  const editionId = params.id ? parseInt(params.id) : -1;

  const {
    categories,
    selectedCategories,
    loading,
    error,
    formError,
    selectedCategory,
    isAddCategory,
    handleSelectCategory,
    openAddCategory,
    closeAddCategory,
    handleAddCategory,
    iseEditCategory,
    openEditCategory,
    closeEditCategory,
    handleEditCategory,
    handleDeleteCategory,
    handleCopyCategory,
  } = useCategoriesSection(editionId);

  if (loading) return <LoadingScreen type="edition" />;
  if (error) return <ErrorScreen type="edition" />;

  return (
    <div style={coordinatorStyles.container}>
      <CustomButton onClick={openAddCategory}>Dodaj kategorię</CustomButton>

      <CategoriesList
        categories={selectedCategories}
        selectedCategories={selectedCategories}
        handleSelectClick={handleSelectCategory}
        handleEditClick={openEditCategory}
        handleDeleteClick={handleDeleteCategory}
        handleCopyClick={handleCopyCategory}
        title="Wybrane kategorie"
      />
      <CategoriesList
        categories={categories}
        selectedCategories={selectedCategories}
        handleSelectClick={handleSelectCategory}
        handleEditClick={openEditCategory}
        handleDeleteClick={handleDeleteCategory}
        handleCopyClick={handleCopyCategory}
        title="Wszystkie kategorie"
      />

      <CustomDialog
        isOpen={isAddCategory}
        title="Dodaj kategorię"
        onCloseClick={closeAddCategory}
        size="lg"
      >
        <AddCategoryForm
          formError={formError}
          handleConfirm={handleAddCategory}
        />
      </CustomDialog>

      <CustomDialog
        isOpen={iseEditCategory}
        title="Edytuj kategorię"
        onCloseClick={closeEditCategory}
        size="lg"
      >
        <AddCategoryForm
          formError={formError}
          handleConfirm={handleEditCategory}
          initialValues={selectedCategory?.category}
          initialSelectedSubcategories={
            selectedCategory?.category.subcategories.map((s) => ({
              name: s.subcategoryName,
              max: parseInt(s.maxPoints),
            })) ?? []
          }
        />
      </CustomDialog>
    </div>
  );
};
