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
import { Student, Teacher } from "../../../../hooks/Edition/useGroupsSection";
import { StudentSelection } from "./StudentSelection/StudentSelection";
import { useRef, useState } from "react";

export type GroupFormValues = z.infer<typeof ValidationSchema>;

const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

const ValidationSchema = z
  .object({
    startTime: z
      .string()
      .min(1, { message: "required " })
      .regex(timeRegex, { message: "Start Time must be in hh:mm format" }),
    endTime: z
      .string()
      .min(1, { message: "required " })
      .regex(timeRegex, { message: "End Time must be in hh:mm format" }),
    weekdayId: z.string().min(1, { message: "required" }),
    teacherId: z.string().min(1, { message: "required" }),
    usosId: z
      .number()
      .min(1, { message: "USOS ID must be a non-negative number" }),
  })
  .refine(
    (data) => {
      const [startHour, startMinute] = data.startTime.split(":").map(Number);
      const [endHour, endMinute] = data.endTime.split(":").map(Number);

      if (startHour < endHour) return true;
      if (startHour === endHour && startMinute < endMinute) return true;
      return false;
    },
    {
      message: "Start Time must be before End Time",
      path: ["endTime"],
    },
  );

type AddGroupFormProps = {
  handleAddGroup: (
    values: GroupFormValues,
    selectedStudents: Student[],
  ) => void;
  createError?: string;
  weekdays: Weekday[];
  teachers: Teacher[];
  students: Student[];
  variant?: AddGroupVariant;
  handleUploadStudents?: (editionId: number, formData: FormData) => void;
  editionId: number;
  initSelected?: Student[];
  initValues?: GroupFormValues;
  title: string;
};

export type AddGroupVariant = "select" | "import";

export const AddGroupForm = ({
  handleAddGroup,
  createError,
  weekdays,
  teachers,
  students,
  variant: variant = "import",
  handleUploadStudents,
  editionId,
  initSelected = [],
  initValues = {
    startTime: "",
    endTime: "",
    weekdayId: "",
    teacherId: "",
    usosId: 1,
  },
  title,
}: AddGroupFormProps) => {
  const formik = useFormik({
    initialValues: {
      startTime: initValues.startTime,
      endTime: initValues.endTime,
      weekdayId: initValues.weekdayId,
      teacherId: initValues.teacherId,
      usosId: initValues.usosId,
    },
    validate: (values: GroupFormValues) => {
      try {
        ValidationSchema.parse(values);
      } catch (error) {
        if (error instanceof ZodError) {
          return error.formErrors.fieldErrors;
        }
      }
    },
    onSubmit: (values: GroupFormValues) => {
      const groupValues = {
        startTime: values.startTime + ":00",
        endTime: values.endTime + ":00",
        weekdayId: values.weekdayId,
        teacherId: values.teacherId,
        usosId: values.usosId,
      };
      handleAddGroup(groupValues, selectedStudents);
    },
  });

  // SELECT VARIANT ----------------------------------------------------
  const [selectedStudents, setSelectedStudents] =
    useState<Student[]>(initSelected);

  const studentsToSelect = students.filter((s) => {
    const isSelected =
      selectedStudents.find((ss) => ss.userId === s.userId) !== undefined;
    return !isSelected;
  });

  const handleAdd = (student: Student) => {
    setSelectedStudents((prev) => [...prev, student]);
  };

  const handleDelete = (student: Student) => {
    setSelectedStudents((prev) =>
      prev.filter((s) => s.userId !== student.userId),
    );
  };

  // IMPORT VARIANT ------------------------------------------------------

  const [importedFile, setImportedFile] = useState("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const formData = new FormData();
      formData.append("file", files[0]);
      setImportedFile(files[0].name);
      formData.append("fileType", "text/csv");
      // I don't know how to fix it other way
      const uploadedStudents: Student[] = (await handleUploadStudents?.(
        editionId,
        formData,
      )) as unknown as Student[];
      setSelectedStudents(uploadedStudents);
      event.target.value = "";
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>{title}</div>
      <form onSubmit={formik.handleSubmit}>
        <div>
          <TextField
            fullWidth
            name="startTime"
            label="Start Time"
            variant="outlined"
            placeholder="hh:mm"
            value={formik.values.startTime}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.startTime && formik.errors.startTime)}
            helperText={formik.touched.startTime && formik.errors.startTime}
          />

          <TextField
            fullWidth
            name="endTime"
            label="End Time"
            variant="outlined"
            placeholder="hh:mm"
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

          <TextField
            fullWidth
            name="usosId"
            label="usosId"
            variant="outlined"
            type="number"
            value={formik.values.usosId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.usosId && formik.errors.usosId)}
            helperText={formik.touched.usosId && formik.errors.usosId}
          />

          {variant === "select" ? (
            <StudentSelection
              students={studentsToSelect}
              selectedStudents={selectedStudents}
              handleAdd={handleAdd}
              handleDelete={handleDelete}
            />
          ) : (
            <div>
              <button type="button" onClick={handleUploadClick}>
                import students
              </button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,text/csv"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              {importedFile && <div>imported file: {importedFile}</div>}
              {selectedStudents.map((s, index) => (
                <div>
                  {index + 1}. {s.fullName}
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit">confirm</button>
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
