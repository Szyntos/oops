import { FormikErrors, useFormik } from "formik";
import { z, ZodError } from "zod";
import { TextField } from "@mui/material";
import { FormError } from "../form/FormError";
import { formStyles } from "../../utils/utils";
import { FormButton } from "../form/FormButton";

const ValidationSchema = z.object({
  password: z.string().min(6, "hasło musi zawierać co najmniej 6 znaków"),
});

export type ResetFormValues = z.infer<typeof ValidationSchema>;

type ResetFormProps = {
  handleConfirmClick: (values: ResetFormValues) => void;
  formError?: string;
};

export const ResetPasswordForm = ({
  handleConfirmClick,
  formError,
}: ResetFormProps) => {
  const formik = useFormik({
    initialValues: {
      password: "",
    },
    validate: (values: ResetFormValues) => {
      const errors: FormikErrors<ResetFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }
      return errors;
    },
    onSubmit: handleConfirmClick,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div style={formStyles.fieldsContainer}>
        <TextField
          fullWidth
          label="Nowe hasło"
          type="password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.password && formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />

        <FormError error={formError} isFormError={true} />

        <FormButton />
      </div>
    </form>
  );
};
