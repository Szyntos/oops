import requests
from tqdm import tqdm


def insert_students(hasura_url, headers, year_group_counts, fake, random, students_per_group_bounds):
    total_groups = sum(year_group_counts.values())
    students_in_group_count = [random.randint(students_per_group_bounds[0], students_per_group_bounds[1]) for _ in
                               range(total_groups)]
    total_students = sum(students_in_group_count)

    def generate_unique_index_number(existing_index_numbers):
        while True:
            index_number = fake.random_int(min=502000, max=504000)
            if index_number not in existing_index_numbers:
                return index_number

    # Insert data into users (students)
    existing_index_numbers = set()
    student_objects = []

    print("Preparing students for insertion...")

    for _ in range(total_students):
        nick = fake.user_name()
        first_name = fake.first_name()
        second_name = fake.last_name()
        index_number = generate_unique_index_number(existing_index_numbers)
        existing_index_numbers.add(index_number)

        student_objects.append({
            "nick": nick,
            "role": "student",
            "indexNumber": index_number,
            "firstName": first_name,
            "secondName": second_name,
            "email": str(index_number) + "@example.com",
            "createFirebaseUser": False,
            "sendEmail": False
        })

    print(f"Inserting {len(student_objects)} students...")

    student_ids = []
    for student in tqdm(student_objects, desc="Inserting students"):
        mutation = """
        mutation addUser($indexNumber: Int!, $nick: String!, $firstName: String!, $secondName: String!, $role: String!, $email: String, $createFirebaseUser: Boolean, $sendEmail: Boolean) {
            addUser(
                indexNumber: $indexNumber
                nick: $nick
                firstName: $firstName
                secondName: $secondName
                role: $role
                email: $email
                createFirebaseUser: $createFirebaseUser
                sendEmail: $sendEmail
            ) {
                userId
            }
        }
        """
        variables = student

        response = requests.post(
            hasura_url,
            json={"query": mutation, "variables": variables},
            headers=headers
        )

        data = response.json()
        if "errors" in data:
            print(f"Error during student insertion: {data['errors']}")
        else:
            student_ids.append(data["data"]["addUser"]["userId"])

    print("All students have been inserted.")
    return student_ids, students_in_group_count

def insert_coordinator(hasura_url, headers, fake):
    # Insert data into users (coordinator)

    print("Preparing coordinator for insertion...")

    # Insert coordinator
    nick = fake.user_name()
    first_name = fake.first_name()
    second_name = fake.last_name()
    index_number = 0
    user_object = {
        "nick": nick,
        "role": "coordinator",
        "indexNumber": index_number,
        "firstName": first_name,
        "secondName": second_name,
        "email": "hot.mamusia.69.2137@gmail.com",
        "createFirebaseUser": True,
        "sendEmail": True,
    }

    print(f"Inserting coordinator...")

    mutation = """
        mutation addUser($indexNumber: Int!, $nick: String!, $firstName: String!, $secondName: String!, $role: String!, $email: String, $createFirebaseUser: Boolean, $sendEmail: Boolean) {
            addUser(
                indexNumber: $indexNumber
                nick: $nick
                firstName: $firstName
                secondName: $secondName
                role: $role
                email: $email
                createFirebaseUser: $createFirebaseUser
                sendEmail: $sendEmail
            ) {
                userId
            }
        }
        """
    variables = user_object

    admin_header = headers.copy()
    admin_header["Authorization"] = "Bearer Bypass0"

    response = requests.post(
        hasura_url,
        json={"query": mutation, "variables": variables},
        headers=admin_header
    )

    data = response.json()
    if "errors" in data:
        print(f"Error during coordinator insertion: {data['errors']}")
        raise Exception("Coordinator insertion failed.")
    else:
        coordinator_id_and_role = (data["data"]["addUser"]["userId"], user_object["role"])

    print("Coordinator has been inserted.")
    return coordinator_id_and_role

def insert_teachers(hasura_url, headers, fake, random, number_of_teachers):
    # Insert data into users (teachers and coordinator)
    existing_index_numbers = set()
    user_objects = []

    print("Preparing teachers for insertion...")

    # Insert teachers
    i = 1
    for _ in range(number_of_teachers):
        nick = fake.user_name()
        first_name = fake.first_name()
        second_name = fake.last_name()
        index_number = 100000 + i
        i += 1
        existing_index_numbers.add(index_number)
        user_objects.append({
            "nick": nick,
            "role": "teacher",
            "indexNumber": index_number,
            "firstName": first_name,
            "secondName": second_name,
            "email": str(index_number) + "@example.com",
            "createFirebaseUser": False,
            "sendEmail": False,
        })

    print(f"Inserting {len(user_objects)} teachers...")

    teacher_ids = []
    for user in tqdm(user_objects, desc="Inserting teachers"):
        mutation = """
        mutation addUser($indexNumber: Int!, $nick: String!, $firstName: String!, $secondName: String!, $role: String!, $email: String, $createFirebaseUser: Boolean, $sendEmail: Boolean) {
            addUser(
                indexNumber: $indexNumber
                nick: $nick
                firstName: $firstName
                secondName: $secondName
                role: $role
                email: $email
                createFirebaseUser: $createFirebaseUser
                sendEmail: $sendEmail
            ) {
                userId
            }
        }
        """
        variables = user

        response = requests.post(
            hasura_url,
            json={"query": mutation, "variables": variables},
            headers=headers
        )

        data = response.json()
        if "errors" in data:
            print(f"Error during teacher insertion: {data['errors']}")
        else:
            teacher_ids.append((data["data"]["addUser"]["userId"], user["role"]))

    print("All teachers have been inserted.")
    return teacher_ids


def assign_photos_to_users(hasura_url, headers, user_ids, random):
    print("Assigning photos to users...")
    for user_id in tqdm(user_ids, desc="Assigning photos to users"):
        # Fetch file ID based on the filename
        query_file_id = """
        query MyQuery {
            files(where: {fileType: {_eq: "image/user"}}) {
                fileId
            }
        }
        """
        response_file = requests.post(
            hasura_url,
            json={"query": query_file_id},
            headers=headers
        )

        file_data = response_file.json()
        if "errors" in file_data or not file_data["data"]["files"]:
            print(f"Error fetching files for type 'image/user': {file_data.get('errors', 'File not found')}")
            continue

        file_ids = [file_data["data"]["files"][i]["fileId"] for i in range(len(file_data["data"]["files"]))]
        file_id = random.choice(file_ids)

        # Assign the photo to the user
        mutation_assign_photo = """
        mutation assignPhotoToUser($userId: Int!, $fileId: Int) {
            assignPhotoToUser(userId: $userId, fileId: $fileId)
        }
        """
        variables_assign_photo = {
            "userId": user_id,
            "fileId": file_id
        }

        response_assign_photo = requests.post(
            hasura_url,
            json={"query": mutation_assign_photo, "variables": variables_assign_photo},
            headers=headers
        )

        if "errors" in response_assign_photo.json():
            print(f"Error assigning photo '{file_id}' to user ID {user_id}: {response_assign_photo.json()['errors']}")

    print("Photo assignment completed.")
