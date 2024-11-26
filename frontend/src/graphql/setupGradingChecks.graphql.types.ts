import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupGradingChecksQueryVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
}>;

export type SetupGradingChecksQuery = {
  __typename?: "query_root";
  listSetupGradingChecks: {
    __typename?: "GradingCheckWithPermissions";
    gradingCheck?: {
      __typename?: "GradingChecksType";
      gradingCheckId: string;
      endOfLabsDate: string;
      projectPointsThreshold: number;
      endOfLabsLevelsThreshold: {
        __typename?: "LevelType";
        grade: string;
        highest: boolean;
        label: string;
        levelId: string;
        levelName: string;
        maximumPoints: string;
        minimumPoints: string;
        ordinalNumber: number;
      };
      project: { __typename?: "CategoryType"; categoryId: string };
    } | null;
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
  };
};

export const SetupGradingChecksDocument = gql`
  query SetupGradingChecks($editionId: Int!) {
    listSetupGradingChecks(editionId: $editionId) {
      gradingCheck {
        gradingCheckId
        endOfLabsDate
        endOfLabsLevelsThreshold {
          grade
          highest
          label
          levelId
          levelName
          maximumPoints
          minimumPoints
          ordinalNumber
        }
        projectPointsThreshold
        project {
          categoryId
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
 * __useSetupGradingChecksQuery__
 *
 * To run a query within a React component, call `useSetupGradingChecksQuery` and pass it any options that fit your needs.
 * When your component renders, `useSetupGradingChecksQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSetupGradingChecksQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useSetupGradingChecksQuery(
  baseOptions: Apollo.QueryHookOptions<
    SetupGradingChecksQuery,
    SetupGradingChecksQueryVariables
  > &
    (
      | { variables: SetupGradingChecksQueryVariables; skip?: boolean }
      | { skip: boolean }
    ),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    SetupGradingChecksQuery,
    SetupGradingChecksQueryVariables
  >(SetupGradingChecksDocument, options);
}
export function useSetupGradingChecksLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    SetupGradingChecksQuery,
    SetupGradingChecksQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    SetupGradingChecksQuery,
    SetupGradingChecksQueryVariables
  >(SetupGradingChecksDocument, options);
}
export function useSetupGradingChecksSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    SetupGradingChecksQuery,
    SetupGradingChecksQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    SetupGradingChecksQuery,
    SetupGradingChecksQueryVariables
  >(SetupGradingChecksDocument, options);
}
export type SetupGradingChecksQueryHookResult = ReturnType<
  typeof useSetupGradingChecksQuery
>;
export type SetupGradingChecksLazyQueryHookResult = ReturnType<
  typeof useSetupGradingChecksLazyQuery
>;
export type SetupGradingChecksSuspenseQueryHookResult = ReturnType<
  typeof useSetupGradingChecksSuspenseQuery
>;
export type SetupGradingChecksQueryResult = Apollo.QueryResult<
  SetupGradingChecksQuery,
  SetupGradingChecksQueryVariables
>;
