import * as Types from "../__generated__/schema.graphql.types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type CreatePointsMutationVariables = Types.Exact<{
  studentId: Types.Scalars["Int"]["input"];
  subcategoryId: Types.Scalars["Int"]["input"];
  teacherId: Types.Scalars["Int"]["input"];
  value: Types.Scalars["Float"]["input"];
}>;

export type CreatePointsMutation = {
  __typename?: "mutation_root";
  addPoints?: {
    __typename?: "PointType";
    value: string;
    updatedAt: string;
    createdAt: string;
    pointsId: string;
    label: string;
    student: {
      __typename?: "UserType";
      firstName: string;
      role: Types.UsersRolesType;
      secondName: string;
      userId: string;
    };
    subcategory: {
      __typename?: "SubcategoryType";
      subcategoryId: string;
      subcategoryName: string;
      category: {
        __typename?: "CategoryType";
        categoryId: string;
        categoryName: string;
      };
    };
    teacher: {
      __typename?: "UserType";
      firstName: string;
      secondName: string;
      userId: string;
      role: Types.UsersRolesType;
    };
  } | null;
};

export const CreatePointsDocument = gql`
  mutation CreatePoints(
    $studentId: Int!
    $subcategoryId: Int!
    $teacherId: Int!
    $value: Float!
  ) {
    addPoints(
      studentId: $studentId
      subcategoryId: $subcategoryId
      teacherId: $teacherId
      value: $value
    ) {
      value
      updatedAt
      createdAt
      pointsId
      student {
        firstName
        role
        secondName
        userId
      }
      subcategory {
        subcategoryId
        subcategoryName
        category {
          categoryId
          categoryName
        }
      }
      teacher {
        firstName
        secondName
        userId
        role
      }
      label
    }
  }
`;
export type CreatePointsMutationFn = Apollo.MutationFunction<
  CreatePointsMutation,
  CreatePointsMutationVariables
>;

/**
 * __useCreatePointsMutation__
 *
 * To run a mutation, you first call `useCreatePointsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreatePointsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createPointsMutation, { data, loading, error }] = useCreatePointsMutation({
 *   variables: {
 *      studentId: // value for 'studentId'
 *      subcategoryId: // value for 'subcategoryId'
 *      teacherId: // value for 'teacherId'
 *      value: // value for 'value'
 *   },
 * });
 */
export function useCreatePointsMutation(
  baseOptions?: Apollo.MutationHookOptions<
    CreatePointsMutation,
    CreatePointsMutationVariables
  >,
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    CreatePointsMutation,
    CreatePointsMutationVariables
  >(CreatePointsDocument, options);
}
export type CreatePointsMutationHookResult = ReturnType<
  typeof useCreatePointsMutation
>;
export type CreatePointsMutationResult =
  Apollo.MutationResult<CreatePointsMutation>;
export type CreatePointsMutationOptions = Apollo.BaseMutationOptions<
  CreatePointsMutation,
  CreatePointsMutationVariables
>;
