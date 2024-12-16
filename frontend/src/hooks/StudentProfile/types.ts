import { StudentPointsQuery } from "../../graphql/studentPoints.graphql.types";

export type Bonus = {
  award: {
    id: string;
    name: string;
    description: string;
    value: number;
    imgId: string | undefined;
  };
  // TODO convert to date?
  updatedAt: string;
  createdAt: string;
};

export type Level = {
  name: string;
  ordinalNumber: number;
  realLevelNumber: number;
  imageId: string | undefined;
  minimumPoints: number;
  maximumPoints: number;
  grade: number;
};

export type Points =
  StudentPointsQuery["getStudentPoints"]["subcategoryPoints"][number];
