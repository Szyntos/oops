import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupGroupsQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupGroupsQuery = {
  __typename?: "query_root";
  listSetupGroups: Array<{
    __typename?: "GroupWithPermissionsType";
    group: {
      __typename?: "GroupType";
      groupName?: string | null;
      generatedName: string;
      groupsId: string;
      startTime: string;
      endTime: string;
      usosId: number;
      weekday: {
        __typename?: "WeekdayType";
        weekdayId: string;
        weekdayName: string;
      };
      teacher: {
        __typename?: "UserType";
        userId: string;
        secondName: string;
        firstName: string;
      };
      imageFile?: { __typename?: "FileType"; fileId: string } | null;
      userGroups: Array<{
        __typename?: "UserGroupType";
        user: {
          __typename?: "UserType";
          firstName: string;
          secondName: string;
          indexNumber: number;
          label: string;
          nick: string;
          role: Types.UsersRolesType;
          userId: string;
          email: string;
          active: boolean;
          imageFile?: { __typename?: "FileType"; fileId: string } | null;
        };
      }>;
    };
    permissions: {
      __typename?: "ListPermissionsOutputType";
      canAdd: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      };
      canCopy: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      };
      canEdit: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      };
      canRemove: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      };
      canSelect: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      };
      canUnselect: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      };
    };
  }>;
};

export const SetupGroupsDocument = gql`
  query SetupGroups($editionId: Int!) {
    listSetupGroups(editionId: $editionId) {
      group {
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
          userId
          secondName
          firstName
        }
        imageFile {
          fileId
        }
        usosId
        userGroups {
          user {
            firstName
            secondName
            imageFile {
              fileId
            }
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
      permissions {
        canAdd {
          allow
          reason
        }
        canCopy {
          allow
          reason
        }
        canEdit {
          allow
          reason
        }
        canRemove {
          allow
          reason
        }
        canSelect {
          allow
          reason
        }
        canUnselect {
          allow
          reason
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
