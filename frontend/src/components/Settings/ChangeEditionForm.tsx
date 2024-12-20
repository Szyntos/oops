import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { Edition } from "../../contexts/userContext";
import { formStyles } from "../../utils/utils";
import { FormButton } from "../form/FormButton";
import { FormError } from "../form/FormError";

const ValidationSchema = z.object({
  editionId: z.string().min(1),
});

export type ChangeEditionFormValues = z.infer<typeof ValidationSchema>;

type ChangeEditionFormProps = {
  handleConfirm: (editionId: string) => void;
  editions: Edition[];
  initialValues?: ChangeEditionFormValues;
};

const defaultInitialValues: ChangeEditionFormValues = {
  editionId: "",
};

export const ChangeEditionForm = ({
  handleConfirm,
  editions,
  initialValues = defaultInitialValues,
}: ChangeEditionFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: ChangeEditionFormValues) => {
      const errors: FormikErrors<ChangeEditionFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }
      return errors;
    },
    onSubmit: (values: ChangeEditionFormValues) => {
      handleConfirm(values.editionId);
    },
  });

  return (
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.filedsContainer}>
          <FormControl fullWidth>
            <InputLabel
              error={Boolean(
                formik.touched.editionId && formik.errors.editionId,
              )}
            >
              Edycja
            </InputLabel>
            <Select
              label="Edycja"
              name="editionId"
              value={formik.values.editionId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.editionId && formik.errors.editionId,
              )}
            >
              {editions.map((e) => (
                <MenuItem key={e.editionId} value={e.editionId}>
                  {/* TODO change to name  */}
                  {e.editionId}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.editionId && formik.errors.editionId && (
              <FormError error={formik.errors.editionId} />
            )}
          </FormControl>

          <FormButton />
        </div>
      </form>
    </div>
  );
};
