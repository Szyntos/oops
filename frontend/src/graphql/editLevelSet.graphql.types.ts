import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type EditLevelSetMutationVariables = Types.Exact<{
  levelSetId: Types.Scalars["Int"]["input"];
  levels: Array<Types.LevelInputType> | Types.LevelInputType;
}>;

export type EditLevelSetMutation = {
  __typename?: "mutation_root";
  editLevelSet: {
    __typename?: "LevelSetType";
    levelSetId: string;
    levelSetName: string;
  };
};

export const EditLevelSetDocument = gql`
  mutation EditLevelSet($levelSetId: Int!, $levels: [LevelInputType!]!) {
    editLevelSet(levelSetId: $levelSetId, levels: $levels) {
      levelSetId
      levelSetName
    }
  }
`;
export type EditLevelSetMutationFn = Apollo.MutationFunction<
  EditLevelSetMutation,
  EditLevelSetMutationVariables
>;

/**
 * __useEditLevelSetMutation__
 *
 * To run a mutation, you first call `useEditLevelSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEditLevelSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [editLevelSetMutation, { data, loading, error }] = useEditLevelSetMutation({
 *   variables: {
 *      levelSetId: // value for 'levelSetId'
 *      levels: // value for 'levels'
 *   },
 * });
 */
export function useEditLevelSetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    EditLevelSetMutation,
    EditLevelSetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    EditLevelSetMutation,
    EditLevelSetMutationVariables
  >(EditLevelSetDocument, options);
}
export type EditLevelSetMutationHookResult = ReturnType<
  typeof useEditLevelSetMutation
>;
export type EditLevelSetMutationResult =
  Apollo.MutationResult<EditLevelSetMutation>;
export type EditLevelSetMutationOptions = Apollo.BaseMutationOptions<
  EditLevelSetMutation,
  EditLevelSetMutationVariables
>;
