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
import { IconMapper } from "../../IconMapper";
import { tokens } from "../../../tokens";
import { HooverWrapper } from "../../HooverWrapper";
import { CustomText } from "../../CustomText";
import { pathsGenerator } from "../../../router/paths";
import { useNavigate } from "react-router-dom";

type GroupTableProps = {
  rows: GroupTableRow[];
  handleStudentClick: (student: Student) => void;
  handleSubcategoryClick: (subcategory: Subcategory) => void;
  editable: boolean;
  showAggregatedValues: boolean;
};

const OPACITY = 0.7;

export const GroupTable = ({
  rows,
  handleSubcategoryClick,
  editable,
  showAggregatedValues,
}: GroupTableProps) => {
  type CellValueType = {
    data: number | string | boolean | undefined;
    minWidth?: number;
    colored?: boolean;
    clickable?: boolean;
  };

  const navigate = useNavigate();

  // order: subcategories, pure points sum, awards, bonus points sum
  const getRowValues = (row: GroupTableRow): CellValueType[] => {
    // add subcategories, awards and sums
    const values: CellValueType[] = [];
    for (const category of row.categories) {
      for (const subcategory of category.subcategories) {
        values.push({ data: subcategory.pure });
      }
      values.push({ data: category.sums.sumOfPurePoints, colored: true });
      for (const award of category.awards) {
        values.push({ data: award.value });
      }
      values.push({ data: category.sums.sumOfBonuses, colored: true });
    }
    if (showAggregatedValues) {
      // add aggregate values
      const sums = getOverallSumValues(row);
      values.push({ data: sums.purePointsSum, colored: true });
      values.push({ data: sums.bonusesSum, colored: true });
      values.push({ data: sums.overallSum, colored: true });
      // add grade values
      values.push({
        data: row.student.computedValues.level.levelName,
        colored: true,
      });
      values.push({
        data: row.student.computedValues.level.grade,
        colored: true,
      });
      values.push({
        data: Boolean(row.student.computedValues.endOfLabsLevelsReached),
      });
      values.push({
        data: Boolean(row.student.computedValues.projectPointsThresholdReached),
      });
      values.push({
        data: row.student.computedValues.computedGrade.toFixed(1),
        colored: true,
      });
    }

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

  type HeaderCellType = {
    subcategory?: Subcategory;
    cell: CellValueType;
  };
  const getHeaderNames = () => {
    const headers: HeaderCellType[] = [];
    // add subcategories, awards and sums
    if (rows.length > 0) {
      const row = rows[0];
      for (const category of row.categories) {
        for (const subcategory of category.subcategories) {
          headers.push({
            subcategory: {
              name: subcategory.subcategoryName,
              id: subcategory.subcategoryId,
              maxPoints: subcategory.maxPoints,
              categoryId: parseInt(subcategory.categoryId),
            },
            cell: {
              data: subcategory.subcategoryName,
            },
          });
        }
        headers.push({ cell: { data: "Zdobyte punkty", colored: true } });
        for (const award of category.awards) {
          headers.push({ cell: { data: award.name } });
        }
        headers.push({ cell: { data: "Zdobyte łupy", colored: true } });
      }
    }
    if (showAggregatedValues) {
      // add aggregate values
      headers.push({ cell: { data: "dobyte punkty", colored: true } });
      headers.push({ cell: { data: "Zagregowane łupy", colored: true } });
      headers.push({ cell: { data: "Razem", colored: true } });
      // levels...
      headers.push({ cell: { data: "Poziom", colored: true } });
      headers.push({ cell: { data: "Przewidywana ocena", colored: true } });
      headers.push({ cell: { data: "Status wyklucia", colored: true } });
      headers.push({ cell: { data: "Status projektu", colored: true } });
      headers.push({ cell: { data: "Ocena końcowa", colored: true } });
    }

    return headers;
  };

  const getCellContent = (
    value: string | number | boolean | undefined | null,
  ) => {
    if (value === null || value === undefined) {
      return EMPTY_FIELD_STRING;
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number") {
      return value.toFixed(2);
    }
    if (typeof value === "boolean") {
      return (
        <IconMapper
          icon={value ? "yes" : "no"}
          color={value ? tokens.color.state.success : tokens.color.state.error}
        />
      );
    }
    return <CustomText>{EMPTY_FIELD_STRING}</CustomText>;
  };

  const getCellColor = (cell: CellValueType) => {
    return cell.colored ? tokens.color.accent.light : undefined;
  };

  // TODO last 4 columns could be centered

  return (
    <TableContainer component={Paper} sx={{ maxHeight: "100%" }}>
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
                  color: getCellColor(entry.cell),
                  cursor: entry.subcategory && editable ? "pointer" : "auto",
                }}
                align="center"
              >
                {entry.subcategory && editable ? (
                  <HooverWrapper opacity={OPACITY}>
                    <div>{entry.cell.data}</div>
                  </HooverWrapper>
                ) : (
                  entry.cell.data
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={row.student.id}>
              <TableCell
                style={{
                  ...styles.regularStudentCell,
                  cursor: "pointer",
                }}
                onClick={() => {
                  navigate(
                    pathsGenerator.teacher.StudentProfile(row.student.id),
                  );
                }}
              >
                <HooverWrapper opacity={OPACITY}>
                  <div>
                    {index + 1}. {row.student.fullName}
                  </div>
                </HooverWrapper>
              </TableCell>
              {getRowValues(row).map((value, index) => (
                <TableCell
                  key={`${index}`}
                  align="center"
                  style={{ color: getCellColor(value) }}
                >
                  {getCellContent(value.data)}
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
