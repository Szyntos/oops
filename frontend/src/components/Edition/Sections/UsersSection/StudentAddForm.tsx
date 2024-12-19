import { z, ZodError } from "zod";
import { useFormik } from "formik";
import { TextField } from "@mui/material";
import { formStyles } from "../../../../utils/utils";
import { FormError } from "../../../form/FormError";
import { FormButton } from "../../../form/FormButton";
import { getEnvVariable } from "../../../../utils/constants";

export type StudentFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  firstName: z.string().min(1, "required"),
  secondName: z.string().min(1, "required"),
  indexNumber: z.number().min(100000).max(999999),
  nick: z.string().min(1, "required"),
});

type AddStudentFormProps = {
  handleConfirm: (values: StudentFormValues) => void;
  formError?: string;
  initialValues?: StudentFormValues;
};

export const AddStudentForm = ({
  handleConfirm,
  formError,
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
            name="nick"
            label="Nick"
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
            label="Numer indeksu"
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

          <TextField
            disabled={true}
            fullWidth
            name="email"
            label="Email"
            variant="outlined"
            value={`${formik.values.indexNumber}@${getEnvVariable("VITE_EMAIL_DOMAIN")}`}
          />

          <FormError error={formError} isFormError={true} />

          <FormButton />
        </div>
      </form>
    </div>
  );
};
