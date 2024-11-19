import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type LevelsQueryVariables = Types.Exact<{
  editionId: Types.Scalars["bigint"]["input"];
}>;

export type LevelsQuery = {
  __typename?: "query_root";
  levelSets: Array<{
    __typename?: "LevelSets";
    levels: Array<{
      __typename?: "Levels";
      grade: string;
      imageFileId?: string | null;
      levelId: string;
      maximumPoints: string;
      minimumPoints: string;
      name: string;
      ordinalNumber: number;
      label: string;
      highest: boolean;
      levelSetId?: string | null;
    }>;
  }>;
};

export const LevelsDocument = gql`
  query Levels($editionId: bigint!) {
    levelSets(where: { edition: { editionId: { _eq: $editionId } } }) {
      levels(orderBy: { ordinalNumber: ASC }) {
        grade
        imageFileId
        levelId
        maximumPoints
        minimumPoints
        name
        ordinalNumber
        label
        highest
        levelSetId
      }
    }
  }
`;

/**
 * __useLevelsQuery__
 *
 * To run a query within a React component, call `useLevelsQuery` and pass it any options that fit your needs.
 * When your component renders, `useLevelsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLevelsQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useLevelsQuery(
  baseOptions: Apollo.QueryHookOptions<LevelsQuery, LevelsQueryVariables> &
    ({ variables: LevelsQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<LevelsQuery, LevelsQueryVariables>(
    LevelsDocument,
    options,
  );
}
export function useLevelsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<LevelsQuery, LevelsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<LevelsQuery, LevelsQueryVariables>(
    LevelsDocument,
    options,
  );
}
export function useLevelsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    LevelsQuery,
    LevelsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<LevelsQuery, LevelsQueryVariables>(
    LevelsDocument,
    options,
  );
}
export type LevelsQueryHookResult = ReturnType<typeof useLevelsQuery>;
export type LevelsLazyQueryHookResult = ReturnType<typeof useLevelsLazyQuery>;
export type LevelsSuspenseQueryHookResult = ReturnType<
  typeof useLevelsSuspenseQuery
>;
export type LevelsQueryResult = Apollo.QueryResult<
  LevelsQuery,
  LevelsQueryVariables
>;
