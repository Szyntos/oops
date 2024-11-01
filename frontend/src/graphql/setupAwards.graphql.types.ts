import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupAwardsQueryVariables = Types.Exact<{ [key: string]: never }>;

export type SetupAwardsQuery = {
  __typename?: "query_root";
  award: Array<{
    __typename?: "Award";
    awardId: string;
    awardName: string;
    awardType: string;
    awardValue: string;
    description: string;
    imageFileId?: string | null;
    label: string;
    maxUsages: number;
    categoryId: string;
    awardEditions: Array<{ __typename?: "AwardEdition"; editionId: string }>;
  }>;
};

export const SetupAwardsDocument = gql`
  query SetupAwards {
    award {
      awardEditions {
        editionId
      }
      awardId
      awardName
      awardType
      awardValue
      description
      imageFileId
      label
      maxUsages
      categoryId
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
 *   },
 * });
 */
export function useSetupAwardsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    SetupAwardsQuery,
    SetupAwardsQueryVariables
  >,
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
