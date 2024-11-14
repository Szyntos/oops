import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupUsersQueryVariables = Types.Exact<{ [key: string]: never }>;

export type SetupUsersQuery = {
  __typename?: "query_root";
  users: Array<{
    __typename?: "Users";
    firstName: string;
    imageFileId?: string | null;
    fullName?: string | null;
    indexNumber: number;
    nick: string;
    role: string;
    secondName: string;
    userId: string;
    email: string;
    active: boolean;
  }>;
};

export const SetupUsersDocument = gql`
  query SetupUsers {
    users(orderBy: { fullName: ASC }) {
      firstName
      imageFileId
      fullName
      indexNumber
      nick
      role
      secondName
      userId
      email
      active
    }
  }
`;

/**
 * __useSetupUsersQuery__
 *
 * To run a query within a React component, call `useSetupUsersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupUsersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupUsersQuery({
 *   variables: {
 *   },
 * });
 */
export function useSetupUsersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SetupUsersQuery,
    SetupUsersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SetupUsersQuery, SetupUsersQueryVariables>(
    SetupUsersDocument,
    options,
  );
}
export function useSetupUsersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupUsersQuery,
    SetupUsersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SetupUsersQuery, SetupUsersQueryVariables>(
    SetupUsersDocument,
    options,
  );
}
export function useSetupUsersSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupUsersQuery,
    SetupUsersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SetupUsersQuery, SetupUsersQueryVariables>(
    SetupUsersDocument,
    options,
  );
}
export type SetupUsersQueryHookResult = ReturnType<typeof useSetupUsersQuery>;
export type SetupUsersLazyQueryHookResult = ReturnType<
  typeof useSetupUsersLazyQuery
>;
export type SetupUsersSuspenseQueryHookResult = ReturnType<
  typeof useSetupUsersSuspenseQuery
>;
export type SetupUsersQueryResult = Apollo.QueryResult<
  SetupUsersQuery,
  SetupUsersQueryVariables
>;
