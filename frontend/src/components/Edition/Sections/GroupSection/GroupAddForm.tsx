import { z, ZodError } from "zod";
import { useFormik } from "formik";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { Styles } from "../../../../utils/Styles";
import { Weekday } from "../../../../hooks/common/useGroupsData";
import { Teacher } from "../../../../hooks/Edition/useGroupsSection";

export type GroupFormValues = z.infer<typeof ValidationSchema>;

const ValidationSchema = z.object({
  startTime: z.string().min(1, "required"),
  endTime: z.string().min(1, "required"),
  teacherId: z.string().min(1, "required"),
  weekdayId: z.string().min(1, "required"),
  usosId: z.number().min(0),
});

type AddGroupFormProps = {
  handleAddGroup: (values: GroupFormValues) => void;
  createError?: string;
  weekdays: Weekday[];
  teachers: Teacher[];
};

export const AddGroupForm = ({
  handleAddGroup: handleAddGroup,
  createError,
  weekdays,
  teachers,
}: AddGroupFormProps) => {
  const formik = useFormik({
    initialValues: {
      startTime: "",
      endTime: "",
      teacherId: "",
      weekdayId: "",
      usosId: 1,
    },
    validate: (values: GroupFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }

      // TODO create subgroup validation
    },
    onSubmit: (values: GroupFormValues) => {
      handleAddGroup(values);
    },
  });

  return (
    <div style={styles.container}>
      <div style={styles.title}>Add group</div>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <TextField
            fullWidth
            name="startTime"
            label="startTime"
            variant="outlined"
            placeholder="xx:xx:xx"
            value={formik.values.startTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.startTime && formik.errors.startTime)}
            helperText={formik.touched.startTime && formik.errors.startTime}
          />

          <TextField
            fullWidth
            name="endTime"
            label="endTime"
            variant="outlined"
            placeholder="xx:xx:xx"
            value={formik.values.endTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.endTime && formik.errors.endTime)}
            helperText={formik.touched.endTime && formik.errors.endTime}
          />

          <FormControl fullWidth>
            <InputLabel>Weekday</InputLabel>
            <Select
              name="weekdayId"
              value={formik.values.weekdayId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.weekdayId && formik.errors.weekdayId,
              )}
            >
              {weekdays.map((weekday) => (
                <MenuItem key={weekday.id} value={weekday.id}>
                  {weekday.name}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.weekdayId && formik.errors.weekdayId && (
              <div style={{ color: "red" }}>{formik.errors.weekdayId}</div>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Teacher</InputLabel>
            <Select
              name="teacherId"
              value={formik.values.teacherId}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={Boolean(
                formik.touched.teacherId && formik.errors.teacherId,
              )}
            >
              {teachers.map((teacher) => (
                <MenuItem key={teacher.userId} value={teacher.userId}>
                  {teacher.fullName}
                </MenuItem>
              ))}
            </Select>
            {formik.touched.teacherId && formik.errors.teacherId && (
              <div style={{ color: "red" }}>{formik.errors.teacherId}</div>
            )}
          </FormControl>
        </div>

        <button type="submit">add group</button>
      </form>

      {createError && <p style={styles.error}>Error: {createError}</p>}
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
