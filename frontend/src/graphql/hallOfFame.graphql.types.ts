import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type HallOfFameQueryVariables = Types.Exact<{
  editionId?: Types.InputMaybe<Types.Scalars["bigint"]["input"]>;
}>;

export type HallOfFameQuery = {
  __typename?: "query_root";
  hallOfFame: Array<{
    __typename?: "HallOfFame";
    editionId?: string | null;
    levelId?: string | null;
    levelName?: string | null;
    nick?: string | null;
    sumOfPoints?: string | null;
    userId?: string | null;
    groupsId?: string | null;
    groupName?: string | null;
    generatedName?: string | null;
    levelImageId?: string | null;
    userImageId?: string | null;
    firstName?: string | null;
    secondName?: string | null;
  }>;
};

export const HallOfFameDocument = gql`
  query HallOfFame($editionId: bigint) {
    hallOfFame(
      where: { editionId: { _eq: $editionId } }
      orderBy: [{ sumOfPoints: DESC }, { nick: ASC }]
    ) {
      editionId
      levelId
      levelName
      nick
      sumOfPoints
      userId
      groupsId
      groupName
      generatedName
      levelImageId
      userImageId
      firstName
      secondName
    }
  }
`;

/**
 * __useHallOfFameQuery__
 *
 * To run a query within a React component, call `useHallOfFameQuery` and pass it any options that fit your needs.
 * When your component renders, `useHallOfFameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHallOfFameQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useHallOfFameQuery(
  baseOptions?: Apollo.QueryHookOptions<
    HallOfFameQuery,
    HallOfFameQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<HallOfFameQuery, HallOfFameQueryVariables>(
    HallOfFameDocument,
    options,
  );
}
export function useHallOfFameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HallOfFameQuery,
    HallOfFameQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<HallOfFameQuery, HallOfFameQueryVariables>(
    HallOfFameDocument,
    options,
  );
}
export function useHallOfFameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    HallOfFameQuery,
    HallOfFameQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<HallOfFameQuery, HallOfFameQueryVariables>(
    HallOfFameDocument,
    options,
  );
}
export type HallOfFameQueryHookResult = ReturnType<typeof useHallOfFameQuery>;
export type HallOfFameLazyQueryHookResult = ReturnType<
  typeof useHallOfFameLazyQuery
>;
export type HallOfFameSuspenseQueryHookResult = ReturnType<
  typeof useHallOfFameSuspenseQuery
>;
export type HallOfFameQueryResult = Apollo.QueryResult<
  HallOfFameQuery,
  HallOfFameQueryVariables
>;
