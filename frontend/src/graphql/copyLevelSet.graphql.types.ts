import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CopyLevelSetMutationVariables = Types.Exact<{
  levelSetId: Types.Scalars["Int"]["input"];
}>;

export type CopyLevelSetMutation = {
  __typename?: "mutation_root";
  copyLevelSet: { __typename?: "LevelSetType"; levelSetId: string };
};

export const CopyLevelSetDocument = gql`
  mutation CopyLevelSet($levelSetId: Int!) {
    copyLevelSet(levelSetId: $levelSetId) {
      levelSetId
    }
  }
`;
export type CopyLevelSetMutationFn = Apollo.MutationFunction<
  CopyLevelSetMutation,
  CopyLevelSetMutationVariables
>;

/**
 * __useCopyLevelSetMutation__
 *
 * To run a mutation, you first call `useCopyLevelSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCopyLevelSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [copyLevelSetMutation, { data, loading, error }] = useCopyLevelSetMutation({
 *   variables: {
 *      levelSetId: // value for 'levelSetId'
 *   },
 * });
 */
export function useCopyLevelSetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CopyLevelSetMutation,
    CopyLevelSetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CopyLevelSetMutation,
    CopyLevelSetMutationVariables
  >(CopyLevelSetDocument, options);
}
export type CopyLevelSetMutationHookResult = ReturnType<
  typeof useCopyLevelSetMutation
>;
export type CopyLevelSetMutationResult =
  Apollo.MutationResult<CopyLevelSetMutation>;
export type CopyLevelSetMutationOptions = Apollo.BaseMutationOptions<
  CopyLevelSetMutation,
  CopyLevelSetMutationVariables
>;
