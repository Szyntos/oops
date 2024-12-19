import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type QuoteVariablesQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type QuoteVariablesQuery = {
  __typename?: "query_root";
  getQuoteVariables: {
    __typename?: "QuoteVariablesType";
    coordinator: {
      __typename?: "UserType";
      firstName: string;
      secondName: string;
    };
    firstPassingLevel?: {
      __typename?: "LevelType";
      levelName: string;
      grade: string;
    } | null;
    gradingCheck?: {
      __typename?: "GradingChecksType";
      endOfLabsDate: string;
      gradingCheckId: string;
      projectPointsThreshold: number;
    } | null;
  };
};

export const QuoteVariablesDocument = gql`
  query QuoteVariables($editionId: Int!) {
    getQuoteVariables(editionId: $editionId) {
      coordinator {
        firstName
        secondName
      }
      firstPassingLevel {
        levelName
        grade
      }
      gradingCheck {
        endOfLabsDate
        gradingCheckId
        projectPointsThreshold
      }
    }
  }
`;

/**
 * __useQuoteVariablesQuery__
 *
 * To run a query within a React component, call `useQuoteVariablesQuery` and pass it any options that fit your needs.
 * When your component renders, `useQuoteVariablesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useQuoteVariablesQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useQuoteVariablesQuery(
  baseOptions: Apollo.QueryHookOptions<
    QuoteVariablesQuery,
    QuoteVariablesQueryVariables
  > &
    (
      | { variables: QuoteVariablesQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<QuoteVariablesQuery, QuoteVariablesQueryVariables>(
    QuoteVariablesDocument,
    options,
  );
}
export function useQuoteVariablesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    QuoteVariablesQuery,
    QuoteVariablesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<QuoteVariablesQuery, QuoteVariablesQueryVariables>(
    QuoteVariablesDocument,
    options,
  );
}
export function useQuoteVariablesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    QuoteVariablesQuery,
    QuoteVariablesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    QuoteVariablesQuery,
    QuoteVariablesQueryVariables
  >(QuoteVariablesDocument, options);
}
export type QuoteVariablesQueryHookResult = ReturnType<
  typeof useQuoteVariablesQuery
>;
export type QuoteVariablesLazyQueryHookResult = ReturnType<
  typeof useQuoteVariablesLazyQuery
>;
export type QuoteVariablesSuspenseQueryHookResult = ReturnType<
  typeof useQuoteVariablesSuspenseQuery
>;
export type QuoteVariablesQueryResult = Apollo.QueryResult<
  QuoteVariablesQuery,
  QuoteVariablesQueryVariables
>;
