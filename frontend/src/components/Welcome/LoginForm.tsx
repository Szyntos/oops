import { FormikErrors, useFormik } from "formik";
import { z, ZodError } from "zod";
import { TextField } from "@mui/material";
import { FormError } from "../form/FormError";
import { CustomButton } from "../CustomButton";
import { formStyles } from "../../utils/utils";

const ValidationSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(6, "Hasło musi zawierać co najmniej 6 znaków"),
});

export type LoginFormValues = z.infer<typeof ValidationSchema>;

type LoginFormProps = {
  handleLoginClick: (values: LoginFormValues) => void;
  handleResetPasswordClick: (values: LoginFormValues) => void;
  formError?: string;
};

export const LoginForm = ({
  handleLoginClick,
  handleResetPasswordClick,
  formError,
}: LoginFormProps) => {
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validate: (values: LoginFormValues) => {
      const errors: FormikErrors<LoginFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }
      return errors;
    },
    onSubmit: handleLoginClick,
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <div style={formStyles.fieldsContainer}>
        <TextField
          fullWidth
          label="Email"
          type="email"
          name="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />

        <TextField
          fullWidth
          label="Hasło"
          type="password"
          name="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />

        <FormError error={formError} isFormError={true} />

        <div
          style={{
            display: "flex",
            justifyContent: "right",
            margin: 10,
            gap: 12,
          }}
        >
          <CustomButton onClick={() => handleResetPasswordClick(formik.values)}>
            Resetuj hasło
          </CustomButton>
          <CustomButton onClick={() => handleLoginClick(formik.values)}>
            Zaloguj się
          </CustomButton>
        </div>
      </div>
    </form>
  );
};
