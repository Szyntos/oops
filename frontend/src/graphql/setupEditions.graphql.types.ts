import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupEditionsQueryVariables = Types.Exact<{ [key: string]: never }>;

export type SetupEditionsQuery = {
  __typename?: "query_root";
  listSetupEditions: Array<{
    __typename?: "EditionWithPermissionsType";
    edition: {
      __typename?: "EditionType";
      editionId: string;
      startDate: string;
      endDate: string;
      editionName: string;
      editionYear: number;
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

export const SetupEditionsDocument = gql`
  query SetupEditions {
    listSetupEditions {
      edition {
        editionId
        startDate
        endDate
        editionName
        editionYear
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
 * __useSetupEditionsQuery__
 *
 * To run a query within a React component, call `useSetupEditionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupEditionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupEditionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useSetupEditionsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SetupEditionsQuery,
    SetupEditionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SetupEditionsQuery, SetupEditionsQueryVariables>(
    SetupEditionsDocument,
    options,
  );
}
export function useSetupEditionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupEditionsQuery,
    SetupEditionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SetupEditionsQuery, SetupEditionsQueryVariables>(
    SetupEditionsDocument,
    options,
  );
}
export function useSetupEditionsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupEditionsQuery,
    SetupEditionsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SetupEditionsQuery,
    SetupEditionsQueryVariables
  >(SetupEditionsDocument, options);
}
export type SetupEditionsQueryHookResult = ReturnType<
  typeof useSetupEditionsQuery
>;
export type SetupEditionsLazyQueryHookResult = ReturnType<
  typeof useSetupEditionsLazyQuery
>;
export type SetupEditionsSuspenseQueryHookResult = ReturnType<
  typeof useSetupEditionsSuspenseQuery
>;
export type SetupEditionsQueryResult = Apollo.QueryResult<
  SetupEditionsQuery,
  SetupEditionsQueryVariables
>;
