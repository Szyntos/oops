import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupLevelSetsQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type SetupLevelSetsQuery = {
  __typename?: "query_root";
  getLevelSets: Array<{
    __typename?: "LevelSetType";
    editionId?: string | null;
    levelSetId: number;
    levels: Array<{
      __typename?: "LevelType";
      grade: string;
      highest: boolean;
      label: string;
      levelId: string;
      levelName: string;
      levelSet: number;
      maximumPoints: string;
      minimumPoints: string;
      ordinalNumber: number;
      imageFile?: { __typename?: "FileType"; fileId: string } | null;
    }>;
  }>;
};

export const SetupLevelSetsDocument = gql`
  query SetupLevelSets {
    getLevelSets {
      editionId
      levelSetId
      levels {
        grade
        highest
        label
        levelId
        levelName
        levelSet
        maximumPoints
        minimumPoints
        ordinalNumber
        imageFile {
          fileId
        }
      }
    }
  }
`;

/**
 * __useSetupLevelSetsQuery__
 *
 * To run a query within a React component, call `useSetupLevelSetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupLevelSetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupLevelSetsQuery({
 *   variables: {
 *   },
 * });
 */
export function useSetupLevelSetsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SetupLevelSetsQuery,
    SetupLevelSetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SetupLevelSetsQuery, SetupLevelSetsQueryVariables>(
    SetupLevelSetsDocument,
    options,
  );
}
export function useSetupLevelSetsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupLevelSetsQuery,
    SetupLevelSetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SetupLevelSetsQuery, SetupLevelSetsQueryVariables>(
    SetupLevelSetsDocument,
    options,
  );
}
export function useSetupLevelSetsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupLevelSetsQuery,
    SetupLevelSetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SetupLevelSetsQuery,
    SetupLevelSetsQueryVariables
  >(SetupLevelSetsDocument, options);
}
export type SetupLevelSetsQueryHookResult = ReturnType<
  typeof useSetupLevelSetsQuery
>;
export type SetupLevelSetsLazyQueryHookResult = ReturnType<
  typeof useSetupLevelSetsLazyQuery
>;
export type SetupLevelSetsSuspenseQueryHookResult = ReturnType<
  typeof useSetupLevelSetsSuspenseQuery
>;
export type SetupLevelSetsQueryResult = Apollo.QueryResult<
  SetupLevelSetsQuery,
  SetupLevelSetsQueryVariables
>;
