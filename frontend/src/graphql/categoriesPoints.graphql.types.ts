import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CategoriesPointsQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  studentId: Types.Scalars["Int"]["input"];
}>;

export type CategoriesPointsQuery = {
  __typename?: "query_root";
  getSumOfPointsForStudentByCategory: Array<{
    __typename?: "CategoryPointsSumType";
    maxPoints: number;
    sumOfAll: number;
    sumOfBonuses: number;
    sumOfPurePoints: number;
    category: {
      __typename?: "CategoryType";
      categoryName: string;
      categoryId: string;
      darkColor: string;
      lightColor: string;
    };
  }>;
};

export const CategoriesPointsDocument = gql`
  query CategoriesPoints($editionId: Int!, $studentId: Int!) {
    getSumOfPointsForStudentByCategory(
      editionId: $editionId
      studentId: $studentId
    ) {
      maxPoints
      sumOfAll
      sumOfBonuses
      sumOfPurePoints
      category {
        categoryName
        categoryId
        darkColor
        lightColor
      }
    }
  }
`;

/**
 * __useCategoriesPointsQuery__
 *
 * To run a query within a React component, call `useCategoriesPointsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCategoriesPointsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCategoriesPointsQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      studentId: // value for 'studentId'
 *   },
 * });
 */
export function useCategoriesPointsQuery(
  baseOptions: Apollo.QueryHookOptions<
    CategoriesPointsQuery,
    CategoriesPointsQueryVariables
  > &
    (
      | { variables: CategoriesPointsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<CategoriesPointsQuery, CategoriesPointsQueryVariables>(
    CategoriesPointsDocument,
    options,
  );
}
export function useCategoriesPointsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    CategoriesPointsQuery,
    CategoriesPointsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    CategoriesPointsQuery,
    CategoriesPointsQueryVariables
  >(CategoriesPointsDocument, options);
}
export function useCategoriesPointsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    CategoriesPointsQuery,
    CategoriesPointsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    CategoriesPointsQuery,
    CategoriesPointsQueryVariables
  >(CategoriesPointsDocument, options);
}
export type CategoriesPointsQueryHookResult = ReturnType<
  typeof useCategoriesPointsQuery
>;
export type CategoriesPointsLazyQueryHookResult = ReturnType<
  typeof useCategoriesPointsLazyQuery
>;
export type CategoriesPointsSuspenseQueryHookResult = ReturnType<
  typeof useCategoriesPointsSuspenseQuery
>;
export type CategoriesPointsQueryResult = Apollo.QueryResult<
  CategoriesPointsQuery,
  CategoriesPointsQueryVariables
>;
