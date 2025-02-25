import { UsersRolesType } from "../__generated__/schema.graphql.types";

const commonPaths = {
  Default: {
    path: "/",
    allowedRoles: [
      UsersRolesType.UnauthenticatedUser,
      UsersRolesType.Student,
      UsersRolesType.Teacher,
      UsersRolesType.Coordinator,
    ],
  },
  HallOfFame: {
    path: "/hall-of-fame",
    allowedRoles: [
      UsersRolesType.Student,
      UsersRolesType.Teacher,
      UsersRolesType.Coordinator,
    ],
  },
  ResetPassword: {
    path: "/reset-password",
    allowedRoles: [UsersRolesType.UnauthenticatedUser],
  },
};

const studentPaths = {
  StudentProfile: {
    path: "/student-profile",
    allowedRoles: [UsersRolesType.Student],
  },
  ChoosingAvatarAndNick: {
    path: "/avatar-and-nick",
    allowedRoles: [UsersRolesType.Student],
  },
  HallOfFame: {
    path: "/hall-of-fame",
    allowedRoles: [UsersRolesType.Student],
  },
  Statistics: {
    path: "/statistics",
    allowedRoles: [UsersRolesType.Student],
  },
};

const teacherPaths = {
  StudentProfile: {
    path: "/teacher/student-profile/:id",
    allowedRoles: [UsersRolesType.Teacher, UsersRolesType.Coordinator],
  },
  Groups: {
    path: "/groups",
    allowedRoles: [UsersRolesType.Teacher, UsersRolesType.Coordinator],
  },
  Group: {
    path: "/group/:groupId/:teacherId",
    allowedRoles: [UsersRolesType.Teacher, UsersRolesType.Coordinator],
  },
  Students: {
    path: "/students",
    allowedRoles: [UsersRolesType.Teacher, UsersRolesType.Coordinator],
  },
  HallOfFame: {
    path: "/teacher/hall-of-fame",
    allowedRoles: [UsersRolesType.Teacher, UsersRolesType.Coordinator],
  },
  Statistics: {
    path: "/teacher/statistics",
    allowedRoles: [UsersRolesType.Teacher, UsersRolesType.Coordinator],
  },
};

const coordinatorPaths = {
  Editions: {
    path: "/coordinator/editions",
    allowedRoles: [UsersRolesType.Coordinator],
  },
  Statistics: {
    path: "/coordinator/statistics",
    allowedRoles: [UsersRolesType.Coordinator],
  },
  Edition: {
    path: "/coordinator/edition/:id",
    allowedRoles: [UsersRolesType.Coordinator],
    children: {
      Awards: {
        path: "awards",
      },
      Chests: {
        path: "chests",
      },
      Categories: {
        path: "categories",
      },
      Files: {
        path: "files",
      },
      Levels: {
        path: "levels",
      },
      Groups: {
        path: "groups",
      },
      Users: {
        path: "users",
      },
      GradingChecks: {
        path: "grading-checks",
      },
    },
  },
};

export const pathsWithParameters = {
  common: commonPaths,
  student: studentPaths,
  teacher: teacherPaths,
  coordinator: coordinatorPaths,
};

export const pathsGenerator = {
  common: Object.fromEntries(
    Object.entries(commonPaths).map(([key, value]) => [key, value.path]),
  ),
  student: Object.fromEntries(
    Object.entries(studentPaths).map(([key, value]) => [key, value.path]),
  ),
  teacher: {
    Groups: teacherPaths.Groups.path,
    Group: (groupId: string, teacherId: string) =>
      `${teacherPaths.Group.path.replace(":groupId", groupId).replace(":teacherId", teacherId)}`,
    StudentProfile: (id: string) =>
      `${teacherPaths.StudentProfile.path.replace(":id", id)}`,
    Students: teacherPaths.Students.path,
    HallOfFame: teacherPaths.HallOfFame.path,
  },
  coordinator: {
    Editions: coordinatorPaths.Editions.path,
    Edition: (id: string) =>
      `${coordinatorPaths.Edition.path.replace(":id", id)}/`,
    EditionChildren: {
      Awards: (id: string) =>
        `${coordinatorPaths.Edition.path.replace(":id", id)}/${coordinatorPaths.Edition.children.Awards.path}`,
      Chests: (id: string) =>
        `${coordinatorPaths.Edition.path.replace(":id", id)}/${coordinatorPaths.Edition.children.Chests.path}`,
      Categories: (id: string) =>
        `${coordinatorPaths.Edition.path.replace(":id", id)}/${coordinatorPaths.Edition.children.Categories.path}`,
      Files: (id: string) =>
        `${coordinatorPaths.Edition.path.replace(":id", id)}/${coordinatorPaths.Edition.children.Files.path}`,
      Levels: (id: string) =>
        `${coordinatorPaths.Edition.path.replace(":id", id)}/${coordinatorPaths.Edition.children.Levels.path}`,
      Groups: (id: string) =>
        `${coordinatorPaths.Edition.path.replace(":id", id)}/${coordinatorPaths.Edition.children.Groups.path}`,
      Users: (id: string) =>
        `${coordinatorPaths.Edition.path.replace(":id", id)}/${coordinatorPaths.Edition.children.Users.path}`,
      GradingChecks: (id: string) =>
        `${coordinatorPaths.Edition.path.replace(":id", id)}/${coordinatorPaths.Edition.children.GradingChecks.path}`,
    },
  },
};

type NavigationItem = {
  title: string;
  path: string;
  allowedRoles: UsersRolesType[];
};

export const getNavigationItems = (
  role: "student" | "teacher" | "coordinator",
): NavigationItem[] => {
  const statisticsItem = getStatisticsNavigationItem(role);
  return [
    {
      title: "Grupy",
      path: pathsWithParameters.teacher.Groups.path,
      allowedRoles: pathsWithParameters.teacher.Groups.allowedRoles,
    },
    {
      title: "Studenci",
      path: pathsWithParameters.teacher.Students.path,
      allowedRoles: pathsWithParameters.teacher.Students.allowedRoles,
    },
    {
      title: "Profil studenta",
      path: pathsWithParameters.student.StudentProfile.path,
      allowedRoles: pathsWithParameters.student.StudentProfile.allowedRoles,
    },
    {
      title: "Hala Chwały",
      path:
        role === "student"
          ? pathsWithParameters.student.HallOfFame.path
          : pathsWithParameters.teacher.HallOfFame.path,
      allowedRoles:
        role === "student"
          ? pathsWithParameters.student.HallOfFame.allowedRoles
          : pathsWithParameters.teacher.HallOfFame.allowedRoles,
    },
    statisticsItem,
    {
      title: "Edycje",
      path: pathsWithParameters.coordinator.Editions.path,
      allowedRoles: pathsWithParameters.coordinator.Editions.allowedRoles,
    },
  ];
};

const getStatisticsNavigationItem = (
  role: "student" | "teacher" | "coordinator",
) => {
  switch (role) {
    case "student":
      return {
        title: "Statystyki",
        path: pathsWithParameters.student.Statistics.path,
        allowedRoles: pathsWithParameters.student.Statistics.allowedRoles,
      };
    case "teacher":
      return {
        title: "Statystyki",
        path: pathsWithParameters.teacher.Statistics.path,
        allowedRoles: pathsWithParameters.teacher.Statistics.allowedRoles,
      };
    case "coordinator":
      return {
        title: "Statystyki",
        path: pathsWithParameters.coordinator.Statistics.path,
        allowedRoles: pathsWithParameters.coordinator.Statistics.allowedRoles,
      };
  }
};
