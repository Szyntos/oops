import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type HallOfFameTeacherQueryVariables = Types.Exact<{
  editionId?: Types.InputMaybe<Types.Scalars["bigint"]["input"]>;
}>;

export type HallOfFameTeacherQuery = {
  __typename?: "query_root";
  hallOfFame: Array<{
    __typename?: "HallOfFame";
    editionId?: string | null;
    levelId?: string | null;
    levelName?: string | null;
    nick?: string | null;
    sumOfPoints?: string | null;
    userId?: string | null;
    groupsId?: string | null;
    groupName?: string | null;
    generatedName?: string | null;
    levelImageId?: string | null;
    userImageId?: string | null;
    firstName?: string | null;
    secondName?: string | null;
  }>;
};

export const HallOfFameTeacherDocument = gql`
  query HallOfFameTeacher($editionId: bigint) {
    hallOfFame(
      where: { editionId: { _eq: $editionId } }
      orderBy: [{ sumOfPoints: DESC }, { nick: ASC }]
    ) {
      editionId
      levelId
      levelName
      nick
      sumOfPoints
      userId
      groupsId
      groupName
      generatedName
      levelImageId
      userImageId
      firstName
      secondName
    }
  }
`;

/**
 * __useHallOfFameTeacherQuery__
 *
 * To run a query within a React component, call `useHallOfFameTeacherQuery` and pass it any options that fit your needs.
 * When your component renders, `useHallOfFameTeacherQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useHallOfFameTeacherQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useHallOfFameTeacherQuery(
  baseOptions?: Apollo.QueryHookOptions<
    HallOfFameTeacherQuery,
    HallOfFameTeacherQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    HallOfFameTeacherQuery,
    HallOfFameTeacherQueryVariables
  >(HallOfFameTeacherDocument, options);
}
export function useHallOfFameTeacherLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    HallOfFameTeacherQuery,
    HallOfFameTeacherQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    HallOfFameTeacherQuery,
    HallOfFameTeacherQueryVariables
  >(HallOfFameTeacherDocument, options);
}
export function useHallOfFameTeacherSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    HallOfFameTeacherQuery,
    HallOfFameTeacherQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    HallOfFameTeacherQuery,
    HallOfFameTeacherQueryVariables
  >(HallOfFameTeacherDocument, options);
}
export type HallOfFameTeacherQueryHookResult = ReturnType<
  typeof useHallOfFameTeacherQuery
>;
export type HallOfFameTeacherLazyQueryHookResult = ReturnType<
  typeof useHallOfFameTeacherLazyQuery
>;
export type HallOfFameTeacherSuspenseQueryHookResult = ReturnType<
  typeof useHallOfFameTeacherSuspenseQuery
>;
export type HallOfFameTeacherQueryResult = Apollo.QueryResult<
  HallOfFameTeacherQuery,
  HallOfFameTeacherQueryVariables
>;
