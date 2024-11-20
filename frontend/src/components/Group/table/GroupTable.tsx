import {
  createTheme,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
} from "@mui/material";
import { GroupTableRow, Student } from "../../../hooks/Group/useGroupTableData";
import { Styles } from "../../../utils/Styles";
import { Subcategory } from "../../../utils/utils";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";

type GroupTableProps = {
  rows: GroupTableRow[];
  handleStudentClick: (student: Student) => void;
  handleSubcategoryClick: (subcategory: Subcategory) => void;
};

export const GroupTable = ({
  rows,
  handleStudentClick,
  handleSubcategoryClick,
}: GroupTableProps) => {
  const darkTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });

  const getRowValues = (row: GroupTableRow) => {
    const values: (number | undefined)[] = [];
    for (const category of row.categories) {
      for (const subcategory of category.subcategories) {
        values.push(subcategory.pure);
      }
      for (const award of category.awards) {
        values.push(award.value);
      }
    }
    return values;
  };

  const getHeaderNames = () => {
    const headers: { name: string; subcategory: Subcategory | undefined }[] =
      [];
    if (rows.length > 0) {
      const row = rows[0];
      for (const category of row.categories) {
        for (const subcategory of category.subcategories) {
          headers.push({
            name: subcategory.subcategoryName,
            subcategory: {
              name: subcategory.subcategoryName,
              id: subcategory.subcategoryId,
              maxPoints: subcategory.maxPoints,
              categoryId: parseInt(subcategory.categoryId),
            },
          });
        }
        for (const award of category.awards) {
          headers.push({ name: award.name, subcategory: undefined });
        }
      }
    }
    return headers;
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <TableContainer component={Paper} sx={{ maxHeight: 560 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={styles.headerStudentCell}>Student</TableCell>
              {getHeaderNames().map((entry, index) => (
                <TableCell
                  key={index}
                  onClick={() => {
                    if (entry.subcategory) {
                      handleSubcategoryClick(entry.subcategory);
                    }
                  }}
                  style={styles.headerCell}
                >
                  {entry.name}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.student.id}>
                <TableCell
                  style={styles.regularStudentCell}
                  onClick={() => handleStudentClick(row.student)}
                >
                  {index + 1}. {row.student.fullName}
                </TableCell>
                {getRowValues(row).map((value, index) => (
                  <TableCell key={`${index}`}>
                    {value ?? EMPTY_FIELD_STRING}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ThemeProvider>
  );
};

const styles: Styles = {
  headerStudentCell: {
    fontWeight: "bold",
    fontSize: 16,
    position: "sticky",
    top: 0,
    left: 0,
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    backgroundColor: "black",
    zIndex: 2,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 16,
    position: "sticky",
    top: 0,
    backgroundColor: "black",
    zIndex: 1,
  },
  regularStudentCell: {
    position: "sticky",
    left: 0,
    width: 200,
    minWidth: 200,
    maxWidth: 200,
    backgroundColor: "black",
    zIndex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
};
