import { z, ZodError } from "zod";
import { useFormik } from "formik";
import { TextField } from "@mui/material";
import { formStyles } from "../../../../utils/utils";
import { FormButton } from "../../../form/FormButton";
import { FormError } from "../../../form/FormError";

export type TeacherFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  firstName: z.string().min(1, "required"),
  secondName: z.string().min(1, "required"),
  email: z.string().email(),
});

type AddTeacherFormProps = {
  handleConfirm: (values: TeacherFormValues) => void;
  formError?: string;
  initialValues?: TeacherFormValues;
};

export const AddTeacherForm = ({
  handleConfirm,
  formError,
  initialValues = {
    firstName: "",
    secondName: "",
    email: "",
  },
}: AddTeacherFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: TeacherFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }

      // TODO create subuser validation
    },
    onSubmit: (values: TeacherFormValues) => {
      handleConfirm(values);
    },
  });

  return (
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <TextField
            fullWidth
            name="firstName"
            label="Imię"
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
            label="Nazwisko"
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
            name="email"
            label="Email"
            variant="outlined"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.email && formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <FormError error={formError} isFormError={true} />

          <FormButton />
        </div>
      </form>
    </div>
  );
};
