import { Dialog } from "@mui/material";
import { Styles } from "../../../../utils/Styles";
import { AddCategoryForm } from "./AddCategoryForm/AddCategoryForm";
import { CategoriesList } from "./CategoriesList/CategoriesList";
import { CloseHeader } from "../../../dialogs/CloseHeader";
import { useCategoriesSection } from "../../../../hooks/Edition/categories/useCategoriesSection";
import { useParams } from "react-router-dom";

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
  } = useCategoriesSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <button onClick={openAddCategory}>add category</button>

      <CategoriesList
        categories={selectedCategories}
        selectedCategories={selectedCategories}
        handleSelectClick={handleSelectCategory}
        handleEditClick={openEditCategory}
        title={"Selected categories"}
        handleDeleteClick={handleDeleteCategory}
      />
      <CategoriesList
        categories={categories}
        selectedCategories={selectedCategories}
        handleSelectClick={handleSelectCategory}
        title={"All categories"}
        handleEditClick={openEditCategory}
        handleDeleteClick={handleDeleteCategory}
      />

      <Dialog open={isAddCategory}>
        <CloseHeader onCloseClick={closeAddCategory} />
        <AddCategoryForm
          formError={formError}
          handleConfirm={handleAddCategory}
          title={"Add Category"}
        />
      </Dialog>

      <Dialog open={iseEditCategory}>
        <CloseHeader onCloseClick={closeEditCategory} />
        <AddCategoryForm
          formError={formError}
          handleConfirm={handleEditCategory}
          title={"Edit Category"}
          initialValues={selectedCategory}
          initialSelectedSubcategories={
            selectedCategory?.subcategories.map((s) => ({
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
