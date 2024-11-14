import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CopyEditionMutationVariables = Types.Exact<{
  editionId: Types.Scalars["Int"]["input"];
  editionYear: Types.Scalars["Int"]["input"];
}>;

export type CopyEditionMutation = {
  __typename?: "mutation_root";
  copyEdition?: { __typename?: "EditionType"; editionId: string } | null;
};

export const CopyEditionDocument = gql`
  mutation CopyEdition($editionId: Int!, $editionYear: Int!) {
    copyEdition(editionId: $editionId, editionYear: $editionYear) {
      editionId
    }
  }
`;
export type CopyEditionMutationFn = Apollo.MutationFunction<
  CopyEditionMutation,
  CopyEditionMutationVariables
>;

/**
 * __useCopyEditionMutation__
 *
 * To run a mutation, you first call `useCopyEditionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCopyEditionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [copyEditionMutation, { data, loading, error }] = useCopyEditionMutation({
 *   variables: {
 *      editionId: // value for 'editionId'
 *      editionYear: // value for 'editionYear'
 *   },
 * });
 */
export function useCopyEditionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CopyEditionMutation,
    CopyEditionMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CopyEditionMutation, CopyEditionMutationVariables>(
    CopyEditionDocument,
    options,
  );
}
export type CopyEditionMutationHookResult = ReturnType<
  typeof useCopyEditionMutation
>;
export type CopyEditionMutationResult =
  Apollo.MutationResult<CopyEditionMutation>;
export type CopyEditionMutationOptions = Apollo.BaseMutationOptions<
  CopyEditionMutation,
  CopyEditionMutationVariables
>;
