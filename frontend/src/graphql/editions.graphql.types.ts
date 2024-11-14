import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type EditionsQueryVariables = Types.Exact<{ [key: string]: never }>;

export type EditionsQuery = {
  __typename?: "query_root";
  edition: Array<{
    __typename?: "Edition";
    editionId: string;
    startDate: string;
    endDate: string;
    editionYear: number;
    name: string;
  }>;
};

export const EditionsDocument = gql`
  query Editions {
    edition {
      editionId
      startDate
      endDate
      editionYear
      name
    }
  }
`;

/**
 * __useEditionsQuery__
 *
 * To run a query within a React component, call `useEditionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEditionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEditionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useEditionsQuery(
  baseOptions?: Apollo.QueryHookOptions<EditionsQuery, EditionsQueryVariables>,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<EditionsQuery, EditionsQueryVariables>(
    EditionsDocument,
    options,
  );
}
export function useEditionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    EditionsQuery,
    EditionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<EditionsQuery, EditionsQueryVariables>(
    EditionsDocument,
    options,
  );
}
export function useEditionsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    EditionsQuery,
    EditionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<EditionsQuery, EditionsQueryVariables>(
    EditionsDocument,
    options,
  );
}
export type EditionsQueryHookResult = ReturnType<typeof useEditionsQuery>;
export type EditionsLazyQueryHookResult = ReturnType<
  typeof useEditionsLazyQuery
>;
export type EditionsSuspenseQueryHookResult = ReturnType<
  typeof useEditionsSuspenseQuery
>;
export type EditionsQueryResult = Apollo.QueryResult<
  EditionsQuery,
  EditionsQueryVariables
>;
