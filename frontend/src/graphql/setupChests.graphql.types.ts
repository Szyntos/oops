import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupChestsQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupChestsQuery = {
  __typename?: "query_root";
  listSetupChests: Array<{
    __typename?: "ChestWithPermissionsType";
    chest: {
      __typename?: "ChestType";
      awardBundleCount: number;
      chestId: string;
      label: string;
      chestType: string;
      imageFile?: { __typename?: "FileType"; fileId: string } | null;
      chestEdition: Array<{
        __typename?: "ChestEditionType";
        active: boolean;
        edition: { __typename?: "EditionType"; editionId: string };
      } | null>;
      chestAward: Array<{
        __typename?: "ChestAwardType";
        award: {
          __typename?: "AwardType";
          awardId: string;
          awardName: string;
          awardType: Types.AwardTypeType;
          awardValue: string;
          description: string;
          label: string;
          maxUsages: number;
          category: { __typename?: "CategoryType"; categoryId: string };
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

export const SetupChestsDocument = gql`
  query SetupChests($editionId: Int!) {
    listSetupChests(editionId: $editionId) {
      chest {
        awardBundleCount
        chestId
        imageFile {
          fileId
        }
        label
        chestType
        chestEdition {
          edition {
            editionId
          }
          active
        }
        chestAward {
          award {
            awardId
            awardName
            awardType
            awardValue
            category {
              categoryId
            }
            description
            imageFile {
              fileId
            }
            label
            maxUsages
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
 * __useSetupChestsQuery__
 *
 * To run a query within a React component, call `useSetupChestsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupChestsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupChestsQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupChestsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SetupChestsQuery,
    SetupChestsQueryVariables
  > &
    (
      | { variables: SetupChestsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SetupChestsQuery, SetupChestsQueryVariables>(
    SetupChestsDocument,
    options,
  );
}
export function useSetupChestsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupChestsQuery,
    SetupChestsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SetupChestsQuery, SetupChestsQueryVariables>(
    SetupChestsDocument,
    options,
  );
}
export function useSetupChestsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupChestsQuery,
    SetupChestsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SetupChestsQuery, SetupChestsQueryVariables>(
    SetupChestsDocument,
    options,
  );
}
export type SetupChestsQueryHookResult = ReturnType<typeof useSetupChestsQuery>;
export type SetupChestsLazyQueryHookResult = ReturnType<
  typeof useSetupChestsLazyQuery
>;
export type SetupChestsSuspenseQueryHookResult = ReturnType<
  typeof useSetupChestsSuspenseQuery
>;
export type SetupChestsQueryResult = Apollo.QueryResult<
  SetupChestsQuery,
  SetupChestsQueryVariables
>;
