import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupGroupsQueryVariables = Types.Exact<{
  editionId: Types.Scalars["bigint"]["input"];
}>;

export type SetupGroupsQuery = {
  __typename?: "query_root";
  editionByPk?: {
    __typename?: "Edition";
    groups: Array<{
      __typename?: "Groups";
      groupName?: string | null;
      generatedName: string;
      groupsId: string;
      startTime: string;
      endTime: string;
      usosId: number;
      weekday: {
        __typename?: "Weekdays";
        weekdayId: string;
        weekdayName: string;
      };
      teacher: {
        __typename?: "Users";
        fullName?: string | null;
        userId: string;
        secondName: string;
        firstName: string;
      };
      file?: { __typename?: "Files"; fileId: string } | null;
      userGroups: Array<{
        __typename?: "UserGroups";
        user: {
          __typename?: "Users";
          firstName: string;
          fullName?: string | null;
          imageFileId?: string | null;
          indexNumber: number;
          label: string;
          nick: string;
          role: string;
          secondName: string;
          userId: string;
          email: string;
          active: boolean;
        };
      }>;
    }>;
  } | null;
};

export const SetupGroupsDocument = gql`
  query SetupGroups($editionId: bigint!) {
    editionByPk(editionId: $editionId) {
      groups {
        groupName
        generatedName
        groupsId
        startTime
        weekday {
          weekdayId
          weekdayName
        }
        endTime
        teacher {
          fullName
          userId
          secondName
          firstName
        }
        file {
          fileId
        }
        usosId
        userGroups(where: { user: { role: { _eq: "student" } } }) {
          user {
            firstName
            fullName
            imageFileId
            indexNumber
            label
            nick
            role
            secondName
            userId
            email
            active
          }
        }
      }
    }
  }
`;

/**
 * __useSetupGroupsQuery__
 *
 * To run a query within a React component, call `useSetupGroupsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupGroupsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupGroupsQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupGroupsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SetupGroupsQuery,
    SetupGroupsQueryVariables
  > &
    (
      | { variables: SetupGroupsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SetupGroupsQuery, SetupGroupsQueryVariables>(
    SetupGroupsDocument,
    options,
  );
}
export function useSetupGroupsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupGroupsQuery,
    SetupGroupsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SetupGroupsQuery, SetupGroupsQueryVariables>(
    SetupGroupsDocument,
    options,
  );
}
export function useSetupGroupsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupGroupsQuery,
    SetupGroupsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SetupGroupsQuery, SetupGroupsQueryVariables>(
    SetupGroupsDocument,
    options,
  );
}
export type SetupGroupsQueryHookResult = ReturnType<typeof useSetupGroupsQuery>;
export type SetupGroupsLazyQueryHookResult = ReturnType<
  typeof useSetupGroupsLazyQuery
>;
export type SetupGroupsSuspenseQueryHookResult = ReturnType<
  typeof useSetupGroupsSuspenseQuery
>;
export type SetupGroupsQueryResult = Apollo.QueryResult<
  SetupGroupsQuery,
  SetupGroupsQueryVariables
>;
