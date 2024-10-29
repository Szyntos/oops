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
    isAddCategory,
    handleSelectCategory,
    openAddCategory,
    closeAddCategory,
    handleAddCategory,
  } = useCategoriesSection(editionId);

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error.message}</div>;

  return (
    <div style={styles.container}>
      <button onClick={openAddCategory}>add category</button>

      <CategoriesList
        categories={selectedCategories}
        selectedCategories={selectedCategories}
        handleSelectCategoryClick={handleSelectCategory}
        title={"Selected categories"}
      />
      <CategoriesList
        categories={categories}
        selectedCategories={selectedCategories}
        handleSelectCategoryClick={handleSelectCategory}
        title={"All categories"}
      />

      <Dialog open={isAddCategory}>
        <CloseHeader onCloseClick={closeAddCategory} />
        <AddCategoryForm
          formError={formError}
          handleConfirm={handleAddCategory}
          title={"Add Category"}
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
