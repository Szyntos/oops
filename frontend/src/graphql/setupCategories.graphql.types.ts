import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupCategoriesQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupCategoriesQuery = {
  __typename?: "query_root";
  listSetupCategories: Array<{
    __typename?: "CategoryWithPermissionsType";
    category: {
      __typename?: "CategoryType";
      categoryId: string;
      categoryName: string;
      canAddPoints: boolean;
      categoryEdition: Array<{
        __typename?: "CategoryEditionType";
        edition: { __typename?: "EditionType"; editionId: string };
      }>;
      subcategories: Array<{
        __typename?: "SubcategoryType";
        subcategoryId: string;
        subcategoryName: string;
        maxPoints: string;
        ordinalNumber: number;
        edition?: { __typename?: "EditionType"; editionId: string } | null;
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

export const SetupCategoriesDocument = gql`
  query SetupCategories($editionId: Int!) {
    listSetupCategories(editionId: $editionId) {
      category {
        categoryId
        categoryName
        categoryEdition {
          edition {
            editionId
          }
        }
        subcategories {
          edition {
            editionId
          }
          subcategoryId
          subcategoryName
          maxPoints
          ordinalNumber
        }
        canAddPoints
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
 * __useSetupCategoriesQuery__
 *
 * To run a query within a React component, call `useSetupCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupCategoriesQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupCategoriesQuery(
  baseOptions: Apollo.QueryHookOptions<
    SetupCategoriesQuery,
    SetupCategoriesQueryVariables
  > &
    (
      | { variables: SetupCategoriesQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SetupCategoriesQuery, SetupCategoriesQueryVariables>(
    SetupCategoriesDocument,
    options,
  );
}
export function useSetupCategoriesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupCategoriesQuery,
    SetupCategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SetupCategoriesQuery,
    SetupCategoriesQueryVariables
  >(SetupCategoriesDocument, options);
}
export function useSetupCategoriesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupCategoriesQuery,
    SetupCategoriesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SetupCategoriesQuery,
    SetupCategoriesQueryVariables
  >(SetupCategoriesDocument, options);
}
export type SetupCategoriesQueryHookResult = ReturnType<
  typeof useSetupCategoriesQuery
>;
export type SetupCategoriesLazyQueryHookResult = ReturnType<
  typeof useSetupCategoriesLazyQuery
>;
export type SetupCategoriesSuspenseQueryHookResult = ReturnType<
  typeof useSetupCategoriesSuspenseQuery
>;
export type SetupCategoriesQueryResult = Apollo.QueryResult<
  SetupCategoriesQuery,
  SetupCategoriesQueryVariables
>;
