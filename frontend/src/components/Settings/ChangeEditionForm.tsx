import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { MenuItem, FormControl, InputLabel, Select } from "@mui/material";
import { Edition } from "../../contexts/userContext";
import { Styles } from "../../utils/Styles";

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
    <form onSubmit={formik.handleSubmit}>
      <div style={styles.container}>
        <FormControl fullWidth>
          <InputLabel>Edition</InputLabel>
          <Select
            name="Id edycji"
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
        <button type="submit">potwierdź</button>
      </div>
    </form>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    gap: 4,
  },
};
