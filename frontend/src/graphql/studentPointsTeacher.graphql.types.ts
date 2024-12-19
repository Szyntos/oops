import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type StudentPointsTeacherQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  studentId: Types.Scalars["Int"]["input"];
}>;

export type StudentPointsTeacherQuery = {
  __typename?: "query_root";
  getStudentPoints: {
    __typename?: "StudentPointsType";
    sumOfAll: number;
    sumOfBonuses: number;
    sumOfPurePoints: number;
    user: {
      __typename?: "UserType";
      firstName: string;
      indexNumber: number;
      nick: string;
      secondName: string;
      userId: string;
      userLevels: Array<{
        __typename?: "UserLevelType";
        computedGrade: number;
        endOfLabsLevelsReached: boolean;
        projectPointsThresholdReached: boolean;
        coordinatorOverride: boolean;
        edition: { __typename?: "EditionType"; editionId: string };
      } | null>;
      imageFile?: { __typename?: "FileType"; fileId: string } | null;
      userGroups: Array<{
        __typename?: "UserGroupType";
        group: {
          __typename?: "GroupType";
          groupsId: string;
          endTime: string;
          groupName?: string | null;
          generatedName: string;
          startTime: string;
          weekday: {
            __typename?: "WeekdayType";
            weekdayId: string;
            weekdayName: string;
          };
          teacher: {
            __typename?: "UserType";
            userId: string;
            firstName: string;
            secondName: string;
          };
        };
      } | null>;
    };
    subcategoryPoints: Array<{
      __typename?: "SubcategoryPointsType";
      updatedAt: string;
      createdAt: string;
      points: {
        __typename?: "PurePointsType";
        purePoints?: {
          __typename?: "PointType";
          pointsId: string;
          value: string;
        } | null;
        partialBonusType: Array<{
          __typename?: "PartialBonusType";
          partialValue: number;
          bonuses: {
            __typename?: "BonusType";
            bonusId: string;
            createdAt: string;
            updatedAt: string;
            award: {
              __typename?: "AwardType";
              awardName: string;
              awardId: string;
              awardType: Types.AwardTypeType;
              awardValue: string;
              description: string;
              imageFile?: { __typename?: "FileType"; fileId: string } | null;
            };
          };
        } | null>;
      };
      subcategory: {
        __typename?: "SubcategoryType";
        subcategoryId: string;
        subcategoryName: string;
        maxPoints: string;
        category: {
          __typename?: "CategoryType";
          categoryId: string;
          categoryName: string;
          darkColor: string;
          lightColor: string;
        };
      };
      teacher: {
        __typename?: "UserType";
        firstName: string;
        secondName: string;
      };
    }>;
  };
};

export const StudentPointsTeacherDocument = gql`
  query StudentPointsTeacher($editionId: Int!, $studentId: Int!) {
    getStudentPoints(editionId: $editionId, studentId: $studentId) {
      user {
        userLevels {
          computedGrade
          edition {
            editionId
          }
          endOfLabsLevelsReached
          projectPointsThresholdReached
          coordinatorOverride
        }
        firstName
        indexNumber
        nick
        secondName
        imageFile {
          fileId
        }
        userId
        userGroups {
          group {
            groupsId
            endTime
            groupName
            generatedName
            startTime
            weekday {
              weekdayId
              weekdayName
            }
            teacher {
              userId
              firstName
              secondName
            }
          }
        }
      }
      sumOfAll
      sumOfBonuses
      sumOfPurePoints
      subcategoryPoints {
        points {
          purePoints {
            pointsId
            value
          }
          partialBonusType {
            partialValue
            bonuses {
              bonusId
              award {
                awardName
                imageFile {
                  fileId
                }
                awardId
                awardType
                awardValue
                description
              }
              createdAt
              updatedAt
            }
          }
        }
        subcategory {
          subcategoryId
          subcategoryName
          category {
            categoryId
            categoryName
            darkColor
            lightColor
          }
          maxPoints
        }
        teacher {
          firstName
          secondName
        }
        updatedAt
        createdAt
      }
    }
  }
`;

/**
 * __useStudentPointsTeacherQuery__
 *
 * To run a query within a React component, call `useStudentPointsTeacherQuery` and pass it any options that fit your needs.
 * When your component renders, `useStudentPointsTeacherQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStudentPointsTeacherQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      studentId: // value for 'studentId'
 *   },
 * });
 */
export function useStudentPointsTeacherQuery(
  baseOptions: Apollo.QueryHookOptions<
    StudentPointsTeacherQuery,
    StudentPointsTeacherQueryVariables
  > &
    (
      | { variables: StudentPointsTeacherQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    StudentPointsTeacherQuery,
    StudentPointsTeacherQueryVariables
  >(StudentPointsTeacherDocument, options);
}
export function useStudentPointsTeacherLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    StudentPointsTeacherQuery,
    StudentPointsTeacherQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    StudentPointsTeacherQuery,
    StudentPointsTeacherQueryVariables
  >(StudentPointsTeacherDocument, options);
}
export function useStudentPointsTeacherSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    StudentPointsTeacherQuery,
    StudentPointsTeacherQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    StudentPointsTeacherQuery,
    StudentPointsTeacherQueryVariables
  >(StudentPointsTeacherDocument, options);
}
export type StudentPointsTeacherQueryHookResult = ReturnType<
  typeof useStudentPointsTeacherQuery
>;
export type StudentPointsTeacherLazyQueryHookResult = ReturnType<
  typeof useStudentPointsTeacherLazyQuery
>;
export type StudentPointsTeacherSuspenseQueryHookResult = ReturnType<
  typeof useStudentPointsTeacherSuspenseQuery
>;
export type StudentPointsTeacherQueryResult = Apollo.QueryResult<
  StudentPointsTeacherQuery,
  StudentPointsTeacherQueryVariables
>;
