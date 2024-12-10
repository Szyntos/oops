import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type FormCategoriesQueryVariables = Types.Exact<{
  editionId: Types.Scalars["bigint"]["input"];
}>;

export type FormCategoriesQuery = {
  __typename?: "query_root";
  categories: Array<{
    __typename?: "Categories";
    categoryId: string;
    categoryName: string;
    lightColor: string;
    darkColor: string;
    canAddPoints: boolean;
    subcategories: Array<{
      __typename?: "Subcategories";
      editionId?: string | null;
      subcategoryId: string;
      subcategoryName: string;
      maxPoints: string;
    }>;
  }>;
};

export const FormCategoriesDocument = gql`
  query FormCategories($editionId: bigint!) {
    categories(
      orderBy: { categoryName: ASC }
      where: { categoryEditions: { editionId: { _eq: $editionId } } }
    ) {
      categoryId
      categoryName
      lightColor
      darkColor
      subcategories(
        orderBy: { ordinalNumber: ASC }
        where: { editionId: { _eq: $editionId } }
      ) {
        editionId
        subcategoryId
        subcategoryName
        maxPoints
      }
      canAddPoints
    }
  }
`;

/**
 * __useFormCategoriesQuery__
 *
 * To run a query within a React component, call `useFormCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useFormCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFormCategoriesQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useFormCategoriesQuery(
  baseOptions: Apollo.QueryHookOptions<
    FormCategoriesQuery,
    FormCategoriesQueryVariables
  > &
    (
      | { variables: FormCategoriesQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<FormCategoriesQuery, FormCategoriesQueryVariables>(
    FormCategoriesDocument,
    options,
  );
}
export function useFormCategoriesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    FormCategoriesQuery,
    FormCategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<FormCategoriesQuery, FormCategoriesQueryVariables>(
    FormCategoriesDocument,
    options,
  );
}
export function useFormCategoriesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    FormCategoriesQuery,
    FormCategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    FormCategoriesQuery,
    FormCategoriesQueryVariables
  >(FormCategoriesDocument, options);
}
export type FormCategoriesQueryHookResult = ReturnType<
  typeof useFormCategoriesQuery
>;
export type FormCategoriesLazyQueryHookResult = ReturnType<
  typeof useFormCategoriesLazyQuery
>;
export type FormCategoriesSuspenseQueryHookResult = ReturnType<
  typeof useFormCategoriesSuspenseQuery
>;
export type FormCategoriesQueryResult = Apollo.QueryResult<
  FormCategoriesQuery,
  FormCategoriesQueryVariables
>;
