import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { GroupTableRow, Student } from "../../../hooks/Group/useGroupTableData";
import { Styles } from "../../../utils/Styles";
import { Subcategory } from "../../../utils/utils";
import { EMPTY_FIELD_STRING } from "../../../utils/constants";

type GroupTableProps = {
  rows: GroupTableRow[];
  handleStudentClick: (student: Student) => void;
  handleSubcategoryClick: (subcategory: Subcategory) => void;
  editable: boolean;
};

export const GroupTable = ({
  rows,
  handleStudentClick,
  handleSubcategoryClick,
  editable,
}: GroupTableProps) => {
  // order: subcategories, pure points sum, awards, bonus points sum
  const getRowValues = (row: GroupTableRow) => {
    // add subcategories, awards and sums
    const values: (number | string | boolean | undefined)[] = [];
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
    // add grade values
    values.push(row.student.computedValues.level.levelName);
    values.push(row.student.computedValues.level.grade);
    values.push(
      row.student.computedValues.endOfLabsLevelsReached ? "tak" : "nie",
    );
    values.push(
      row.student.computedValues.projectPointsThresholdReached ? "tak" : "nie",
    );
    values.push(row.student.computedValues.computedGrade.toFixed(1));
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
        headers.push({ name: "Suma `czystych` punktów", color: "blue" });
        for (const award of category.awards) {
          headers.push({ name: award.name });
        }
        headers.push({ name: "Suma bonusów", color: "blue" });
      }
    }
    // add aggregate values
    headers.push({ name: "Zagregowane `czyste` punkty", color: "blue" });
    headers.push({ name: "Zagregowane bonusy", color: "blue" });
    headers.push({ name: "Zagregowane", color: "blue" });
    // levels...
    headers.push({ name: "Poziom", color: "blue" });
    headers.push({ name: "Ocena za poziom", color: "blue" });
    headers.push({ name: "Koniec laboratoriów", color: "blue" });
    headers.push({ name: "Punkty za projekt", color: "blue" });
    headers.push({ name: "Wyliczona ocena", color: "blue" });
    return headers;
  };

  return (
    <TableContainer component={Paper} sx={{ maxHeight: 560 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell style={styles.headerStudentCell}>Student</TableCell>
            {getHeaderNames().map((entry, index) => (
              <TableCell
                key={index}
                onClick={() => {
                  if (entry.subcategory && editable) {
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
                onClick={() => {
                  if (editable) {
                    handleStudentClick(row.student);
                  }
                }}
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
