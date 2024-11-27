import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GroupPointsQueryVariables = Types.Exact<{
  groupId: Types.Scalars["Int"]["input"];
}>;

export type GroupPointsQuery = {
  __typename?: "query_root";
  getUsersInGroupWithPoints: Array<{
    __typename?: "UserPointsType";
    user: {
      __typename?: "UserType";
      firstName: string;
      secondName: string;
      userId: string;
      indexNumber: number;
      nick: string;
    };
    userLevel: {
      __typename?: "UserLevelType";
      computedGrade: number;
      endOfLabsLevelsReached: boolean;
      projectPointsThresholdReached: boolean;
      level: {
        __typename?: "LevelType";
        grade: string;
        levelName: string;
        imageFile?: { __typename?: "FileType"; fileId: string } | null;
      };
    };
    categoriesPoints: Array<{
      __typename?: "CategoryPointsType";
      category: {
        __typename?: "CategoryType";
        categoryId: string;
        categoryName: string;
      };
      subcategoryPoints: Array<{
        __typename?: "SubcategoryPointsGroupType";
        createdAt: string;
        updatedAt: string;
        subcategory: {
          __typename?: "SubcategoryType";
          maxPoints: string;
          subcategoryId: string;
          subcategoryName: string;
        };
        points?: { __typename?: "PointType"; value: string } | null;
      }>;
      awardAggregate: Array<{
        __typename?: "AwardAggregateType";
        sumOfAll?: number | null;
        award: { __typename?: "AwardType"; awardId: string; awardName: string };
      }>;
      categoryAggregate: {
        __typename?: "CategoryAggregate";
        sumOfAll: number;
        sumOfBonuses: number;
        sumOfPurePoints: number;
      };
    }>;
  } | null>;
};

export const GroupPointsDocument = gql`
  query GroupPoints($groupId: Int!) {
    getUsersInGroupWithPoints(groupId: $groupId) {
      user {
        firstName
        secondName
        userId
        indexNumber
        nick
      }
      userLevel {
        computedGrade
        endOfLabsLevelsReached
        projectPointsThresholdReached
        level {
          grade
          levelName
          imageFile {
            fileId
          }
        }
      }
      categoriesPoints {
        category {
          categoryId
          categoryName
        }
        subcategoryPoints {
          createdAt
          updatedAt
          subcategory {
            maxPoints
            subcategoryId
            subcategoryName
          }
          points {
            value
          }
        }
        awardAggregate {
          award {
            awardId
            awardName
          }
          sumOfAll
        }
        categoryAggregate {
          sumOfAll
          sumOfBonuses
          sumOfPurePoints
        }
      }
    }
  }
`;

/**
 * __useGroupPointsQuery__
 *
 * To run a query within a React component, call `useGroupPointsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGroupPointsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGroupPointsQuery({
 *   variables: {
 *      groupId: // value for 'groupId'
 *   },
 * });
 */
export function useGroupPointsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GroupPointsQuery,
    GroupPointsQueryVariables
  > &
    (
      | { variables: GroupPointsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GroupPointsQuery, GroupPointsQueryVariables>(
    GroupPointsDocument,
    options,
  );
}
export function useGroupPointsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GroupPointsQuery,
    GroupPointsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GroupPointsQuery, GroupPointsQueryVariables>(
    GroupPointsDocument,
    options,
  );
}
export function useGroupPointsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GroupPointsQuery,
    GroupPointsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GroupPointsQuery, GroupPointsQueryVariables>(
    GroupPointsDocument,
    options,
  );
}
export type GroupPointsQueryHookResult = ReturnType<typeof useGroupPointsQuery>;
export type GroupPointsLazyQueryHookResult = ReturnType<
  typeof useGroupPointsLazyQuery
>;
export type GroupPointsSuspenseQueryHookResult = ReturnType<
  typeof useGroupPointsSuspenseQuery
>;
export type GroupPointsQueryResult = Apollo.QueryResult<
  GroupPointsQuery,
  GroupPointsQueryVariables
>;
