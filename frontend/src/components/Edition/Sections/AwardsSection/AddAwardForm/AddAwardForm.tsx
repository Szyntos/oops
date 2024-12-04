import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { Styles } from "../../../../../utils/Styles";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { AwardTypeType } from "../../../../../__generated__/schema.graphql.types";
import { Category } from "../../../../../hooks/Edition/categories/useCategoriesSection";
import { SelectImage } from "../../../../inputs/SelectImage";

const ValidationSchema = z.object({
  awardName: z.string().min(1),
  awardType: z.string().min(1),
  awardValue: z.number().min(0),
  categoryId: z.string().min(1),
  description: z.string().min(1),
  maxUsages: z.number(),
  imageId: z.string().min(1),
});

export type AwardFormValues = z.infer<typeof ValidationSchema>;

type AddAwardFormProps = {
  handleConfirm: (values: AwardFormValues) => void;
  formError?: string;
  categories: Category[];
  initialValues?: AwardFormValues;
  title: string;
  imageIds: string[];
};

const defaultInitialValues: AwardFormValues = {
  awardName: "",
  awardType: "",
  awardValue: 0,
  categoryId: "",
  description: "",
  maxUsages: 0,
  imageId: "",
};

const awardTypes = Object.values(AwardTypeType);

export const AddAwardForm = ({
  handleConfirm,
  categories,
  imageIds,
  formError,
  initialValues = defaultInitialValues,
  title,
}: AddAwardFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: AwardFormValues) => {
      const errors: FormikErrors<AwardFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }
      return errors;
    },
    onSubmit: (values: AwardFormValues) => {
      handleConfirm({ ...values });
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <form onSubmit={formik.handleSubmit}>
        <div style={styles.fieldsContainer}>
          <TextField
            fullWidth
            name="awardName"
            label="Nazwa nagrody"
            variant="outlined"
            value={formik.values.awardName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.awardName && formik.errors.awardName)}
            helperText={formik.touched.awardName && formik.errors.awardName}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="categoryId"
              value={formik.values.categoryId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.categoryId && formik.errors.categoryId,
              )}
            >
              {categories.map((cat) => (
                <MenuItem
                  key={cat.category.categoryId}
                  value={cat.category.categoryId}
                >
                  {cat.category.categoryName}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.categoryId && formik.errors.categoryId && (
              <div style={{ color: "red" }}>{formik.errors.categoryId}</div>
            )}
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Award Type</InputLabel>
            <Select
              name="awardType"
              value={formik.values.awardType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.awardType && formik.errors.awardType,
              )}
            >
              {awardTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.awardType && formik.errors.awardType && (
              <div style={{ color: "red" }}>{formik.errors.awardType}</div>
            )}
          </FormControl>
          <TextField
            fullWidth
            name="awardValue"
            label="Wartość nagrody"
            type="number"
            variant="outlined"
            value={formik.values.awardValue}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.awardValue && formik.errors.awardValue,
            )}
            helperText={formik.touched.awardValue && formik.errors.awardValue}
          />
          <TextField
            fullWidth
            name="description"
            label="Opis"
            variant="outlined"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.description && formik.errors.description,
            )}
            helperText={formik.touched.description && formik.errors.description}
          />
          <TextField
            fullWidth
            name="maxUsages"
            label="Max użyć"
            type="number"
            variant="outlined"
            value={formik.values.maxUsages}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.maxUsages && formik.errors.maxUsages)}
            helperText={formik.touched.maxUsages && formik.errors.maxUsages}
          />

          <SelectImage
            type="withoutTooltip"
            options={imageIds}
            selectedIds={[formik.values.imageId.toString()]}
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({
                ...formik.values,
                imageId: updatedIds.length > 0 ? updatedIds[0] : "",
              })
            }
            error={formik.errors.imageId}
            touched={formik.touched.imageId}
            selectVariant={"single"}
            title="select image:"
          />
        </div>
        <button type="submit">confirm</button>
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
    width: 500,
  },
  title: { fontWeight: "bold" },
  error: { color: "red" },
  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};
