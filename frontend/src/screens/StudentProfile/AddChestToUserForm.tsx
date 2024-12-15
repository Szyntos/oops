import { useFormik } from "formik";
import { ZodError, z } from "zod";
import { useState } from "react";
import { SelectInput } from "../../components/inputs/SelectInput";
import { Category } from "../../utils/utils";
import { Styles } from "../../utils/Styles";
import { Chest } from "../../hooks/StudentProfile/useCoordinatorActions";
import { tokens } from "../../tokens";

export type ChestFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  categoryId: z.string().min(1, "required"),
  subcategoryId: z.string().min(1, "required"),
  chestId: z.string().min(1, "required"),
});

type AddChestToUserFormProps = {
  categories: Category[];
  chests: Chest[];
  handleConfirmClick: (formPoints: {
    subcategoryId: string;
    chestId: string;
  }) => void;
  initialValues: ChestFormValues;
  formError: string | undefined;
};

export const AddChestToUserForm = ({
  categories,
  handleConfirmClick,
  formError,
  initialValues,
  chests,
}: AddChestToUserFormProps) => {
  const formik = useFormik({
    initialValues: initialValues,
    validate: (values: ChestFormValues) => {
      const errors: { [key: string]: string } = {};

      // Schema validation
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }

      return errors;
    },
    onSubmit: (values: ChestFormValues) => {
      handleConfirmClick({
        subcategoryId: values.subcategoryId,
        chestId: values.chestId,
      });
    },
  });

  const [subcategories, setSubcategories] = useState(
    categories.find((c) => c.id === initialValues.categoryId)?.subcategories ||
      [],
  );

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = e.target.value;
    const updatedSubcategories =
      categories.find((category) => category.id === categoryId)
        ?.subcategories || [];
    setSubcategories(updatedSubcategories);

    formik.setFieldValue("categoryId", categoryId);
    formik.setFieldValue("subcategoryId", updatedSubcategories[0]?.id || "");
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>Add Chest to User</div>
      <form onSubmit={formik.handleSubmit}>
        <SelectInput
          handleChange={handleCategoryChange}
          handleBlur={formik.handleBlur}
          value={formik.values.categoryId}
          error={formik.errors.categoryId}
          touched={formik.touched.categoryId}
          name="categoryId"
          optionItems={categories?.map((category) => ({
            value: category.id,
            title: category.name,
          }))}
          label="Kategoria"
        />
        <SelectInput
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
          value={formik.values.subcategoryId}
          error={formik.errors.subcategoryId}
          touched={formik.touched.subcategoryId}
          name="subcategoryId"
          optionItems={subcategories?.map((subcategory) => ({
            value: subcategory.id,
            title: subcategory.name,
          }))}
          label="Subkategoria"
        />
        <SelectInput
          handleChange={formik.handleChange}
          handleBlur={formik.handleBlur}
          value={formik.values.chestId}
          error={formik.errors.chestId}
          touched={formik.touched.chestId}
          name="chestId"
          optionItems={chests?.map((chest) => ({
            value: chest.chestId,
            title: chest.chestId,
          }))}
          label="Id skrzynki"
        />
        <button type="submit">Powierdź</button>
      </form>
      {formError && <p style={styles.error}>Error: {formError}</p>}
    </div>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    padding: 12,
    border: "1px solid black",
    width: 500,
  },
  title: {
    fontWeight: "bold",
  },
  error: {
    color: tokens.color.state.error,
  },
};
