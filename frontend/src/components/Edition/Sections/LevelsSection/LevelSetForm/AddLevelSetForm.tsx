import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { Styles } from "../../../../../utils/Styles";
import { TextField } from "@mui/material";

const ValidationSchema = z.object({
  awardName: z.string().min(1),
  // awardType: z.string().min(1),
  // awardValue: z.number().min(0),
  // categoryId: z.string().min(1),
  // description: z.string().min(1),
  // maxUsages: z.number(),
  // imageId: z.string().min(1),
});

export type LevelSetFormValues = z.infer<typeof ValidationSchema>;

type AddLevelSetFormProps = {
  handleConfirm: (values: LevelSetFormValues) => void;
  formError?: string;
  initialValues?: LevelSetFormValues;
  title: string;
};

const defaultInitialValues: LevelSetFormValues = {
  awardName: "",
};

export const AddLevelSetForm = ({
  handleConfirm,
  formError,
  initialValues = defaultInitialValues,
  title,
}: AddLevelSetFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: LevelSetFormValues) => {
      const errors: FormikErrors<LevelSetFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }
      return errors;
    },
    onSubmit: (values: LevelSetFormValues) => {
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
            label="Award Name"
            variant="outlined"
            value={formik.values.awardName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.awardName && formik.errors.awardName)}
            helperText={formik.touched.awardName && formik.errors.awardName}
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
