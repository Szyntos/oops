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
import { WithAddedLevelsValidateErrors } from "./AddSetForm";
import { SelectImage } from "../../../../inputs/SelectImage";
import { GRADE_STRINGS } from "../../../../../utils/utils";
import { tokens } from "../../../../../tokens";

const ValidationSchema = z.object({
  name: z.string().min(1),
  maxPoints: z.number().min(0),
  grade: z.string().min(0),
  imageId: z.string().min(1, "Musisz wybrać obrazek."),
});

export type LevelFormValues = z.infer<typeof ValidationSchema>;

type LevelFormProps = {
  handleAdd: (values: LevelFormValues) => void;
  formError?: string;
  initialValues?: LevelFormValues;
  title: string;
  imageIds: string[];
  validateWithAddedLevels: (
    values: LevelFormValues,
  ) => WithAddedLevelsValidateErrors;
};

const defaultInitialValues: LevelFormValues = {
  name: "",
  maxPoints: 1,
  grade: "2.0",
  imageId: "",
};

export const AddLevelForm = ({
  handleAdd,
  imageIds,
  formError,
  initialValues = defaultInitialValues,
  title,
  validateWithAddedLevels,
}: LevelFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: LevelFormValues) => {
      let errors: FormikErrors<LevelFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }

      // validate with already added levels
      const { nameError, maxPointsError, gradeError, imageError } =
        validateWithAddedLevels(values);

      errors = nameError ? { ...errors, name: nameError } : errors;
      errors = maxPointsError
        ? { ...errors, maxPoints: maxPointsError }
        : errors;
      errors = gradeError ? { ...errors, grade: gradeError } : errors;
      errors = imageError ? { ...errors, imageId: imageError } : errors;

      return errors;
    },
    onSubmit: (values: LevelFormValues) => {
      handleAdd({ ...values });
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <form onSubmit={formik.handleSubmit}>
        <div style={styles.formContent}>
          <div style={styles.fieldsContainer}>
            <TextField
              style={styles.blockedField}
              name="ordinal"
              label="Liczba porządkowa"
              variant="outlined"
              value="?"
              disabled={true}
            />

            <TextField
              style={styles.blockedField}
              name="min"
              label="min"
              variant="outlined"
              value="?"
              disabled={true}
            />

            <TextField
              name="maxPoints"
              label="max"
              variant="outlined"
              type="number"
              value={formik.values.maxPoints}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.maxPoints && formik.errors.maxPoints,
              )}
              helperText={formik.touched.maxPoints && formik.errors.maxPoints}
            />

            <TextField
              name="name"
              label="Nazwa poziomu"
              variant="outlined"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <FormControl>
              <InputLabel>Grade</InputLabel>
              <Select
                name="grade"
                value={formik.values.grade}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={Boolean(formik.touched.grade && formik.errors.grade)}
              >
                {GRADE_STRINGS.map((g) => (
                  <MenuItem key={g} value={g}>
                    {g}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.grade && formik.errors.grade && (
                <div style={styles.error}>{formik.errors.grade}</div>
              )}
            </FormControl>
          </div>

          <SelectImage
            type="withoutTooltip"
            options={imageIds}
            selectedIds={[formik.values.imageId]}
            // TODO when check validation remember about ""
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({
                ...formik.values,
                imageId: updatedIds.length > 0 ? updatedIds[0] : "",
              })
            }
            error={formik.errors.imageId}
            touched={formik.touched.imageId}
            selectVariant={"single"}
            title={"Wybierz obrazek:"}
          />
        </div>
        <button type="submit">attach level</button>
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
  },
  formContent: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: {
    fontWeight: "bold",
  },
  error: {
    color: tokens.color.state.error,
  },
  fieldsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
  },
  blockedField: {
    width: 60,
  },
};
