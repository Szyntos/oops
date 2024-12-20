import { useCallback, useMemo, useState } from "react";
import { SideFilterBar } from "../../components/Groups/FilterBar/SideFilterBar";
import { Styles } from "../../utils/Styles";
import { isPartOfAString } from "../../utils/strings";
import {
  GroupRadioFilterItem,
  RadioFilterGroups,
} from "../../components/Groups/RadioFilterGroup";
import { StudentsListSearcher } from "../../components/Students/StudentsListSearcher";
import {
  StudentFromList,
  StudentsList,
} from "../../components/Students/StudentsList";
import { useStudentsScreenData } from "../../hooks/Students/useStudentsScreenData";
import { groupsRadioButtonOptions } from "../../utils/constants";
import { ScreenContentContainer } from "../../components/layout/ScreenContentContainer";
import { LoadingScreen } from "../Loading/LoadingScreen";
import { ErrorScreen } from "../Error/ErrorScreen";

export const StudentsScreen = () => {
  const { teacherId, groups, students, loading, error } =
    useStudentsScreenData();

  const [input, setInput] = useState("");
  const [groupsIds, setGroupsIds] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<GroupRadioFilterItem>({
    id: "yours",
    name: "twoje",
  });

  const doesGroupMatchRadioButtons = useCallback(
    (student: StudentFromList) => {
      switch (selectedOption.id) {
        case "all":
          return true;
        case "yours":
          return student.group.teacher.id === teacherId;
        case "foreign":
          return student.group.teacher.id !== teacherId;
      }
    },
    [selectedOption.id, teacherId],
  );

  const doesGroupMatchFiltersAndInput = useCallback(
    (student: StudentFromList) => {
      const doesGroupMatch =
        groupsIds.length === 0 || groupsIds.includes(student.group.id);

      const doesInputMatch =
        input === "undefined" ||
        input === "" ||
        isPartOfAString(input, [
          `${student.firstName} ${student.secondName}`,
          student.index.toString(),
          student.group.name,
          student.nick,
        ]);

      return doesGroupMatch && doesInputMatch;
    },
    [groupsIds, input],
  );

  // never will be empty because of radio
  const studentsWithFilterAndRadio = useMemo(
    () =>
      students.filter(
        (student) =>
          doesGroupMatchFiltersAndInput(student) &&
          doesGroupMatchRadioButtons(student),
      ),
    [doesGroupMatchFiltersAndInput, doesGroupMatchRadioButtons, students],
  );

  // TODO is it possible to reduce number of rerenders?

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen />;

  return (
    <ScreenContentContainer
      sidebar={
        <SideFilterBar
          sections={[
            {
              pickerTitle: "Grupa",
              options: groups,
              onFiltersChange: (selectedIds) => setGroupsIds(selectedIds),
            },
          ]}
        />
      }
    >
      <div style={styles.topBar}>
        <StudentsListSearcher
          onInputChange={(input: string) => setInput(input)}
          placeholder="Wyszukaj studenta"
        />
        <RadioFilterGroups
          options={groupsRadioButtonOptions}
          onOptionChange={(option) => setSelectedOption(option)}
          selectedOption={selectedOption}
        />
      </div>
      <StudentsList students={studentsWithFilterAndRadio} />
    </ScreenContentContainer>
  );
};

const styles: Styles = {
  topBar: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
  },
};
