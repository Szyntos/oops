import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Points } from "../../../hooks/StudentProfile";
import { CategoryTag } from "../../CategoryTag";
import { Styles } from "../../../utils/Styles";
import { PointsCellContent } from "./cellContent/PointsCellContent";
import { AwardsCellContent } from "./cellContent/AwardsCellContent";
import { DateCellContent } from "./cellContent/DateCellContent";
import { CustomIconButton } from "../../CustomIconButton";
import { tokens } from "../../../tokens";

type StudentTableProps = {
  points: Points[];
  editFunctions?: EditFunctions;
  showActionButtons: boolean;
  blockActionButtons: boolean;
};

export type EditFunctions = {
  handleEditClick: (points: Points) => void;
  handleDeleteClick: (pointsId: string) => void;
  handleAddClick: (points: Points) => void;
};

type HeaderTitle = {
  name: string;
  align?: "center" | "left" | "right" | "justify" | "inherit" | undefined;
};

const headerTitles: HeaderTitle[] = [
  { name: "Nazwa", align: "center" },
  { name: "Łupy", align: "center" },
  { name: "Kategoria", align: "center" },
  { name: "Punkty", align: "center" },
  { name: "Max punktów", align: "center" },
  { name: "Data", align: "center" },
  { name: "Prowadzący", align: "center" },
];

export const StudentTable = ({
  points,
  editFunctions,
  showActionButtons,
  blockActionButtons,
}: StudentTableProps) => {
  if (showActionButtons && !editFunctions) {
    throw new Error(
      "Niepoprawne dane - handleEditClick lub handleDeleteClick niepodane.",
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {showActionButtons && <TableCell />}
            {headerTitles.map((header) => (
              <TableCell style={styles.header} align={header.align}>
                {header.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {points.map((p, index) => (
            <TableRow key={index}>
              {showActionButtons && (
                <TableCell>
                  <div style={styles.buttonsContainer}>
                    <CustomIconButton
                      icon="add"
                      onClick={() => editFunctions?.handleAddClick(p)}
                      disabled={
                        Boolean(p.points.purePoints) || blockActionButtons
                      }
                    />
                    <CustomIconButton
                      icon="edit"
                      onClick={() => editFunctions?.handleEditClick(p)}
                      disabled={!p.points.purePoints || blockActionButtons}
                    />
                    <CustomIconButton
                      icon="delete"
                      onClick={() => {
                        if (p.points.purePoints?.pointsId) {
                          editFunctions?.handleDeleteClick(
                            p.points.purePoints?.pointsId,
                          );
                        }
                      }}
                      disabled={
                        blockActionButtons || !p.points.purePoints?.pointsId
                      }
                      color={tokens.color.state.error}
                    />
                  </div>
                </TableCell>
              )}
              <TableCell align="center">
                {p.subcategory.subcategoryName}
              </TableCell>
              <TableCell align="center">
                <AwardsCellContent points={p} />
              </TableCell>
              <TableCell align="center">
                <CategoryTag
                  name={p.subcategory.category.categoryName}
                  darkColor={p.subcategory.category.darkColor}
                  lightColor={p.subcategory.category.lightColor}
                />
              </TableCell>
              <TableCell align="center">
                <PointsCellContent points={p} />
              </TableCell>
              <TableCell align="center">{p.subcategory.maxPoints}</TableCell>
              <TableCell align="center">
                <DateCellContent points={p} />
              </TableCell>
              <TableCell align="center">
                {p.teacher.firstName} {p.teacher.secondName}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const styles: Styles = {
  header: {
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },
};
