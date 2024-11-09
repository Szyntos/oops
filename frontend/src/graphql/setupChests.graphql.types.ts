import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupChestsQueryVariables = Types.Exact<{ [key: string]: never }>;

export type SetupChestsQuery = {
  __typename?: "query_root";
  chests: Array<{
    __typename?: "Chests";
    active: boolean;
    awardBundleCount: number;
    chestId: string;
    imageFileId?: string | null;
    label: string;
    type: string;
    chestAwards: Array<{
      __typename?: "ChestAward";
      award: {
        __typename?: "Award";
        awardId: string;
        awardName: string;
        awardType: string;
        awardValue: string;
        categoryId: string;
        description: string;
        imageFileId?: string | null;
        label: string;
        maxUsages: number;
      };
    }>;
    chestEditions: Array<{ __typename?: "ChestEdition"; editionId: string }>;
  }>;
};

export const SetupChestsDocument = gql`
  query SetupChests {
    chests {
      active
      awardBundleCount
      chestId
      imageFileId
      label
      type
      chestAwards {
        award {
          awardId
          awardName
          awardType
          awardValue
          categoryId
          description
          imageFileId
          label
          maxUsages
        }
      }
      chestEditions {
        editionId
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
 *   },
 * });
 */
export function useSetupChestsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SetupChestsQuery,
    SetupChestsQueryVariables
  >,
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
