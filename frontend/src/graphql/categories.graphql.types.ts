import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CategoriesQueryVariables = Types.Exact<{
  editionId: Types.Scalars["bigint"]["input"];
}>;

export type CategoriesQuery = {
  __typename?: "query_root";
  categories: Array<{
    __typename?: "Categories";
    categoryId: string;
    categoryName: string;
    darkColor: string;
    lightColor: string;
  }>;
};

export const CategoriesDocument = gql`
  query Categories($editionId: bigint!) {
    categories(
      where: {
        categoryEditions: { editionId: { _eq: $editionId } }
        canAddPoints: { _eq: true }
      }
    ) {
      categoryId
      categoryName
      darkColor
      lightColor
    }
  }
`;

/**
 * __useCategoriesQuery__
 *
 * To run a query within a React component, call `useCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCategoriesQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useCategoriesQuery(
  baseOptions: Apollo.QueryHookOptions<
    CategoriesQuery,
    CategoriesQueryVariables
  > &
    (
      | { variables: CategoriesQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CategoriesQuery, CategoriesQueryVariables>(
    CategoriesDocument,
    options,
  );
}
export function useCategoriesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CategoriesQuery,
    CategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<CategoriesQuery, CategoriesQueryVariables>(
    CategoriesDocument,
    options,
  );
}
export function useCategoriesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CategoriesQuery,
    CategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<CategoriesQuery, CategoriesQueryVariables>(
    CategoriesDocument,
    options,
  );
}
export type CategoriesQueryHookResult = ReturnType<typeof useCategoriesQuery>;
export type CategoriesLazyQueryHookResult = ReturnType<
  typeof useCategoriesLazyQuery
>;
export type CategoriesSuspenseQueryHookResult = ReturnType<
  typeof useCategoriesSuspenseQuery
>;
export type CategoriesQueryResult = Apollo.QueryResult<
  CategoriesQuery,
  CategoriesQueryVariables
>;
