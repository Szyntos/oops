import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type EditEditionMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  editionName: Types.Scalars["String"]["input"];
  editionYear: Types.Scalars["Int"]["input"];
}>;

export type EditEditionMutation = {
  __typename?: "mutation_root";
  editEdition?: { __typename?: "EditionType"; editionId: string } | null;
};

export const EditEditionDocument = gql`
  mutation EditEdition(
    $editionId: Int!
    $editionName: String!
    $editionYear: Int!
  ) {
    editEdition(
      editionId: $editionId
      editionName: $editionName
      editionYear: $editionYear
    ) {
      editionId
    }
  }
`;
export type EditEditionMutationFn = Apollo.MutationFunction<
  EditEditionMutation,
  EditEditionMutationVariables
>;

/**
 * __useEditEditionMutation__
 *
 * To run a mutation, you first call `useEditEditionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditEditionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editEditionMutation, { data, loading, error }] = useEditEditionMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      editionName: // value for 'editionName'
 *      editionYear: // value for 'editionYear'
 *   },
 * });
 */
export function useEditEditionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    EditEditionMutation,
    EditEditionMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<EditEditionMutation, EditEditionMutationVariables>(
    EditEditionDocument,
    options,
  );
}
export type EditEditionMutationHookResult = ReturnType<
  typeof useEditEditionMutation
>;
export type EditEditionMutationResult =
  Apollo.MutationResult<EditEditionMutation>;
export type EditEditionMutationOptions = Apollo.BaseMutationOptions<
  EditEditionMutation,
  EditEditionMutationVariables
>;
