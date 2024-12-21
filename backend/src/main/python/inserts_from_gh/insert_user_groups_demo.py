import requests

def insert_user_groups(hasura_url, headers, students_ids, teachers_ids_and_roles, groups, students_in_group_count, random):
    # Assign students to groups
    random.shuffle(students_ids)

    print("Assigning students to groups in bulk...")

    # Prepare bulk insertion data for students
    user_group_objects = []
    student_index = 0
    for group_id, student_count in zip(groups, students_in_group_count):
        for _ in range(student_count):
            if student_index < len(students_ids):
                student_id = students_ids[student_index]
                user_group_objects.append({
                    "userId": student_id,
                    "groupId": group_id
                })
                student_index += 1

    # Perform bulk insert
    mutation = """
    mutation MyMutation($userGroups: [UserGroupsInsertInput!]!) {
        insertUserGroups(objects: $userGroups) {
            affectedRows
        }
    }
    """
    variables = {
        "userGroups": user_group_objects
    }

    response = requests.post(
        hasura_url,
        json={"query": mutation, "variables": variables},
        headers=headers
    )

    data = response.json()
    if "errors" in data:
        print(f"Error during bulk insert of user groups: {data['errors']}")
    else:
        print(f"Successfully inserted {data['data']['insertUserGroups']['affectedRows']} user groups.")

    print("User group assignments completed.")
