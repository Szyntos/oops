import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { Edition } from "../../screens/Editions/EditionsScreen";
import { Styles } from "../../utils/Styles";

const ValidationSchema = z.object({
  editionId: z.string().min(1),
});

export type ChangeEditionFormValues = z.infer<typeof ValidationSchema>;

type AddAwardFormProps = {
  handleConfirm: (editionId: string) => void;
  formError?: string;
  editions: Edition[];
  initialValues?: ChangeEditionFormValues;
};

const defaultInitialValues: ChangeEditionFormValues = {
  editionId: "",
};

export const ChangeEditionForm = ({
  handleConfirm,
  formError,
  editions,
  initialValues = defaultInitialValues,
}: AddAwardFormProps) => {
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
    <div>
      <form onSubmit={formik.handleSubmit}>
        <FormControl fullWidth>
          <InputLabel>Edition</InputLabel>
          <Select
            name="editionId"
            value={formik.values.editionId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.editionId && formik.errors.editionId)}
          >
            {editions.map((e) => (
              <MenuItem key={e.editionId} value={e.editionId}>
                {/* TODO change to name  */}
                {e.editionId}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.editionId && formik.errors.editionId && (
            <div style={{ color: "red" }}>{formik.errors.editionId}</div>
          )}
        </FormControl>
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
  error: { color: "red" },
};
