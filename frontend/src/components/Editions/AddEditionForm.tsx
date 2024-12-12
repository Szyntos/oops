import { z, ZodError } from "zod";
import { useFormik } from "formik";
import { TextField } from "@mui/material";
import { Styles } from "../../utils/Styles";
import { tokens } from "../../tokens";

export type EditionFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  name: z.string().min(1, "required"),
  // TODO validation
  year: z.number().min(2000).max(2500),
});

const defaultValues = {
  name: "",
  year: 0,
};

type AddCategoryFormProps = {
  handleAddEdition: (values: EditionFormValues) => void;
  createError?: string;
  title: string;
  initialValues?: EditionFormValues;
};

export const AddEditionForm = ({
  handleAddEdition,
  createError,
  initialValues = defaultValues,
  title,
}: AddCategoryFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: EditionFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }
    },
    onSubmit: (values: EditionFormValues) => {
      handleAddEdition(values);
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <TextField
            fullWidth
            name="name"
            label="nazwa"
            variant="outlined"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />

          <TextField
            fullWidth
            name="year"
            label="year"
            variant="outlined"
            type="number"
            value={formik.values.year}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.year && formik.errors.year)}
            helperText={formik.touched.year && formik.errors.year}
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
    width: 500,
  },
  title: {
    fontWeight: "bold",
  },
  error: {
    color: tokens.color.state.error,
  },
};
