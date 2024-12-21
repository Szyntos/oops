import requests


def insert_awards(hasura_url, headers, awards):
    award_ids = []
    award_editions_type_map = {}

    for name, filename, award_type, award_value, category_id, max_usages, description, label, editions_type in awards:
        print(
            f"Attempting to insert award: {name} (Type: {award_type}, Value: {award_value}, Category ID: {category_id}, Max Usages: {max_usages})")

        # Perform addAward mutation
        mutation = """
        mutation addAward($awardName: String!, $awardType: String!, $awardValue: Float!, $categoryId: Int!, $maxUsages: Int = -1, $description: String!, $label: String = "") {
            addAward(
                awardName: $awardName,
                awardType: $awardType,
                awardValue: $awardValue,
                categoryId: $categoryId,
                maxUsages: $maxUsages,
                description: $description,
                label: $label
            ) {
                awardId
                awardName
            }
        }
        """
        variables = {
            "awardName": name,
            "awardType": award_type,
            "awardValue": award_value,
            "categoryId": category_id,
            "maxUsages": max_usages,
            "description": description,
            "label": ""
        }

        response = requests.post(
            hasura_url,
            json={"query": mutation, "variables": variables},
            headers=headers
        )

        data = response.json()
        if "errors" in data:
            print(f"Error inserting award '{name}': {data['errors']}")
        else:
            returned_data = data["data"]["addAward"]
            award_id = int(returned_data["awardId"])
            award_ids.append(award_id)
            award_editions_type_map[award_id] = [editions_type, name]
            print(f"Successfully inserted award '{name}' with ID {award_id}")

            # Fetch file ID based on the filename
            query_file_id = """
            query MyQuery($filename: String!) {
                files(where: {fileName: {_eq: $filename}}) {
                    fileId
                }
            }
            """
            response_file = requests.post(
                hasura_url,
                json={"query": query_file_id, "variables": {"filename": filename}},
                headers=headers
            )

            file_data = response_file.json()
            if "errors" in file_data or not file_data["data"]["files"]:
                print(f"Error fetching file ID for '{filename}': {file_data.get('errors', 'File not found')}")
                continue

            file_id = file_data["data"]["files"][0]["fileId"]

            # Assign the photo to the award
            mutation_assign_photo = """
            mutation AssignPhotoToAward($awardId: Int!, $fileId: Int) {
                assignPhotoToAward(awardId: $awardId, fileId: $fileId)
            }
            """
            variables_assign_photo = {
                "awardId": award_id,
                "fileId": file_id
            }

            response_assign_photo = requests.post(
                hasura_url,
                json={"query": mutation_assign_photo, "variables": variables_assign_photo},
                headers=headers
            )

            if "errors" in response_assign_photo.json():
                print(f"Error assigning photo '{filename}' to award ID {award_id}: {response_assign_photo.json()['errors']}")
            else:
                print(f"Successfully assigned photo '{filename}' to award ID {award_id}.")

    print("All awards have been processed.")
    return award_ids, award_editions_type_map
