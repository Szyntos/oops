import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupTeachersQueryVariables = Types.Exact<{ [key: string]: never }>;

export type SetupTeachersQuery = {
  __typename?: "query_root";
  users: Array<{
    __typename?: "Users";
    userId: string;
    role: string;
    fullName?: string | null;
  }>;
};

export const SetupTeachersDocument = gql`
  query SetupTeachers {
    users(
      distinctOn: userId
      where: { role: { _in: ["teacher", "coordinator"] } }
    ) {
      userId
      role
      fullName
    }
  }
`;

/**
 * __useSetupTeachersQuery__
 *
 * To run a query within a React component, call `useSetupTeachersQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupTeachersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupTeachersQuery({
 *   variables: {
 *   },
 * });
 */
export function useSetupTeachersQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SetupTeachersQuery,
    SetupTeachersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SetupTeachersQuery, SetupTeachersQueryVariables>(
    SetupTeachersDocument,
    options,
  );
}
export function useSetupTeachersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupTeachersQuery,
    SetupTeachersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SetupTeachersQuery, SetupTeachersQueryVariables>(
    SetupTeachersDocument,
    options,
  );
}
export function useSetupTeachersSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupTeachersQuery,
    SetupTeachersQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SetupTeachersQuery,
    SetupTeachersQueryVariables
  >(SetupTeachersDocument, options);
}
export type SetupTeachersQueryHookResult = ReturnType<
  typeof useSetupTeachersQuery
>;
export type SetupTeachersLazyQueryHookResult = ReturnType<
  typeof useSetupTeachersLazyQuery
>;
export type SetupTeachersSuspenseQueryHookResult = ReturnType<
  typeof useSetupTeachersSuspenseQuery
>;
export type SetupTeachersQueryResult = Apollo.QueryResult<
  SetupTeachersQuery,
  SetupTeachersQueryVariables
>;
