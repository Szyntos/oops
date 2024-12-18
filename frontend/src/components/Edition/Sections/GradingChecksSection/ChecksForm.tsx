import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { Category } from "../../../../hooks/Edition/categories/useCategoriesSection";
import { Level } from "../../../../hooks/Edition/useLevelSetsSection";
import { DATE_YYYY_MM_DD_REGEXP, formStyles } from "../../../../utils/utils";
import { FormError } from "../../../form/FormError";
import { FormButton } from "../../../form/FormButton";

const ValidationSchema = z.object({
  endOfLabsDate: z
    .string()
    .min(1, "Data jest wymagana")
    .regex(
      DATE_YYYY_MM_DD_REGEXP,
      "Zły format daty, wymagany format: YYYY-MM-DD",
    ),
  endOfLabsLevelsThreshold: z.string().min(1, "Próg jest wymagany"),
  projectPointsThreshold: z.number().min(1, "Próg punktowy jest wymagany"),
  projectId: z.string().min(1, "Project ID jest wymagane"),
});

export type GradingChecksFormValues = z.infer<typeof ValidationSchema>;

type GradingChecksFormProps = {
  handleConfirm: (values: GradingChecksFormValues) => void;
  formError?: string;
  levels: Level[];
  initialValues?: GradingChecksFormValues;
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
  levels,
  formError,
  initialValues = defaultInitialValues,
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
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <TextField
            fullWidth
            name="endOfLabsDate"
            label="Data końca laboratorium"
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
            <InputLabel
              error={Boolean(
                formik.touched.endOfLabsLevelsThreshold &&
                  formik.errors.endOfLabsLevelsThreshold,
              )}
            >
              Poziom do zdobycia przed końcem laboratorium
            </InputLabel>
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
              {levels.map((level) => (
                <MenuItem key={level.levelName} value={level.levelId}>
                  {level.levelName}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.projectId && formik.errors.projectId && (
              <FormError error={formik.errors.projectId} />
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel
              error={Boolean(
                formik.touched.projectId && formik.errors.projectId,
              )}
            >
              Kategoria
            </InputLabel>
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
                  key={category.category.categoryName}
                  value={category.category.categoryId}
                >
                  {category.category.categoryName}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.projectId && formik.errors.projectId && (
              <FormError error={formik.errors.projectId} />
            )}
          </FormControl>

          <TextField
            fullWidth
            name="projectPointsThreshold"
            label="Liczba punktów do zdobycia za daną kategorię"
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

          <FormButton />
        </div>
      </form>

      <FormError error={formError} />
    </div>
  );
};
