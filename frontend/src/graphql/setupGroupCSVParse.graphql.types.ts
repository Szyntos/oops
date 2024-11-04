import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type SetupGroupCsvParseMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  fileId: Types.Scalars["Int"]["input"];
}>;

export type SetupGroupCsvParseMutation = {
  __typename?: "mutation_root";
  parseUsersFromCsv: {
    __typename?: "ParsedUsersTypeType";
    users: Array<{
      __typename?: "UserType";
      email: string;
      firebaseUid?: string | null;
      firstName: string;
      indexNumber: number;
      label: string;
      nick: string;
      role: Types.UsersRolesType;
      secondName: string;
      userId: string;
    }>;
  };
};

export const SetupGroupCsvParseDocument = gql`
  mutation SetupGroupCSVParse($editionId: Int!, $fileId: Int!) {
    parseUsersFromCsv(editionId: $editionId, fileId: $fileId) {
      users {
        email
        firebaseUid
        firstName
        indexNumber
        label
        nick
        role
        secondName
        userId
      }
    }
  }
`;
export type SetupGroupCsvParseMutationFn = Apollo.MutationFunction<
  SetupGroupCsvParseMutation,
  SetupGroupCsvParseMutationVariables
>;

/**
 * __useSetupGroupCsvParseMutation__
 *
 * To run a mutation, you first call `useSetupGroupCsvParseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetupGroupCsvParseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setupGroupCsvParseMutation, { data, loading, error }] = useSetupGroupCsvParseMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      fileId: // value for 'fileId'
 *   },
 * });
 */
export function useSetupGroupCsvParseMutation(
  baseOptions?: Apollo.MutationHookOptions<
    SetupGroupCsvParseMutation,
    SetupGroupCsvParseMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    SetupGroupCsvParseMutation,
    SetupGroupCsvParseMutationVariables
  >(SetupGroupCsvParseDocument, options);
}
export type SetupGroupCsvParseMutationHookResult = ReturnType<
  typeof useSetupGroupCsvParseMutation
>;
export type SetupGroupCsvParseMutationResult =
  Apollo.MutationResult<SetupGroupCsvParseMutation>;
export type SetupGroupCsvParseMutationOptions = Apollo.BaseMutationOptions<
  SetupGroupCsvParseMutation,
  SetupGroupCsvParseMutationVariables
>;
