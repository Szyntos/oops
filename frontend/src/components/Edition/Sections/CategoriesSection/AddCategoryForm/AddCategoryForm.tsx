import { z, ZodError } from "zod";
import { useFormik } from "formik";
import { FormControlLabel, Switch, TextField } from "@mui/material";
import { FormSubcategory, SubcategoryRows } from "./SubcategoryRows";
import { useState } from "react";
import { SubcategoriesFormValues } from "./SubcategoryRow";
import { FormError } from "../../../../form/FormError";
import { FormButton } from "../../../../form/FormButton";
import { formErrors, formStyles } from "../../../../../utils/utils";

export type CategoriesFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  categoryName: z.string().min(1, formErrors.required),
  canAddPoints: z.boolean(),
});

type AddCategoryFormProps = {
  handleConfirm: (
    values: CategoriesFormValues,
    subcategories: FormSubcategory[],
  ) => void;
  formError?: string;
  initialValues?: CategoriesFormValues;
  initialSelectedSubcategories?: FormSubcategory[];
};

export const AddCategoryForm = ({
  handleConfirm,
  formError,
  initialValues = {
    categoryName: "",
    canAddPoints: false,
  },
  initialSelectedSubcategories = [],
}: AddCategoryFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: CategoriesFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }

      // TODO create subcategories validation
    },
    onSubmit: (values: CategoriesFormValues) => {
      handleConfirm(values, subcategories);
    },
  });

  const [subcategories, setSubcategories] = useState<FormSubcategory[]>(
    initialSelectedSubcategories,
  );

  const handleAdd = (subcategory: SubcategoriesFormValues) => {
    setSubcategories((prev) => [
      ...prev,
      {
        name: subcategory.name,
        ordinal: subcategory.ordinal,
        max: subcategory.maxPoints,
      },
    ]);
  };

  const handleDelete = (ordinal: number) => {
    const updatedRows = subcategories
      .filter((_, index) => index + 1 !== ordinal)
      .map((row, index) => {
        return { ...row, ordinal: index + 1 };
      });
    setSubcategories(updatedRows);
  };

  const handleUp = (ordinal: number) => {
    const index = ordinal - 1;

    const updated = subcategories.map((row, i) => {
      if (i === index - 1) return subcategories[index];
      if (i === index) return subcategories[index - 1];
      return row;
    });

    setSubcategories(updated);
  };

  const handleDown = (ordinal: number) => {
    const index = ordinal - 1;

    const updated = subcategories.map((row, i) => {
      if (i === index) return subcategories[index + 1];
      if (i === index + 1) return subcategories[index];
      return row;
    });

    setSubcategories(updated);
  };

  return (
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <TextField
            fullWidth
            name="categoryName"
            label="Nazwa"
            variant="outlined"
            value={formik.values.categoryName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.categoryName && formik.errors.categoryName,
            )}
            helperText={
              formik.touched.categoryName && formik.errors.categoryName
            }
          />

          <FormControlLabel
            control={
              <Switch
                name="canAddPoints"
                checked={formik.values.canAddPoints}
                onChange={(event) =>
                  formik.setFieldValue("canAddPoints", event.target.checked)
                }
                onBlur={formik.handleBlur}
              />
            }
            label="Dodawanie punktów"
          />

          <SubcategoryRows
            subcategories={subcategories}
            handleAdd={handleAdd}
            handleDelete={handleDelete}
            handleUp={handleUp}
            handleDown={handleDown}
          />

          <FormError error={formError} />

          <FormButton />
        </div>
      </form>
    </div>
  );
};
