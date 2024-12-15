import { z, ZodError } from "zod";
import { useFormik } from "formik";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Styles } from "../../../utils/Styles";
import { GRADE_STRINGS } from "../../../utils/utils";
import { tokens } from "../../../tokens";

export type OverrideGradeFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  grade: z.string().min(1, "required"),
});

type OverrideGradeFormProps = {
  handleConfirm: (values: OverrideGradeFormValues) => void;
  formError: string | undefined;
  initGrade: string;
  title: string;
};

export const OverrideGradeForm = ({
  handleConfirm,
  formError,
  title,
  initGrade,
}: OverrideGradeFormProps) => {
  const formik = useFormik({
    initialValues: {
      grade: initGrade,
    },
    validate: (values: OverrideGradeFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }
    },
    onSubmit: (values: OverrideGradeFormValues) => {
      handleConfirm(values);
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <form onSubmit={formik.handleSubmit}>
        <div style={styles.fieldsContainer}>
          <FormControl>
            <InputLabel>Nowa ocena</InputLabel>
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
          <button type="submit">Potwierdź</button>
        </div>
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
  },
  fieldsContainer: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontWeight: "bold",
  },
  error: {
    color: tokens.color.state.error,
  },
};
