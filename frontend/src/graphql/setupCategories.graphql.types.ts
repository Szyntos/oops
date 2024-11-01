import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupCategoriesQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type SetupCategoriesQuery = {
  __typename?: "query_root";
  categories: Array<{
    __typename?: "Categories";
    categoryId: string;
    categoryName: string;
    canAddPoints: boolean;
    categoryEditions: Array<{
      __typename?: "CategoryEdition";
      editionId: string;
    }>;
    subcategories: Array<{
      __typename?: "Subcategories";
      editionId?: string | null;
      subcategoryId: string;
      subcategoryName: string;
      maxPoints: string;
      ordinalNumber: number;
    }>;
  }>;
};

export const SetupCategoriesDocument = gql`
  query SetupCategories {
    categories(orderBy: { categoryName: ASC }) {
      categoryId
      categoryName
      categoryEditions {
        editionId
      }
      subcategories(orderBy: { ordinalNumber: ASC }) {
        editionId
        subcategoryId
        subcategoryName
        maxPoints
        ordinalNumber
      }
      canAddPoints
    }
  }
`;

/**
 * __useSetupCategoriesQuery__
 *
 * To run a query within a React component, call `useSetupCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useSetupCategoriesQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SetupCategoriesQuery,
    SetupCategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SetupCategoriesQuery, SetupCategoriesQueryVariables>(
    SetupCategoriesDocument,
    options,
  );
}
export function useSetupCategoriesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupCategoriesQuery,
    SetupCategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SetupCategoriesQuery,
    SetupCategoriesQueryVariables
  >(SetupCategoriesDocument, options);
}
export function useSetupCategoriesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupCategoriesQuery,
    SetupCategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SetupCategoriesQuery,
    SetupCategoriesQueryVariables
  >(SetupCategoriesDocument, options);
}
export type SetupCategoriesQueryHookResult = ReturnType<
  typeof useSetupCategoriesQuery
>;
export type SetupCategoriesLazyQueryHookResult = ReturnType<
  typeof useSetupCategoriesLazyQuery
>;
export type SetupCategoriesSuspenseQueryHookResult = ReturnType<
  typeof useSetupCategoriesSuspenseQuery
>;
export type SetupCategoriesQueryResult = Apollo.QueryResult<
  SetupCategoriesQuery,
  SetupCategoriesQueryVariables
>;
