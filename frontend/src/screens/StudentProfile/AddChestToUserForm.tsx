import { useFormik } from "formik";
import { ZodError, z } from "zod";
import { useState } from "react";
import { Category, formStyles } from "../../utils/utils";
import { Chest } from "../../hooks/StudentProfile/useCoordinatorActions";
import { FormButton } from "../../components/form/FormButton";
import { FormError } from "../../components/form/FormError";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { SelectImage } from "../../components/inputs/SelectImage";
import { SelectChangeEvent } from "@mui/material";

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

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    const categoryId = e.target.value;
    const updatedSubcategories =
      categories.find((category) => category.id === categoryId)
        ?.subcategories || [];
    setSubcategories(updatedSubcategories);

    formik.setFieldValue("categoryId", categoryId);
    formik.setFieldValue("subcategoryId", updatedSubcategories[0]?.id || "");
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

          <SelectImage
            type="chest"
            options={chests.map((c) => c.imageFileId as string)}
            selectedIds={[formik.values.chestId]}
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({
                ...formik.values,
                chestId: updatedIds.length > 0 ? updatedIds[0] : "",
              })
            }
            error={formik.errors.chestId}
            touched={formik.touched.chestId}
            selectVariant={"single"}
            title={"Skrzynka:"}
          />

          <FormError error={formError} />
          <FormButton />
        </div>
      </form>
    </div>
  );
};
