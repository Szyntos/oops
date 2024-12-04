import { z, ZodError } from "zod";
import { useFormik } from "formik";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { Styles } from "../../../utils/Styles";
import { Group } from "./ChangeGroupDialog";

export type ChangeGroupFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  groupId: z.string().min(1, "required"),
});

type ChangeGroupFormProps = {
  handleConfirm: (values: ChangeGroupFormValues) => void;
  formError: string | undefined;
  initGroupId: string;
  title: string;
  groups: Group[];
};

export const ChangeGroupForm = ({
  handleConfirm,
  formError,
  title,
  groups,
  initGroupId: groupId,
}: ChangeGroupFormProps) => {
  const formik = useFormik({
    initialValues: {
      groupId,
    },
    validate: (values: ChangeGroupFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }
    },
    onSubmit: (values: ChangeGroupFormValues) => {
      handleConfirm(values);
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <form onSubmit={formik.handleSubmit}>
        <FormControl fullWidth>
          <InputLabel>Group</InputLabel>
          <Select
            name="groupId"
            value={formik.values.groupId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.groupId && formik.errors.groupId)}
          >
            {groups.map((group) => (
              <MenuItem key={group.groupsId} value={group.groupsId}>
                {group.generatedName}
              </MenuItem>
            ))}
          </Select>
          {formik.touched.groupId && formik.errors.groupId && (
            <div style={{ color: "red" }}>{formik.errors.groupId}</div>
          )}
        </FormControl>
        <button type="submit">potwiedź</button>
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
    border: "1px solid black",
  },
  title: { fontWeight: "bold" },
  error: { color: "red" },
};
