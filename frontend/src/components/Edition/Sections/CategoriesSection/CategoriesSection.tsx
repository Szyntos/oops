import { Dialog } from "@mui/material";
import { Styles } from "../../../../utils/Styles";
import { AddCategoryForm } from "./AddCategoryForm/AddCategoryForm";
import { CategoriesList } from "./CategoriesList/CategoriesList";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { useCategoriesSection } from "../../../../hooks/Edition/categories/useCategoriesSection";
import { useParams } from "react-router-dom";
import { LoadingScreen } from "../../../../screens/Loading/LoadingScreen";
import { ErrorScreen } from "../../../../screens/Error/ErrorScreen";

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
    <div style={styles.container}>
      <button onClick={openAddCategory}>Dodaj kategorię</button>

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

      <Dialog open={isAddCategory}>
        <CloseHeader onCloseClick={closeAddCategory} />
        <AddCategoryForm
          formError={formError}
          handleConfirm={handleAddCategory}
          title={"Dodaj kategorię"}
        />
      </Dialog>

      <Dialog open={iseEditCategory}>
        <CloseHeader onCloseClick={closeEditCategory} />
        <AddCategoryForm
          formError={formError}
          handleConfirm={handleEditCategory}
          title={"Edytuj kategorię"}
          initialValues={selectedCategory?.category}
          initialSelectedSubcategories={
            selectedCategory?.category.subcategories.map((s) => ({
              name: s.subcategoryName,
              max: parseInt(s.maxPoints),
            })) ?? []
          }
        />
      </Dialog>
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
