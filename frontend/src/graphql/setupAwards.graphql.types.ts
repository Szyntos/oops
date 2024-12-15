import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupAwardsQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupAwardsQuery = {
  __typename?: "query_root";
  listSetupAwards: Array<{
    __typename?: "AwardWithPermissionsType";
    award: {
      __typename?: "AwardType";
      awardId: string;
      awardName: string;
      awardType: Types.AwardTypeType;
      awardValue: string;
      description: string;
      label: string;
      maxUsages: number;
      awardEditions: Array<{
        __typename?: "AwardEditionType";
        edition: { __typename?: "EditionType"; editionId: string };
      }>;
      category: { __typename?: "CategoryType"; categoryId: string };
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

export const SetupAwardsDocument = gql`
  query SetupAwards($editionId: Int!) {
    listSetupAwards(editionId: $editionId) {
      award {
        awardEditions {
          edition {
            editionId
          }
        }
        awardId
        awardName
        awardType
        awardValue
        description
        label
        maxUsages
        category {
          categoryId
        }
        imageFile {
          fileId
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
 * __useSetupAwardsQuery__
 *
 * To run a query within a React component, call `useSetupAwardsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupAwardsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupAwardsQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupAwardsQuery(
  baseOptions: Apollo.QueryHookOptions<
    SetupAwardsQuery,
    SetupAwardsQueryVariables
  > &
    (
      | { variables: SetupAwardsQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SetupAwardsQuery, SetupAwardsQueryVariables>(
    SetupAwardsDocument,
    options,
  );
}
export function useSetupAwardsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupAwardsQuery,
    SetupAwardsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SetupAwardsQuery, SetupAwardsQueryVariables>(
    SetupAwardsDocument,
    options,
  );
}
export function useSetupAwardsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupAwardsQuery,
    SetupAwardsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SetupAwardsQuery, SetupAwardsQueryVariables>(
    SetupAwardsDocument,
    options,
  );
}
export type SetupAwardsQueryHookResult = ReturnType<typeof useSetupAwardsQuery>;
export type SetupAwardsLazyQueryHookResult = ReturnType<
  typeof useSetupAwardsLazyQuery
>;
export type SetupAwardsSuspenseQueryHookResult = ReturnType<
  typeof useSetupAwardsSuspenseQuery
>;
export type SetupAwardsQueryResult = Apollo.QueryResult<
  SetupAwardsQuery,
  SetupAwardsQueryVariables
>;
