import { useCallback, useMemo, useState } from "react";
import { GroupSearchField } from "../../components/Groups/GroupsList/GroupSearcher";
import { GroupsList } from "../../components/Groups/GroupsList/GroupsList";
import { useGroupsScreenData } from "../../hooks/Groups/useGroupsScreenData";
import { SideFilterBar } from "../../components/Groups/FilterBar/SideFilterBar";
import { Styles } from "../../utils/Styles";
import { isPartOfAString } from "../../utils/strings";
import { getTimestampUniqueString } from "../../hooks/Groups/FilterBar/useTimestampsData";
import {
  GroupRadioFilterItem,
  RadioFilterGroups,
} from "../../components/Groups/RadioFilterGroup";
import { useUser } from "../../hooks/common/useUser";
import { Group } from "../../hooks/common/useGroupsData";
import { groupsRadioButtonOptions } from "../../utils/constants";
import { ScreenContentContainer } from "../../components/layout/ScreenContentContainer";
import { getGroupTimeString } from "../../utils/utils";

export const GroupsScreen = () => {
  const { user } = useUser();
  const teacherId = user.userId;
  const { groups, weekdays, teachers, timestamps, loading, error } =
    useGroupsScreenData();

  const [input, setInput] = useState("");
  const [weekdayIds, setWeekdayIds] = useState<string[]>([]);
  const [teacherIds, setTeacherIds] = useState<string[]>([]);
  const [timestampIds, setTimestampIds] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<GroupRadioFilterItem>({
    id: "yours",
    name: "twoje",
  });

  const doesGroupMatchRadioButtons = useCallback(
    (group: Group) => {
      switch (selectedOption.id) {
        case "all":
          return true;
        case "yours":
          return group.teacher.id === teacherId;
        case "foreign":
          return group.teacher.id !== teacherId;
      }
    },
    [selectedOption.id, teacherId],
  );

  const doesGroupMatchFiltersAndInput = useCallback(
    (group: Group) => {
      const doesWeekdayMatch =
        weekdayIds.length === 0 || weekdayIds.includes(group.weekday.id);

      const doesTimestampMatch =
        timestampIds.length === 0 ||
        timestampIds.includes(getTimestampUniqueString(group.time));

      const doesTeacherMatch =
        teacherIds.length === 0 || teacherIds.includes(group.teacher.id);

      const doesInputMatch =
        input === "undefined" ||
        input === "" ||
        isPartOfAString(input, [
          group.name,
          group.teacher.fullName,
          getGroupTimeString(group),
        ]);

      return (
        doesWeekdayMatch &&
        doesTimestampMatch &&
        doesTeacherMatch &&
        doesInputMatch
      );
    },
    [weekdayIds, input, timestampIds, teacherIds],
  );

  // never will be empty because of radio
  const groupsWithFilterAndRadio = useMemo(
    () =>
      groups.filter(
        (group) =>
          doesGroupMatchFiltersAndInput(group) &&
          doesGroupMatchRadioButtons(group),
      ),
    [doesGroupMatchFiltersAndInput, doesGroupMatchRadioButtons, groups],
  );

  // TODO is it possible to reduce number of rerenders?

  if (loading) return <div>loading...</div>;
  if (error) return <div>ERROR: {error?.message}</div>;

  return (
    <ScreenContentContainer
      sidebar={
        <SideFilterBar
          sections={[
            {
              pickerTitle: "Dzień Tygodnia",
              options: weekdays,
              onFiltersChange: (selectedIds) => setWeekdayIds(selectedIds),
            },
            {
              pickerTitle: "Godzina",
              options: timestamps,
              onFiltersChange: (selectedIds) => setTimestampIds(selectedIds),
            },
            {
              pickerTitle: "Prowadzący",
              options: teachers,
              onFiltersChange: (selectedIds) => setTeacherIds(selectedIds),
            },
          ]}
        />
      }
    >
      <div style={styles.topBar}>
        <GroupSearchField onInputChange={(input: string) => setInput(input)} />
        <RadioFilterGroups
          options={groupsRadioButtonOptions}
          onOptionChange={(option) => setSelectedOption(option)}
          selectedOption={selectedOption}
        />
      </div>
      <GroupsList groups={groupsWithFilterAndRadio} />
    </ScreenContentContainer>
  );
};

const styles: Styles = {
  topBar: {
    display: "flex",
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
};
