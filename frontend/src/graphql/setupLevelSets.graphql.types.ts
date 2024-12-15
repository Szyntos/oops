import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupLevelSetsQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupLevelSetsQuery = {
  __typename?: "query_root";
  listSetupLevelSets: Array<{
    __typename?: "LevelSetWithPermissionsType";
    levelSet: {
      __typename?: "LevelSetType";
      levelSetId: string;
      levelSetName: string;
      levels: Array<{
        __typename?: "LevelType";
        grade: string;
        highest: boolean;
        label: string;
        levelId: string;
        maximumPoints: string;
        minimumPoints: string;
        ordinalNumber: number;
        levelName: string;
        imageFile?: { __typename?: "FileType"; fileId: string } | null;
      }>;
      edition: Array<{ __typename?: "EditionType"; editionId: string }>;
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
      canOverride?: {
        __typename?: "PermissionType";
        allow: boolean;
        reason?: string | null;
      } | null;
      canTurnOffOverride?: {
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

export const SetupLevelSetsDocument = gql`
  query SetupLevelSets($editionId: Int!) {
    listSetupLevelSets(editionId: $editionId) {
      levelSet {
        levelSetId
        levels {
          grade
          highest
          label
          levelId
          maximumPoints
          minimumPoints
          ordinalNumber
          levelName
          imageFile {
            fileId
          }
        }
        levelSetName
        edition {
          editionId
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
        canMarkAsActive {
          allow
          reason
        }
        canMarkAsInactive {
          allow
          reason
        }
        canOverride {
          allow
          reason
        }
        canTurnOffOverride {
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
 * __useSetupLevelSetsQuery__
 *
 * To run a query within a React component, call `useSetupLevelSetsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupLevelSetsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupLevelSetsQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupLevelSetsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SetupLevelSetsQuery,
    SetupLevelSetsQueryVariables
  > &
    (
      | { variables: SetupLevelSetsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SetupLevelSetsQuery, SetupLevelSetsQueryVariables>(
    SetupLevelSetsDocument,
    options,
  );
}
export function useSetupLevelSetsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupLevelSetsQuery,
    SetupLevelSetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SetupLevelSetsQuery, SetupLevelSetsQueryVariables>(
    SetupLevelSetsDocument,
    options,
  );
}
export function useSetupLevelSetsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupLevelSetsQuery,
    SetupLevelSetsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SetupLevelSetsQuery,
    SetupLevelSetsQueryVariables
  >(SetupLevelSetsDocument, options);
}
export type SetupLevelSetsQueryHookResult = ReturnType<
  typeof useSetupLevelSetsQuery
>;
export type SetupLevelSetsLazyQueryHookResult = ReturnType<
  typeof useSetupLevelSetsLazyQuery
>;
export type SetupLevelSetsSuspenseQueryHookResult = ReturnType<
  typeof useSetupLevelSetsSuspenseQuery
>;
export type SetupLevelSetsQueryResult = Apollo.QueryResult<
  SetupLevelSetsQuery,
  SetupLevelSetsQueryVariables
>;
