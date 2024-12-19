import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import { Styles } from "../../../../../utils/Styles";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import { WithAddedLevelsValidateErrors } from "./AddSetForm";
import { SelectImage } from "../../../../inputs/SelectImage";
import { formStyles, GRADE_STRINGS } from "../../../../../utils/utils";
import { RowButton } from "../../CategoriesSection/AddCategoryForm/RowButton";
import { FormError } from "../../../../form/FormError";

const ValidationSchema = z.object({
  name: z.string().min(1),
  maxPoints: z.number().min(0),
  grade: z.string().min(0),
  imageId: z.string().min(1, "Musisz wybrać ikonę."),
});

export type LevelFormValues = z.infer<typeof ValidationSchema>;

type LevelFormProps = {
  handleAdd: (values: LevelFormValues) => void;
  initialValues?: LevelFormValues;
  imageIds: string[];
  validateWithAddedLevels: (
    values: LevelFormValues,
  ) => WithAddedLevelsValidateErrors;
};

const defaultInitialValues: LevelFormValues = {
  name: "",
  maxPoints: 1,
  grade: "2.0",
  imageId: "",
};

export const AddLevelForm = ({
  handleAdd,
  imageIds,
  initialValues = defaultInitialValues,
  validateWithAddedLevels,
}: LevelFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: LevelFormValues) => {
      let errors: FormikErrors<LevelFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }

      // validate with already added levels
      const { nameError, maxPointsError, gradeError, imageError } =
        validateWithAddedLevels(values);

      errors = nameError ? { ...errors, name: nameError } : errors;
      errors = maxPointsError
        ? { ...errors, maxPoints: maxPointsError }
        : errors;
      errors = gradeError ? { ...errors, grade: gradeError } : errors;
      errors = imageError ? { ...errors, imageId: imageError } : errors;

      return errors;
    },
    onSubmit: (values: LevelFormValues) => {
      handleAdd({ ...values });
    },
  });

  return (
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <div style={styles.row}>
            <TextField
              size="small"
              fullWidth
              style={styles.ordinal}
              name="ordinal"
              label="Lp."
              variant="outlined"
              value="?"
              disabled={true}
            />

            <TextField
              fullWidth
              style={styles.maxPoints}
              name="min"
              label="Min. punktów"
              variant="outlined"
              value="?"
              disabled={true}
              size="small"
            />

            <TextField
              size="small"
              fullWidth
              name="maxPoints"
              label="Max. punktów"
              variant="outlined"
              type="number"
              value={formik.values.maxPoints}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.maxPoints && formik.errors.maxPoints,
              )}
              helperText={formik.touched.maxPoints && formik.errors.maxPoints}
              style={styles.maxPoints}
            />

            <TextField
              size="small"
              fullWidth
              style={styles.text}
              name="name"
              label="Nazwa poziomu"
              variant="outlined"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <FormControl>
              <InputLabel
                error={Boolean(formik.touched.grade && formik.errors.grade)}
              >
                Ocena
              </InputLabel>
              <Select
                size="small"
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

            <div style={styles.buttonWrapper}>
              <RowButton
                onClick={() => {}}
                isDisabled={false}
                icon="add"
                type="submit"
              />
            </div>
          </div>

          <SelectImage
            type="withoutTooltip"
            options={imageIds}
            selectedIds={[formik.values.imageId]}
            // TODO when check validation remember about ""
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({
                ...formik.values,
                imageId: updatedIds.length > 0 ? updatedIds[0] : "",
              })
            }
            error={formik.errors.imageId}
            touched={formik.touched.imageId}
            selectVariant={"single"}
            title={"Wybierz ikonę:"}
          />
        </div>
      </form>
    </div>
  );
};
const styles: Styles = {
  row: {
    display: "flex",
    flexDirection: "row",
    gap: 4,
    marginTop: 12,
  },
  ordinal: {
    maxWidth: 52,
    minWidth: 52,
    width: 52,
  },
  maxPoints: {
    maxWidth: 110,
    minWidth: 110,
  },
  text: {
    flex: 1,
  },
  buttonWrapper: {
    paddingTop: 4,
  },
  errorWrapper: {
    paddingTop: 12,
  },
};
