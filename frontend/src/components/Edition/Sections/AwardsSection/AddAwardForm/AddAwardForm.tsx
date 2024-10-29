import { z, ZodError } from "zod";
import { useFormik } from "formik";
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

const ValidationSchema = z.object({
  awardName: z.string().min(1),
  awardType: z.string().min(1),
  awardValue: z.number().min(0),
  categoryId: z.string().min(1),
  description: z.string(),
  maxUsages: z.number(),
  imageId: z.number(),
});

export type AwardFormValues = z.infer<typeof ValidationSchema>;

type AddAwardFormProps = {
  handleConfirm: (values: AwardFormValues) => void;
  formError?: string;
  categories: Category[];
  initialValues?: AwardFormValues;
  title: string;
};

const awardTypes = Object.values(AwardTypeType);

export const AddAwardForm = ({
  handleConfirm,
  categories,
  formError,
  initialValues = {
    awardName: "",
    awardType: "",
    awardValue: 0,
    categoryId: "",
    description: "",
    maxUsages: 0,
    imageId: 0,
  },
  title,
}: AddAwardFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: AwardFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }
      return {};
    },
    onSubmit: (values: AwardFormValues) => {
      handleConfirm(values);
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
            label="Award Name"
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
                <MenuItem key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName}
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
            label="Award Value"
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
            label="Description"
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
            label="Max Usages"
            type="number"
            variant="outlined"
            value={formik.values.maxUsages}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.maxUsages && formik.errors.maxUsages)}
            helperText={formik.touched.maxUsages && formik.errors.maxUsages}
          />

          <TextField
            fullWidth
            name="imageId"
            label="imageId"
            type="number"
            variant="outlined"
            value={formik.values.imageId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.imageId && formik.errors.imageId)}
            helperText={formik.touched.maxUsages && formik.errors.imageId}
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
