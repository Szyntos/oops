import requests

def insert_initial_coordinator(hasura_url, headers):
    # Insert data into users (coordinator)

    print("Preparing coordinator for insertion...")

    # Insert coordinator
    nick = "admin"
    first_name = "Admin"
    second_name = "Admin"
    index_number = 0
    user_object = {
        "nick": nick,
        "role": "coordinator",
        "indexNumber": index_number,
        "firstName": first_name,
        "secondName": second_name,
        "email": "oops.gamification@gmail.com",
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
    admin_header["Authorization"] = admin_header["Authorization"][:-1] + "0"

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