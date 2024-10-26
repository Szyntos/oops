import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type ChestsToOpenQueryVariables = Types.Exact<{
  userId: Types.Scalars["bigint"]["input"];
}>;

export type ChestsToOpenQuery = {
  __typename?: "query_root";
  users: Array<{
    __typename?: "Users";
    chestHistories: Array<{
      __typename?: "ChestHistory";
      chestHistoryId: string;
      chestId: string;
      createdAt: string;
      label: string;
      opened: boolean;
      subcategoryId: string;
      updatedAt: string;
      teacherId: string;
      userId: string;
      chest: {
        __typename?: "Chests";
        chestAwards: Array<{ __typename?: "ChestAward"; awardId: string }>;
      };
    }>;
  }>;
};

export const ChestsToOpenDocument = gql`
  query ChestsToOpen($userId: bigint!) {
    users(where: { userId: { _eq: $userId } }) {
      chestHistories(
        where: { opened: { _eq: false }, userId: { _eq: $userId } }
      ) {
        chestHistoryId
        chestId
        createdAt
        label
        opened
        subcategoryId
        updatedAt
        teacherId
        userId
        chest {
          chestAwards {
            awardId
          }
        }
      }
    }
  }
`;

/**
 * __useChestsToOpenQuery__
 *
 * To run a query within a React component, call `useChestsToOpenQuery` and pass it any options that fit your needs.
 * When your component renders, `useChestsToOpenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useChestsToOpenQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useChestsToOpenQuery(
  baseOptions: Apollo.QueryHookOptions<
    ChestsToOpenQuery,
    ChestsToOpenQueryVariables
  > &
    (
      | { variables: ChestsToOpenQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<ChestsToOpenQuery, ChestsToOpenQueryVariables>(
    ChestsToOpenDocument,
    options,
  );
}
export function useChestsToOpenLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    ChestsToOpenQuery,
    ChestsToOpenQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<ChestsToOpenQuery, ChestsToOpenQueryVariables>(
    ChestsToOpenDocument,
    options,
  );
}
export function useChestsToOpenSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    ChestsToOpenQuery,
    ChestsToOpenQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<ChestsToOpenQuery, ChestsToOpenQueryVariables>(
    ChestsToOpenDocument,
    options,
  );
}
export type ChestsToOpenQueryHookResult = ReturnType<
  typeof useChestsToOpenQuery
>;
export type ChestsToOpenLazyQueryHookResult = ReturnType<
  typeof useChestsToOpenLazyQuery
>;
export type ChestsToOpenSuspenseQueryHookResult = ReturnType<
  typeof useChestsToOpenSuspenseQuery
>;
export type ChestsToOpenQueryResult = Apollo.QueryResult<
  ChestsToOpenQuery,
  ChestsToOpenQueryVariables
>;
