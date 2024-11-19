import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { TextField } from "@mui/material";
import { Styles } from "../../utils/Styles";
import { Student } from "../../hooks/Group/useGroupScreenData";

const ValidationSchema = z.object({
  points: z.number().min(0, "<0").nullable(),
});

export type SubcategoryPointsFormValues = z.infer<typeof ValidationSchema>;

export type PointsRowData = {
  student: Student;
  points: number | undefined;
};

type SubcategoryPointsFormProps = {
  data: PointsRowData;
  onPointsChange: (data: PointsRowData) => void;
  ordinal: number;
  maxPoints: number;
};

export const PointsRow = ({
  onPointsChange,
  data,
  maxPoints,
  ordinal,
}: SubcategoryPointsFormProps) => {
  const formik = useFormik({
    initialValues: { points: data.points ?? null },
    validate: (values: SubcategoryPointsFormValues) => {
      const errors: FormikErrors<SubcategoryPointsFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }
      if (values.points && values.points > maxPoints) {
        errors.points = `>${maxPoints}`;
      }
      return errors;
    },
    onSubmit: () => {},
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedPoints = e.target.value === "" ? null : Number(e.target.value);
    formik.setFieldValue("points", updatedPoints);
    onPointsChange({ ...data, points: updatedPoints ?? undefined });
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div style={styles.container}>
        <div style={styles.text}>
          {ordinal}. {data.student.fullName}
        </div>
        <TextField
          style={styles.points}
          name="points"
          variant="outlined"
          type="number"
          value={formik.values.points || ""}
          onChange={handleOnChange}
          onBlur={formik.handleBlur}
          error={Boolean(formik.touched.points && formik.errors.points)}
          helperText={formik.touched.points && formik.errors.points}
        />
      </div>
    </form>
  );
};

const styles: Styles = {
  container: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    alignContent: "center",
    justifyContent: "space-between",
  },
  text: {
    display: "flex",
    alignItems: "center",
  },
  points: {
    width: 80,
  },
};
