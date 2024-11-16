import { useState } from "react";

import {
  SetupCategoriesQuery,
  useSetupCategoriesQuery,
} from "../../../graphql/setupCategories.graphql.types";
import { useSetupCategoryEditionAddMutation } from "../../../graphql/setupCategoryEditionAdd.graphql.types";
import { useSetupCategoryEditionRemoveMutation } from "../../../graphql/setupCategoryEditionRemove.graphql.types";
import { CategoriesFormValues } from "../../../components/Edition/Sections/CategoriesSection/AddCategoryForm/AddCategoryForm";
import { FormSubcategory } from "../../../components/Edition/Sections/CategoriesSection/AddCategoryForm/SubcategoryRows";
import { useSetupCategoryCreateMutation } from "../../../graphql/setupCategoryCreate.graphql.types";
import { useError } from "../../common/useGlobalError";
import { useSetupCategoryEditMutation } from "../../../graphql/setupCategoryEdit.graphql.types";
import { useDeleteCategoryMutation } from "../../../graphql/deleteCategory.graphql.types";

export type Category = SetupCategoriesQuery["categories"][number];

export const useCategoriesSection = (editionId: number) => {
  const { localErrorWrapper, globalErrorWrapper } = useError();

  const { data, loading, error, refetch } = useSetupCategoriesQuery();

  const categories: Category[] = data?.categories ?? [];

  const selectedCategories: Category[] = categories.filter(
    ({ categoryEditions }) =>
      categoryEditions.some(({ editionId: id }) => id === editionId.toString()),
  );

  const [isAddCategory, setIsAddCategory] = useState(false);
  const openAddCategory = () => {
    setIsAddCategory(true);
  };
  const closeAddCategory = () => {
    setIsAddCategory(false);
    setFormError(undefined);
  };

  const [formError, setFormError] = useState<string | undefined>(undefined);

  // ADD
  const [createCategory] = useSetupCategoryCreateMutation();
  const handleAddCategory = (
    values: CategoriesFormValues,
    subcategories: FormSubcategory[],
  ) => {
    localErrorWrapper(setFormError, async () => {
      await createCategory({
        variables: {
          ...values,
          subcategories: subcategories.map((row, index) => {
            return {
              label: "",
              maxPoints: row.max.toString(),
              ordinalNumber: index,
              subcategoryName: row.name,
            };
          }),
        },
      });
      refetch();
      closeAddCategory();
    });
  };

  // SELECT
  const [selectCategory] = useSetupCategoryEditionAddMutation();
  const [unselectCategory] = useSetupCategoryEditionRemoveMutation();
  const handleSelectCategory = (category: Category) => {
    const isCategorySelected = !!selectedCategories.find(
      (c) => c.categoryId === category.categoryId,
    );
    const variables = {
      editionId,
      categoryId: parseInt(category.categoryId),
    };
    globalErrorWrapper(async () => {
      isCategorySelected
        ? await unselectCategory({ variables })
        : await selectCategory({ variables });
      refetch();
    });
  };

  // EDIT
  const [selectedCategory, setSelectedCategory] = useState<
    Category | undefined
  >(undefined);
  const [iseEditCategory, setIsEditCategory] = useState(false);
  const openEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsEditCategory(true);
  };
  const closeEditCategory = () => {
    setIsEditCategory(false);
    setFormError(undefined);
  };

  // EDIT
  const [editCategory] = useSetupCategoryEditMutation();
  const handleEditCategory = (
    values: CategoriesFormValues,
    subcategories: FormSubcategory[],
  ) => {
    localErrorWrapper(setFormError, async () => {
      await editCategory({
        variables: {
          categoryId: parseInt(selectedCategory?.categoryId ?? "-1"),
          ...values,
          subcategories: subcategories.map((row, index) => {
            return {
              label: "",
              categoryId: parseInt(selectedCategory?.categoryId ?? "-1"),
              maxPoints: row.max.toString(),
              ordinalNumber: index,
              subcategoryName: row.name,
            };
          }),
        },
      });
      refetch();
      closeEditCategory();
    });
  };

  // DELETE
  const [deleteCategory] = useDeleteCategoryMutation();
  const handleDeleteCategory = (category: Category) => {
    globalErrorWrapper(async () => {
      await deleteCategory({
        variables: { categoryId: parseInt(category.categoryId) },
      });
      refetch();
    });
  };

  return {
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
  };
};
