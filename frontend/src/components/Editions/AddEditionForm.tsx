import { z, ZodError } from "zod";
import { useFormik } from "formik";
import { TextField } from "@mui/material";
import { formErrors, formStyles } from "../../utils/utils";
import { FormError } from "../form/FormError";
import { FormButton } from "../form/FormButton";

export type EditionFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  name: z.string().min(1, formErrors.required),
  year: z
    .number()
    .min(2000, formErrors.minNumber(2000))
    .max(2500, formErrors.maxNumber(2500)),
});

const defaultValues = {
  name: "",
  year: 0,
};

type AddCategoryFormProps = {
  handleAddEdition: (values: EditionFormValues) => void;
  createError?: string;
  initialValues?: EditionFormValues;
};

export const AddEditionForm = ({
  handleAddEdition,
  createError,
  initialValues = defaultValues,
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
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <TextField
            fullWidth
            name="name"
            label="Nazwa"
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
            label="Rok"
            variant="outlined"
            type="number"
            value={formik.values.year}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.year && formik.errors.year)}
            helperText={formik.touched.year && formik.errors.year}
          />

          <FormError error={createError} isFormError={true} />

          <FormButton />
        </div>
      </form>
    </div>
  );
};
