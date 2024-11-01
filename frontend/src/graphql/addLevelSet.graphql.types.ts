import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type AddLevelSetMutationVariables = Types.Exact<{
  levels: Array<Types.LevelInputType> | Types.LevelInputType;
}>;

export type AddLevelSetMutation = {
  __typename?: "mutation_root";
  addLevelSet: Array<{
    __typename?: "LevelType";
    grade: string;
    highest: boolean;
  }>;
};

export const AddLevelSetDocument = gql`
  mutation AddLevelSet($levels: [LevelInputType!]!) {
    addLevelSet(levels: $levels) {
      grade
      highest
    }
  }
`;
export type AddLevelSetMutationFn = Apollo.MutationFunction<
  AddLevelSetMutation,
  AddLevelSetMutationVariables
>;

/**
 * __useAddLevelSetMutation__
 *
 * To run a mutation, you first call `useAddLevelSetMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddLevelSetMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addLevelSetMutation, { data, loading, error }] = useAddLevelSetMutation({
 *   variables: {
 *      levels: // value for 'levels'
 *   },
 * });
 */
export function useAddLevelSetMutation(
  baseOptions?: Apollo.MutationHookOptions<
    AddLevelSetMutation,
    AddLevelSetMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddLevelSetMutation, AddLevelSetMutationVariables>(
    AddLevelSetDocument,
    options,
  );
}
export type AddLevelSetMutationHookResult = ReturnType<
  typeof useAddLevelSetMutation
>;
export type AddLevelSetMutationResult =
  Apollo.MutationResult<AddLevelSetMutation>;
export type AddLevelSetMutationOptions = Apollo.BaseMutationOptions<
  AddLevelSetMutation,
  AddLevelSetMutationVariables
>;
