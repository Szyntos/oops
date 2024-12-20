import { useFormik } from "formik";
import { ZodError, z } from "zod";
import { useState } from "react";
import { FormPoints } from "./types";
import { Category, formStyles } from "../../../utils/utils";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { FormError } from "../../form/FormError";
import { SelectChangeEvent } from "@mui/material";
import { FormButton } from "../../form/FormButton";

export type PointsFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  categoryId: z.string().min(1, "Wymagane"),
  subcategoryId: z.string().min(1, "Wymagane"),
  points: z.number().min(0, "Minimalna liczba punktów to 0"),
});

type PointFormProps = {
  categories: Category[];
  handleConfirmClick: (formPoints: FormPoints) => void;
  mutationError?: string;
  initialValues: PointsFormValues;
  disableCategoryAndSubcategory?: boolean;
};

export const PointsForm = ({
  categories,
  handleConfirmClick,
  mutationError,
  initialValues,
  disableCategoryAndSubcategory,
}: PointFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: PointsFormValues) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errors: any = {};

      // schema validation
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }

      // custom validation
      const selectedCategory = categories.find(
        (cat) => cat.id === values.categoryId,
      );
      const selectedSubcategory = selectedCategory?.subcategories.find(
        (sub) => sub.id === values.subcategoryId,
      );

      if (
        selectedSubcategory &&
        values.points > selectedSubcategory.maxPoints
      ) {
        errors.points = `Max to ${selectedSubcategory.maxPoints}`;
      }

      return errors;
    },
    onSubmit: (values: PointsFormValues) => {
      const points: FormPoints = {
        points: values.points,
        subcategoryId: values.subcategoryId,
      };
      handleConfirmClick(points);
    },
  });

  const [subcategories, setSubcategories] = useState(
    categories.find((c) => c.id === initialValues.categoryId)?.subcategories,
  );

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const categoryId = e.target.value;
    const updatedSubcategories =
      categories.find((category) => category.id === categoryId)
        ?.subcategories ?? [];
    setSubcategories(updatedSubcategories);

    formik.setFieldValue("categoryId", categoryId);
    formik.setFieldValue("subcategoryId", updatedSubcategories[0]?.id ?? "");
  };

  return (
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <FormControl fullWidth>
            <InputLabel
              error={Boolean(
                formik.touched.categoryId && formik.errors.categoryId,
              )}
            >
              Kategoria
            </InputLabel>
            <Select
              label="Kategoria"
              name="categoryId"
              value={formik.values.categoryId}
              onChange={handleCategoryChange}
              onBlur={formik.handleBlur}
              disabled={disableCategoryAndSubcategory}
              error={Boolean(
                formik.touched.categoryId && formik.errors.categoryId,
              )}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.categoryId && formik.errors.categoryId && (
              <FormError error={formik.errors.categoryId} />
            )}
          </FormControl>
          <FormControl fullWidth>
            <InputLabel
              error={Boolean(
                formik.touched.subcategoryId && formik.errors.subcategoryId,
              )}
            >
              Subkategoria
            </InputLabel>
            <Select
              label="Subkategoria"
              name="subcategoryId"
              value={formik.values.subcategoryId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={disableCategoryAndSubcategory}
              error={Boolean(
                formik.touched.subcategoryId && formik.errors.subcategoryId,
              )}
            >
              {subcategories?.map((sub) => (
                <MenuItem key={sub.id} value={sub.id}>
                  {sub.name}
                </MenuItem>
              )) ?? []}
            </Select>
            {formik.touched.subcategoryId && formik.errors.subcategoryId && (
              <FormError error={formik.errors.subcategoryId} />
            )}
          </FormControl>
          <TextField
            fullWidth
            name="points"
            label="Punkty"
            type="number"
            variant="outlined"
            value={formik.values.points}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.points && formik.errors.points)}
            helperText={formik.touched.points && formik.errors.points}
          />
          <FormError error={mutationError} />
          <FormButton />
        </div>
      </form>
    </div>
  );
};
