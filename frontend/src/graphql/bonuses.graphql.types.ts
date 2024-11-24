import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type BonusesQueryVariables = Types.Exact<{
  studentId: Types.Scalars["bigint"]["input"];
  editionId: Types.Scalars["bigint"]["input"];
}>;

export type BonusesQuery = {
  __typename?: "query_root";
  bonuses: Array<{
    __typename?: "Bonuses";
    bonusId: string;
    updatedAt: string;
    createdAt: string;
    award: {
      __typename?: "Award";
      awardId: string;
      awardName: string;
      awardType: string;
      awardValue: string;
      imageFileId?: string | null;
      description: string;
    };
    point: { __typename?: "Points"; value: string };
  }>;
};

export const BonusesDocument = gql`
  query Bonuses($studentId: bigint!, $editionId: bigint!) {
    bonuses(
      where: {
        point: {
          studentId: { _eq: $studentId }
          subcategory: { editionId: { _eq: $editionId } }
        }
      }
    ) {
      bonusId
      award {
        awardId
        awardName
        awardType
        awardValue
        imageFileId
        description
      }
      updatedAt
      createdAt
      point {
        value
      }
    }
  }
`;

/**
 * __useBonusesQuery__
 *
 * To run a query within a React component, call `useBonusesQuery` and pass it any options that fit your needs.
 * When your component renders, `useBonusesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useBonusesQuery({
 *   variables: {
 *      studentId: // value for 'studentId'
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useBonusesQuery(
  baseOptions: Apollo.QueryHookOptions<BonusesQuery, BonusesQueryVariables> &
    ({ variables: BonusesQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<BonusesQuery, BonusesQueryVariables>(
    BonusesDocument,
    options,
  );
}
export function useBonusesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    BonusesQuery,
    BonusesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<BonusesQuery, BonusesQueryVariables>(
    BonusesDocument,
    options,
  );
}
export function useBonusesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    BonusesQuery,
    BonusesQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<BonusesQuery, BonusesQueryVariables>(
    BonusesDocument,
    options,
  );
}
export type BonusesQueryHookResult = ReturnType<typeof useBonusesQuery>;
export type BonusesLazyQueryHookResult = ReturnType<typeof useBonusesLazyQuery>;
export type BonusesSuspenseQueryHookResult = ReturnType<
  typeof useBonusesSuspenseQuery
>;
export type BonusesQueryResult = Apollo.QueryResult<
  BonusesQuery,
  BonusesQueryVariables
>;
