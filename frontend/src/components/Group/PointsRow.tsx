import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { TextField } from "@mui/material";
import { Styles } from "../../utils/Styles";
import { PointsItem } from "../../hooks/Group/useGroupScreenData";

const ValidationSchema = z.object({
  points: z.number().min(0).nullable(),
});

export type SubcategoryPointsFormValues = z.infer<typeof ValidationSchema>;

type SubcategoryPointsFormProps = {
  points: number | undefined;
  student: PointsItem["student"];
  onUpdate: (studentId: string, points: number | null) => void;
};

const validate = (values: SubcategoryPointsFormValues) => {
  const errors: FormikErrors<SubcategoryPointsFormValues> = {};
  try {
    ValidationSchema.parse(values);
  } catch (error) {
    if (error instanceof ZodError) {
      Object.assign(errors, error.formErrors.fieldErrors);
    }
  }

  // max subcategory points
  return errors;
};

export const PointsRow = ({
  onUpdate,
  points,
  student,
}: SubcategoryPointsFormProps) => {
  const formik = useFormik({
    initialValues: { points: points ?? null },
    validate,
    onSubmit: () => {},
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? null : Number(e.target.value);
    formik.setFieldValue("points", newValue);
    onUpdate(student.id, newValue);
  };

  return (
    <div style={styles.container}>
      <form onSubmit={formik.handleSubmit}>
        <div>{student.fullName}</div>
        <TextField
          fullWidth
          name="points"
          label="points"
          variant="outlined"
          type="number"
          value={formik.values.points || ""}
          onChange={handleOnChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.points && formik.errors.points)}
          helperText={formik.touched.points && formik.errors.points}
        />
      </form>
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
};
