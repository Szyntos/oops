import { FormikErrors, useFormik } from "formik";
import { z, ZodError } from "zod";
import { TextField } from "@mui/material";
import { FormError } from "../form/FormError";
import { CustomButton } from "../CustomButton";
import { formErrors, formStyles } from "../../utils/utils";
import { Styles } from "../../utils/Styles";

const ValidationSchema = z.object({
  email: z.string().email("nieprawidłowy adres email"),
  password: z.string().min(1, formErrors.required),
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
          error={Boolean(formik.touched.email && formik.errors.email)}
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
          error={Boolean(formik.touched.password && formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
        />

        <FormError error={formError} isFormError={true} />

        <div style={styles.buttonsContainer}>
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

const styles: Styles = {
  buttonsContainer: {
    display: "flex",
    justifyContent: "right",
    margin: 10,
    gap: 12,
  },
};
