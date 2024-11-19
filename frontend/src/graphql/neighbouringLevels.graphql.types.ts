import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type NeighboringLevelsQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  studentId: Types.Scalars["Int"]["input"];
}>;

export type NeighboringLevelsQuery = {
  __typename?: "query_root";
  getNeighboringLevels: {
    __typename?: "NeighboringLevelsType";
    sumOfAllPoints: string;
    currLevel: {
      __typename?: "LevelType";
      highest: boolean;
      levelId: string;
      levelName: string;
      maximumPoints: string;
      minimumPoints: string;
      ordinalNumber: number;
      grade: string;
      label: string;
      imageFile?: {
        __typename?: "FileType";
        createdAt: string;
        updatedAt: string;
        fileId: string;
        fileName: string;
        fileType: string;
        label: string;
        pathToFile: string;
        createdAt: string;
        updatedAt: string;
      } | null;
    };
    nextLevel?: {
      __typename?: "LevelType";
      highest: boolean;
      levelId: string;
      levelName: string;
      maximumPoints: string;
      minimumPoints: string;
      ordinalNumber: number;
      grade: string;
      label: string;
      imageFile?: {
        __typename?: "FileType";
        createdAt: string;
        updatedAt: string;
        fileId: string;
        fileName: string;
        fileType: string;
        label: string;
        pathToFile: string;
        createdAt: string;
        updatedAt: string;
      } | null;
    } | null;
    prevLevel?: {
      __typename?: "LevelType";
      highest: boolean;
      levelId: string;
      levelName: string;
      maximumPoints: string;
      minimumPoints: string;
      ordinalNumber: number;
      grade: string;
      label: string;
      imageFile?: {
        __typename?: "FileType";
        createdAt: string;
        updatedAt: string;
        fileId: string;
        fileName: string;
        fileType: string;
        label: string;
        pathToFile: string;
        createdAt: string;
        updatedAt: string;
      } | null;
    } | null;
  };
};

export const NeighboringLevelsDocument = gql`
  query NeighboringLevels($editionId: Int!, $studentId: Int!) {
    getNeighboringLevels(editionId: $editionId, studentId: $studentId) {
      sumOfAllPoints
      currLevel {
        highest
        levelId
        levelName
        maximumPoints
        minimumPoints
        ordinalNumber
        grade
        label
        imageFile {
          createdAt
          updatedAt
          fileId
          fileName
          fileType
          label
          pathToFile
          createdAt
          updatedAt
        }
      }
      nextLevel {
        highest
        levelId
        levelName
        maximumPoints
        minimumPoints
        ordinalNumber
        grade
        label
        imageFile {
          createdAt
          updatedAt
          fileId
          fileName
          fileType
          label
          pathToFile
          createdAt
          updatedAt
        }
      }
      prevLevel {
        highest
        levelId
        levelName
        maximumPoints
        minimumPoints
        ordinalNumber
        grade
        label
        imageFile {
          createdAt
          updatedAt
          fileId
          fileName
          fileType
          label
          pathToFile
          createdAt
          updatedAt
        }
      }
    }
  }
`;

/**
 * __useNeighboringLevelsQuery__
 *
 * To run a query within a React component, call `useNeighboringLevelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useNeighboringLevelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useNeighboringLevelsQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      studentId: // value for 'studentId'
 *   },
 * });
 */
export function useNeighboringLevelsQuery(
  baseOptions: Apollo.QueryHookOptions<
    NeighboringLevelsQuery,
    NeighboringLevelsQueryVariables
  > &
    (
      | { variables: NeighboringLevelsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    NeighboringLevelsQuery,
    NeighboringLevelsQueryVariables
  >(NeighboringLevelsDocument, options);
}
export function useNeighboringLevelsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    NeighboringLevelsQuery,
    NeighboringLevelsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    NeighboringLevelsQuery,
    NeighboringLevelsQueryVariables
  >(NeighboringLevelsDocument, options);
}
export function useNeighboringLevelsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    NeighboringLevelsQuery,
    NeighboringLevelsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    NeighboringLevelsQuery,
    NeighboringLevelsQueryVariables
  >(NeighboringLevelsDocument, options);
}
export type NeighboringLevelsQueryHookResult = ReturnType<
  typeof useNeighboringLevelsQuery
>;
export type NeighboringLevelsLazyQueryHookResult = ReturnType<
  typeof useNeighboringLevelsLazyQuery
>;
export type NeighboringLevelsSuspenseQueryHookResult = ReturnType<
  typeof useNeighboringLevelsSuspenseQuery
>;
export type NeighboringLevelsQueryResult = Apollo.QueryResult<
  NeighboringLevelsQuery,
  NeighboringLevelsQueryVariables
>;
