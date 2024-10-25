import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type ChestsQueryVariables = Types.Exact<{
  editionId: Types.Scalars["bigint"]["input"];
}>;

export type ChestsQuery = {
  __typename?: "query_root";
  chests: Array<{
    __typename?: "Chests";
    chestId: string;
    editionId: string;
    imageFileId?: string | null;
    label: string;
    type: string;
  }>;
};

export const ChestsDocument = gql`
  query Chests($editionId: bigint!) {
    chests(where: { editionId: { _eq: $editionId } }) {
      chestId
      editionId
      imageFileId
      label
      type
    }
  }
`;

/**
 * __useChestsQuery__
 *
 * To run a query within a React component, call `useChestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useChestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChestsQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useChestsQuery(
  baseOptions: Apollo.QueryHookOptions<ChestsQuery, ChestsQueryVariables> &
    ({ variables: ChestsQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ChestsQuery, ChestsQueryVariables>(
    ChestsDocument,
    options,
  );
}
export function useChestsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<ChestsQuery, ChestsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ChestsQuery, ChestsQueryVariables>(
    ChestsDocument,
    options,
  );
}
export function useChestsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    ChestsQuery,
    ChestsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<ChestsQuery, ChestsQueryVariables>(
    ChestsDocument,
    options,
  );
}
export type ChestsQueryHookResult = ReturnType<typeof useChestsQuery>;
export type ChestsLazyQueryHookResult = ReturnType<typeof useChestsLazyQuery>;
export type ChestsSuspenseQueryHookResult = ReturnType<
  typeof useChestsSuspenseQuery
>;
export type ChestsQueryResult = Apollo.QueryResult<
  ChestsQuery,
  ChestsQueryVariables
>;
