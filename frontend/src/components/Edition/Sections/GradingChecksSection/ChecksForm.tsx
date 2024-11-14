import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { Styles } from "../../../../utils/Styles";
import { Category } from "../../../../hooks/Edition/categories/useCategoriesSection";
import { LevelSet } from "../../../../hooks/Edition/useLevelSetsSection";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // 'YYYY-MM-DD'

const ValidationSchema = z.object({
  endOfLabsDate: z
    .string()
    .min(1, "Date is required")
    .regex(dateRegex, "Invalid date format, expected YYYY-MM-DD"),
  endOfLabsLevelsThreshold: z.string().min(1, "Threshold is required"),
  projectPointsThreshold: z.number().min(1, "Points threshold is required"),
  projectId: z.string().min(1, "Project ID is required"),
});

export type GradingChecksFormValues = z.infer<typeof ValidationSchema>;

type GradingChecksFormProps = {
  handleConfirm: (values: GradingChecksFormValues) => void;
  formError?: string;
  levelSet: LevelSet;
  initialValues?: GradingChecksFormValues;
  title: string;
  categories: Category[];
};

const defaultInitialValues: GradingChecksFormValues = {
  endOfLabsDate: "",
  endOfLabsLevelsThreshold: "",
  projectPointsThreshold: 0,
  projectId: "",
};

export const ChecksForm = ({
  handleConfirm,
  levelSet,
  formError,
  initialValues = defaultInitialValues,
  title,
  categories,
}: GradingChecksFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: GradingChecksFormValues) => {
      const errors: FormikErrors<GradingChecksFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }
      return errors;
    },
    onSubmit: (values: GradingChecksFormValues) => {
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
            name="endOfLabsDate"
            label="End of Labs Date"
            placeholder="YYYY-MM-DD"
            variant="outlined"
            value={formik.values.endOfLabsDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.endOfLabsDate && formik.errors.endOfLabsDate,
            )}
            helperText={
              formik.touched.endOfLabsDate && formik.errors.endOfLabsDate
            }
          />
          <FormControl fullWidth>
            <InputLabel>End of Labs</InputLabel>
            <Select
              name="endOfLabsLevelsThreshold"
              value={formik.values.endOfLabsLevelsThreshold}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.endOfLabsLevelsThreshold &&
                  formik.errors.endOfLabsLevelsThreshold,
              )}
            >
              {levelSet.levels.map((level) => (
                <MenuItem key={level.name} value={level.levelId}>
                  {level.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.projectId && formik.errors.projectId && (
              <div style={{ color: "red" }}>{formik.errors.projectId}</div>
            )}
          </FormControl>
          <TextField
            fullWidth
            name="projectPointsThreshold"
            label="projectPointsThreshold"
            type="number"
            variant="outlined"
            value={formik.values.projectPointsThreshold}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.projectPointsThreshold &&
                formik.errors.projectPointsThreshold,
            )}
            helperText={
              formik.touched.projectPointsThreshold &&
              formik.errors.projectPointsThreshold
            }
          />
          <FormControl fullWidth>
            <InputLabel>Project</InputLabel>
            <Select
              name="projectId"
              value={formik.values.projectId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.projectId && formik.errors.projectId,
              )}
            >
              {categories.map((category) => (
                <MenuItem
                  key={category.categoryName}
                  value={category.categoryId}
                >
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.projectId && formik.errors.projectId && (
              <div style={{ color: "red" }}>{formik.errors.projectId}</div>
            )}
          </FormControl>
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
