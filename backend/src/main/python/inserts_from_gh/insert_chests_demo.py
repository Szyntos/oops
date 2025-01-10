import requests

def insert_chests(hasura_url, headers, editions, chests_data):
    chest_ids = []
    chest_name_to_filename = {
        chests_data[i][0]: chests_data[i][1] for i in range(len(chests_data))
    }

    print("Preparing chests for insertion...")

    # Insert chests for all editions
    for year, edition_id in editions.items():
        print(f"Processing chests for edition year: {year} (Edition ID: {edition_id})")
        for name, _, _ in chests_data:
            # Perform addChest mutation
            mutation = """
            mutation addChest($chestType: String!, $editionId: Int!, $label: String = "") {
                addChest(
                    chestType: $chestType,
                    editionId: $editionId,
                    label: $label
                ) {
                    chestId
                    chestType
                    edition {
                        editionId
                        editionYear
                    }
                }
            }
            """
            variables = {
                "chestType": name,
                "editionId": edition_id,
                "label": ""
            }

            response = requests.post(
                hasura_url,
                json={"query": mutation, "variables": variables},
                headers=headers
            )

            data = response.json()
            if "errors" in data:
                print(f"Error inserting chest '{name}': {data['errors']}")
                continue

            chest = data["data"]["addChest"]
            chest_ids.append(chest["chestId"])
            print(f"Successfully inserted chest '{chest['chestType']}' with ID {chest['chestId']} for edition ID {chest['edition']['editionId']}")

            # Fetch file ID based on the filename
            filename = chest_name_to_filename[chest['chestType']]
            chest_id = chest['chestId']
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

            # Assign the photo to the chest
            mutation_assign_photo = """
            mutation AssignPhotoToChest($chestId: Int!, $fileId: Int) {
                assignPhotoToChest(chestId: $chestId, fileId: $fileId)
            }
            """
            variables_assign_photo = {
                "chestId": chest_id,
                "fileId": file_id
            }

            response_assign_photo = requests.post(
                hasura_url,
                json={"query": mutation_assign_photo, "variables": variables_assign_photo},
                headers=headers
            )

            if "errors" in response_assign_photo.json():
                print(f"Error assigning photo '{filename}' to chest ID {chest_id}: {response_assign_photo.json()['errors']}")
            else:
                print(f"Successfully assigned photo '{filename}' to chest ID {chest_id}.")

    print("All chests have been processed.")
    return chest_ids
