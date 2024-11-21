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

  // order: subcategories, pure points sum, awards, bonus points sum
  const getRowValues = (row: GroupTableRow) => {
    // add subcategories, awards and sums
    const values: (number | undefined)[] = [];
    for (const category of row.categories) {
      for (const subcategory of category.subcategories) {
        values.push(subcategory.pure);
      }
      values.push(category.sums.sumOfPurePoints);
      for (const award of category.awards) {
        values.push(award.value);
      }
      values.push(category.sums.sumOfBonuses);
    }
    // add aggregate values
    const sums = getOverallSumValues(row);
    values.push(sums.purePointsSum);
    values.push(sums.bonusesSum);
    values.push(sums.overallSum);
    return values;
  };

  const getOverallSumValues = (
    row: GroupTableRow,
  ): { purePointsSum: number; bonusesSum: number; overallSum: number } => {
    let purePointsSum = 0;
    let bonusesSum = 0;
    let overallSum = 0;
    for (const category of row.categories) {
      purePointsSum += category.sums.sumOfPurePoints;
      bonusesSum += category.sums.sumOfBonuses;
      overallSum += category.sums.sumOfAll;
    }
    return { purePointsSum, bonusesSum, overallSum };
  };

  const getHeaderNames = () => {
    const headers: {
      name: string;
      subcategory?: Subcategory;
      color?: string;
    }[] = [];
    // add subcategories, awards and sums
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
        headers.push({ name: "sum of pure points", color: "blue" });
        for (const award of category.awards) {
          headers.push({ name: award.name });
        }
        headers.push({ name: "sum of bonuses", color: "blue" });
      }
    }
    // add aggregate values
    headers.push({ name: "overall pure points", color: "blue" });
    headers.push({ name: "overall bonuses", color: "blue" });
    headers.push({ name: "overall", color: "blue" });
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
                  style={{
                    ...styles.headerCell,
                    color: entry.color,
                  }}
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
