import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type StudentsQueryVariables = Types.Exact<{
  editionId: Types.Scalars["bigint"]["input"];
}>;

export type StudentsQuery = {
  __typename?: "query_root";
  users: Array<{
    __typename?: "Users";
    userGroups: Array<{
      __typename?: "UserGroups";
      user: {
        __typename?: "Users";
        userId: string;
        firstName: string;
        fullName?: string | null;
        indexNumber: number;
        nick: string;
        imageFileId?: string | null;
        secondName: string;
      };
      group: {
        __typename?: "Groups";
        groupName?: string | null;
        generatedName: string;
        groupsId: string;
        startTime: string;
        teacherId: string;
        endTime: string;
        editionId: string;
        teacher: {
          __typename?: "Users";
          fullName?: string | null;
          userId: string;
        };
        weekday: {
          __typename?: "Weekdays";
          weekdayId: string;
          weekdayName: string;
        };
      };
    }>;
  }>;
};

export const StudentsDocument = gql`
  query Students($editionId: bigint!) {
    users(
      where: {
        role: { _eq: "student" }
        userGroups: { group: { editionId: { _eq: $editionId } } }
      }
    ) {
      userGroups(where: { group: { editionId: { _eq: "1" } } }) {
        user {
          userId
          firstName
          fullName
          indexNumber
          nick
          imageFileId
          secondName
        }
        group {
          groupName
          generatedName
          groupsId
          startTime
          teacherId
          endTime
          editionId
          teacher {
            fullName
            userId
          }
          weekday {
            weekdayId
            weekdayName
          }
        }
      }
    }
  }
`;

/**
 * __useStudentsQuery__
 *
 * To run a query within a React component, call `useStudentsQuery` and pass it any options that fit your needs.
 * When your component renders, `useStudentsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStudentsQuery({
 *   variables: {
 *      editionId: // value for 'editionId'
 *   },
 * });
 */
export function useStudentsQuery(
  baseOptions: Apollo.QueryHookOptions<StudentsQuery, StudentsQueryVariables> &
    ({ variables: StudentsQueryVariables; skip?: boolean } | { skip: boolean }),
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<StudentsQuery, StudentsQueryVariables>(
    StudentsDocument,
    options,
  );
}
export function useStudentsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    StudentsQuery,
    StudentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<StudentsQuery, StudentsQueryVariables>(
    StudentsDocument,
    options,
  );
}
export function useStudentsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    StudentsQuery,
    StudentsQueryVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<StudentsQuery, StudentsQueryVariables>(
    StudentsDocument,
    options,
  );
}
export type StudentsQueryHookResult = ReturnType<typeof useStudentsQuery>;
export type StudentsLazyQueryHookResult = ReturnType<
  typeof useStudentsLazyQuery
>;
export type StudentsSuspenseQueryHookResult = ReturnType<
  typeof useStudentsSuspenseQuery
>;
export type StudentsQueryResult = Apollo.QueryResult<
  StudentsQuery,
  StudentsQueryVariables
>;
