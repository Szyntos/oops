import { z, ZodError } from "zod";
import { useFormik } from "formik";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { formStyles, GRADE_STRINGS } from "../../../utils/utils";
import { FormError } from "../../form/FormError";
import { FormButton } from "../../form/FormButton";

export type OverrideGradeFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  grade: z.string().min(1, "required"),
});

type OverrideGradeFormProps = {
  handleConfirm: (values: OverrideGradeFormValues) => void;
  formError: string | undefined;
  initGrade: string;
};

export const OverrideGradeForm = ({
  handleConfirm,
  formError,
  initGrade,
}: OverrideGradeFormProps) => {
  const formik = useFormik({
    initialValues: {
      grade: initGrade,
    },
    validate: (values: OverrideGradeFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }
    },
    onSubmit: (values: OverrideGradeFormValues) => {
      handleConfirm(values);
    },
  });

  return (
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <FormControl>
            <InputLabel
              error={Boolean(formik.touched.grade && formik.errors.grade)}
            >
              Nowa ocena
            </InputLabel>
            <Select
              name="grade"
              value={formik.values.grade}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.grade && formik.errors.grade)}
            >
              {GRADE_STRINGS.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.grade && formik.errors.grade && (
              <FormError error={formik.errors.grade} />
            )}
          </FormControl>

          <FormButton />
        </div>
      </form>
      <FormError error={formError} />
    </div>
  );
};
