import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { TextField } from "@mui/material";
import { Styles } from "../../utils/Styles";
import { PointsItem } from "../../hooks/Group/useGroupScreenData";

const ValidationSchema = z.object({
  points: z.number().min(0, "<0").nullable(),
});

export type SubcategoryPointsFormValues = z.infer<typeof ValidationSchema>;

type SubcategoryPointsFormProps = {
  points: number | undefined;
  student: PointsItem["student"];
  maxPoints: number;
  onUpdate: (studentId: string, points: number | null) => void;
  ordinal: number;
};

export const PointsRow = ({
  onUpdate,
  points,
  student,
  maxPoints,
  ordinal,
}: SubcategoryPointsFormProps) => {
  const formik = useFormik({
    initialValues: { points: points ?? null },
    validate: (values: SubcategoryPointsFormValues) => {
      const errors: FormikErrors<SubcategoryPointsFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }

      // custom validation
      if (values.points && values.points > maxPoints) {
        errors.points = `>${maxPoints}`;
      }
      return errors;
    },
    onSubmit: () => {},
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? null : Number(e.target.value);
    formik.setFieldValue("points", newValue);
    onUpdate(student.id, newValue);
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <div style={styles.container}>
        <div style={styles.text}>
          {ordinal}. {student.fullName}
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
