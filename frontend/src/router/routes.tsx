import { createBrowserRouter } from "react-router-dom";
import { Root } from "../components/Root";
import { HallOfFame } from "../screens/HallOfFame/HallOfFame";
import { pathsWithParameters } from "./paths";
import { StudentProfile } from "../screens/StudentProfile/StudentProfile";
import { TeacherStudentProfile } from "../screens/StudentProfile/TeacherStudentProfile";
import { GroupsScreen } from "../screens/Groups/GroupsScreen";
import { GroupScreen } from "../screens/Group/GroupScreen";
import { LoginScreen } from "../screens/Login/LoginScreen";
import { ProtectedRoute } from "./protectedRoute";
import { StudentsScreen } from "../screens/Students/StudentsScreen";
import { EditionsScreen } from "../screens/Editions/EditionsScreen";
import { EditionScreen } from "../screens/Edition/EditionScreen";
import { CategoriesSection } from "../components/Edition/Sections/CategoriesSection/CategoriesSection";
import { FilesSection } from "../components/Edition/Sections/FilesSection/FilesSection";
import { AwardsSection } from "../components/Edition/Sections/AwardsSection/AwardsSection";
import { LevelSetsSection } from "../components/Edition/Sections/LevelsSection/LevelSetsSection";
import { GroupsSection } from "../components/Edition/Sections/GroupSection/GroupsSection";
import { UsersSection } from "../components/Edition/Sections/UsersSection/UsersSection";
import { GradingChecksSection } from "../components/Edition/Sections/GradingChecksSection/GradingChecksSection";
import { ChestsSection } from "../components/Edition/Sections/ChestsSection/ChestsSection";
import { AvatarAndNickScreen } from "../screens/SetupUserProfile/AvatarAndNickScreen";
import { HallOfFameTeacher } from "../screens/HallOfFame/HallOfFameTeacher";
import { ResetPasswordScreen } from "../components/resetPassword/ResetPasswordScreen";
import { StudentStatistics } from "../components/Statistics/StudentStatistics";
import { TeacherStatistics } from "../components/Statistics/TeacherStatistice";
import { CoordinatorStatistics } from "../components/Statistics/CoordinatorStatistics";

const commonPaths = pathsWithParameters.common;
const studentPaths = pathsWithParameters.student;
const teacherPaths = pathsWithParameters.teacher;
const coordinatorPaths = pathsWithParameters.coordinator;

export const routes = createBrowserRouter([
  {
    path: commonPaths.Default.path,
    element: <Root />,
    children: [
      {
        path: commonPaths.Default.path,
        element: (
          <ProtectedRoute
            element={<LoginScreen />}
            allowedRoles={commonPaths.Default.allowedRoles}
          />
        ),
        index: true,
      },
      {
        path: commonPaths.ResetPassword.path,
        element: (
          <ProtectedRoute
            element={<ResetPasswordScreen />}
            allowedRoles={commonPaths.ResetPassword.allowedRoles}
          />
        ),
        index: true,
      },
      {
        path: studentPaths.StudentProfile.path,
        element: (
          <ProtectedRoute
            element={<StudentProfile />}
            allowedRoles={studentPaths.StudentProfile.allowedRoles}
          />
        ),
      },
      {
        path: studentPaths.ChoosingAvatarAndNick.path,
        element: (
          <ProtectedRoute
            element={<AvatarAndNickScreen />}
            allowedRoles={studentPaths.StudentProfile.allowedRoles}
          />
        ),
      },
      {
        path: studentPaths.Statistics.path,
        element: (
          <ProtectedRoute
            element={<StudentStatistics />}
            allowedRoles={studentPaths.Statistics.allowedRoles}
          />
        ),
      },
      {
        path: teacherPaths.Statistics.path,
        element: (
          <ProtectedRoute
            element={<TeacherStatistics />}
            allowedRoles={teacherPaths.Statistics.allowedRoles}
          />
        ),
      },
      {
        path: coordinatorPaths.Statistics.path,
        element: (
          <ProtectedRoute
            element={<CoordinatorStatistics />}
            allowedRoles={coordinatorPaths.Statistics.allowedRoles}
          />
        ),
      },
      {
        path: studentPaths.HallOfFame.path,
        element: (
          <ProtectedRoute
            element={<HallOfFame />}
            allowedRoles={studentPaths.HallOfFame.allowedRoles}
          />
        ),
      },
      {
        path: teacherPaths.Groups.path,
        element: (
          <ProtectedRoute
            element={<GroupsScreen />}
            allowedRoles={teacherPaths.Groups.allowedRoles}
          />
        ),
      },
      {
        path: teacherPaths.Group.path,
        element: (
          <ProtectedRoute
            element={<GroupScreen />}
            allowedRoles={teacherPaths.Group.allowedRoles}
          />
        ),
      },
      {
        path: teacherPaths.StudentProfile.path,
        element: (
          <ProtectedRoute
            element={<TeacherStudentProfile />}
            allowedRoles={teacherPaths.StudentProfile.allowedRoles}
          />
        ),
      },
      {
        path: teacherPaths.HallOfFame.path,
        element: (
          <ProtectedRoute
            element={<HallOfFameTeacher />}
            allowedRoles={teacherPaths.HallOfFame.allowedRoles}
          />
        ),
      },
      {
        path: teacherPaths.Students.path,
        element: (
          <ProtectedRoute
            element={<StudentsScreen />}
            allowedRoles={teacherPaths.Students.allowedRoles}
          />
        ),
      },
      {
        path: coordinatorPaths.Editions.path,
        element: (
          <ProtectedRoute
            element={<EditionsScreen />}
            allowedRoles={coordinatorPaths.Editions.allowedRoles}
          />
        ),
      },
      {
        path: coordinatorPaths.Edition.path,
        element: (
          <ProtectedRoute
            element={<EditionScreen />}
            allowedRoles={coordinatorPaths.Edition.allowedRoles}
          />
        ),
        children: [
          {
            index: true,
            element: (
              <ProtectedRoute
                element={<CategoriesSection />}
                allowedRoles={coordinatorPaths.Edition.allowedRoles}
              />
            ),
          },
          {
            path: coordinatorPaths.Edition.children.Categories.path,
            element: (
              <ProtectedRoute
                element={<CategoriesSection />}
                allowedRoles={coordinatorPaths.Edition.allowedRoles}
              />
            ),
          },
          {
            path: coordinatorPaths.Edition.children.Files.path,
            element: (
              <ProtectedRoute
                element={<FilesSection />}
                allowedRoles={coordinatorPaths.Edition.allowedRoles}
              />
            ),
          },
          {
            path: coordinatorPaths.Edition.children.Awards.path,
            element: (
              <ProtectedRoute
                element={<AwardsSection />}
                allowedRoles={coordinatorPaths.Edition.allowedRoles}
              />
            ),
          },
          {
            path: coordinatorPaths.Edition.children.Chests.path,
            element: (
              <ProtectedRoute
                element={<ChestsSection />}
                allowedRoles={coordinatorPaths.Edition.allowedRoles}
              />
            ),
          },
          {
            path: coordinatorPaths.Edition.children.Levels.path,
            element: (
              <ProtectedRoute
                element={<LevelSetsSection />}
                allowedRoles={coordinatorPaths.Edition.allowedRoles}
              />
            ),
          },
          {
            path: coordinatorPaths.Edition.children.Groups.path,
            element: (
              <ProtectedRoute
                element={<GroupsSection />}
                allowedRoles={coordinatorPaths.Edition.allowedRoles}
              />
            ),
          },
          {
            path: coordinatorPaths.Edition.children.Users.path,
            element: (
              <ProtectedRoute
                element={<UsersSection />}
                allowedRoles={coordinatorPaths.Edition.allowedRoles}
              />
            ),
          },
          {
            path: coordinatorPaths.Edition.children.GradingChecks.path,
            element: (
              <ProtectedRoute
                element={<GradingChecksSection />}
                allowedRoles={coordinatorPaths.Edition.allowedRoles}
              />
            ),
          },
        ],
      },
    ],
  },
]);
