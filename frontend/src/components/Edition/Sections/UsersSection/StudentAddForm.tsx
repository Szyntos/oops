import { z, ZodError } from "zod";
import { useFormik } from "formik";
import { TextField } from "@mui/material";
import { Styles } from "../../../../utils/Styles";

export type StudentFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  firstName: z.string().min(1, "required"),
  secondName: z.string().min(1, "required"),
  indexNumber: z.number().min(100000).max(999999),
  nick: z.string().min(1, "required"),
});

type AddStudentFormProps = {
  handleConfirm: (values: StudentFormValues) => void;
  createError?: string;
  initialValues?: StudentFormValues;
};

export const AddStudentForm = ({
  handleConfirm,
  createError,
  initialValues = {
    firstName: "",
    secondName: "",
    indexNumber: 100000,
    nick: "",
  },
}: AddStudentFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: StudentFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }

      // TODO create subuser validation
    },
    onSubmit: (values: StudentFormValues) => {
      handleConfirm(values);
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.title}>Add user</div>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <TextField
            fullWidth
            name="firstName"
            label="firstName"
            variant="outlined"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.firstName && formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />

          <TextField
            fullWidth
            name="secondName"
            label="secondName"
            variant="outlined"
            value={formik.values.secondName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.secondName && formik.errors.secondName,
            )}
            helperText={formik.touched.secondName && formik.errors.secondName}
          />

          <TextField
            fullWidth
            name="nick"
            label="nick"
            variant="outlined"
            value={formik.values.nick}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.nick && formik.errors.nick)}
            helperText={formik.touched.nick && formik.errors.nick}
          />

          <TextField
            fullWidth
            name="indexNumber"
            label="indexNumber"
            variant="outlined"
            type="number"
            value={formik.values.indexNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.indexNumber && formik.errors.indexNumber,
            )}
            helperText={formik.touched.indexNumber && formik.errors.indexNumber}
          />
        </div>

        <button type="submit">confirm</button>
      </form>

      {createError && <p style={styles.error}>Error: {createError}</p>}
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
  title: { fontWeight: "bold" },
  error: { color: "red" },
};
