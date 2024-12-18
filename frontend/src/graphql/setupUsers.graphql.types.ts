import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupUsersQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupUsersQuery = {
  __typename?: "query_root";
  listSetupUsers: Array<{
    __typename?: "UserWithPermissionsType";
    user: {
      __typename?: "UserType";
      firstName: string;
      secondName: string;
      indexNumber: number;
      nick: string;
      role: Types.UsersRolesType;
      userId: string;
      email: string;
      active: boolean;
      imageFile?: { __typename?: "FileType"; fileId: string } | null;
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
      canMarkAsActive?: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      } | null;
      canMarkAsInactive?: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      } | null;
      canActivate?: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      } | null;
      canDeactivate?: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      } | null;
    };
  }>;
};

export const SetupUsersDocument = gql`
  query SetupUsers($editionId: Int!) {
    listSetupUsers(editionId: $editionId) {
      user {
        firstName
        imageFile {
          fileId
        }
        firstName
        secondName
        indexNumber
        nick
        role
        secondName
        userId
        email
        active
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
        canMarkAsActive {
          allow
          reason
        }
        canMarkAsInactive {
          allow
          reason
        }
        canActivate {
          allow
          reason
        }
        canDeactivate {
          allow
          reason
        }
      }
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
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupUsersQuery(
  baseOptions: Apollo.QueryHookOptions<
    SetupUsersQuery,
    SetupUsersQueryVariables
  > &
    (
      | { variables: SetupUsersQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
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
