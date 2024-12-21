import { z, ZodError } from "zod";
import { FormikErrors, useFormik } from "formik";
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { AwardTypeType } from "../../../../../__generated__/schema.graphql.types";
import { Category } from "../../../../../hooks/Edition/categories/useCategoriesSection";
import { SelectImage } from "../../../../inputs/SelectImage";
import { FormButton } from "../../../../form/FormButton";
import { FormError } from "../../../../form/FormError";
import {
  formStyles,
  mapAwardTypeToPolish,
  MULTIPLICATIVE_TYPE_STRING,
} from "../../../../../utils/utils";

const ValidationSchema = z.object({
  awardName: z.string().min(1),
  awardType: z.string().min(1),
  awardValue: z.number().min(0),
  categoryId: z.string().min(1),
  description: z.string().min(1),
  maxUsages: z.union([z.number().min(0), z.literal("")]),
  imageId: z.string().min(1),
  hasAwardsBundleCount: z.boolean(),
});

export type AwardFormValues = z.infer<typeof ValidationSchema>;

type AddAwardFormProps = {
  handleConfirm: (values: AwardFormValues) => void;
  formError?: string;
  categories: Category[];
  initialValues?: AwardFormValues;
  imageIds: string[];
};

const defaultInitialValues: AwardFormValues = {
  awardName: "",
  awardType: MULTIPLICATIVE_TYPE_STRING,
  awardValue: 1,
  categoryId: "",
  description: "",
  maxUsages: "",
  imageId: "",
  hasAwardsBundleCount: false,
};

const awardTypes = Object.values(AwardTypeType);

export const AddAwardForm = ({
  handleConfirm,
  categories,
  imageIds,
  formError,
  initialValues = defaultInitialValues,
}: AddAwardFormProps) => {
  const formik = useFormik({
    initialValues,
    validate: (values: AwardFormValues) => {
      const errors: FormikErrors<AwardFormValues> = {};
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          Object.assign(errors, error.formErrors.fieldErrors);
        }
      }
      if (values.hasAwardsBundleCount && values.maxUsages === "") {
        errors.maxUsages = "wymagane";
      }
      return errors;
    },
    onSubmit: (values: AwardFormValues) => {
      handleConfirm({ ...values });
    },
  });

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    formik.setValues({
      ...formik.values,
      hasAwardsBundleCount: isChecked,
      maxUsages: isChecked ? formik.values.maxUsages : "",
    });

    formik.validateForm();
  };

  return (
    <div style={formStyles.formContainer}>
      <form onSubmit={formik.handleSubmit}>
        <div style={formStyles.fieldsContainer}>
          <TextField
            fullWidth
            name="awardName"
            label="Nazwa nagrody"
            variant="outlined"
            value={formik.values.awardName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.awardName && formik.errors.awardName)}
            helperText={formik.touched.awardName && formik.errors.awardName}
          />

          <FormControl fullWidth>
            <InputLabel
              error={Boolean(
                formik.touched.categoryId && formik.errors.categoryId,
              )}
            >
              Kategoria
            </InputLabel>
            <Select
              label="Kategoria"
              name="categoryId"
              value={formik.values.categoryId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.categoryId && formik.errors.categoryId,
              )}
            >
              {categories.map((cat) => (
                <MenuItem
                  key={cat.category.categoryId}
                  value={cat.category.categoryId}
                >
                  {cat.category.categoryName}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.categoryId && formik.errors.categoryId && (
              <FormError error={formik.errors.categoryId} />
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel
              error={Boolean(
                formik.touched.awardType && formik.errors.awardType,
              )}
            >
              Typ nagrody
            </InputLabel>
            <Select
              label="Typ nagrody"
              name="awardType"
              value={formik.values.awardType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.awardType && formik.errors.awardType,
              )}
            >
              {awardTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {mapAwardTypeToPolish(type)}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.awardType && formik.errors.awardType && (
              <FormError error={formik.errors.awardType} />
            )}
          </FormControl>

          <TextField
            fullWidth
            name="awardValue"
            label={
              formik.values.awardType === MULTIPLICATIVE_TYPE_STRING
                ? "Mnożnik"
                : "Wartość"
            }
            type="number"
            variant="outlined"
            value={formik.values.awardValue}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.awardValue && formik.errors.awardValue,
            )}
            helperText={formik.touched.awardValue && formik.errors.awardValue}
          />

          <TextField
            fullWidth
            name="description"
            label="Opis"
            variant="outlined"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(
              formik.touched.description && formik.errors.description,
            )}
            helperText={formik.touched.description && formik.errors.description}
          />

          <SelectImage
            type="withoutTooltip"
            options={imageIds}
            selectedIds={[formik.values.imageId.toString()]}
            onSelectClick={(updatedIds: string[]) =>
              formik.setValues({
                ...formik.values,
                imageId: updatedIds.length > 0 ? updatedIds[0] : "",
              })
            }
            error={formik.errors.imageId}
            touched={formik.touched.imageId}
            selectVariant={"single"}
            title="Wybierz grafikę:"
          />

          <FormControlLabel
            control={
              <Switch
                checked={formik.values.hasAwardsBundleCount}
                onChange={handleSwitchChange}
              />
            }
            label="Posiada ograniczenie liczby sztuk przydzielonych nagród"
          />

          {formik.values.hasAwardsBundleCount && (
            <TextField
              fullWidth
              name="maxUsages"
              label="Maksymalna liczba użyć"
              type="number"
              variant="outlined"
              value={formik.values.maxUsages}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.maxUsages && formik.errors.maxUsages,
              )}
              helperText={formik.touched.maxUsages && formik.errors.maxUsages}
            />
          )}

          <FormError error={formError} isFormError={true} />

          <FormButton />
        </div>
      </form>
    </div>
  );
};
