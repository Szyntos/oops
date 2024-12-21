import requests
from collections import defaultdict

def insert_chests_with_awards(hasura_url, headers, chests_data, awards_data, editions, random):
    chest_ids = []
    chest_name_to_filename = {
        chests_data[i][0]: chests_data[i][1] for i in range(len(chests_data))
    }

    edition_ids = list(editions.values())

    for name, filename, content_type, awardBundleCount, content in chests_data:
        chest_ids.append(add_chest(hasura_url, headers, name, chest_name_to_filename, content, edition_ids, awardBundleCount))

    print("All chests have been processed.")
    return chest_ids

def add_chest(hasura_url, headers, name, chest_name_to_filename, awards, editions_for_chest, awardBundleCount):
    filename = chest_name_to_filename[name]
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
        return None

    file_id = file_data["data"]["files"][0]["fileId"]

    mutation = """
                mutation addChest($chestType: String!, $fileId: Int, $awardBundleCount: Int! $label: String = "", $awardIds: [Int!]!) {
                    addChest(
                        chestType: $chestType,
                        fileId: $fileId,
                        awardBundleCount: $awardBundleCount,
                        label: $label,
                        awardIds: $awardIds
                    ) {
                        chestId
                        chestType
                    }
                }
                """
    variables = {
        "chestType": name,
        "fileId": file_id,
        "awardBundleCount": awardBundleCount,
        "label": "",
        "awardIds": awards
    }

    response = requests.post(
        hasura_url,
        json={"query": mutation, "variables": variables},
        headers=headers
    )

    data = response.json()
    if "errors" in data:
        print(f"Error inserting chest '{name}': {data['errors']}")
        return None

    chest = data["data"]["addChest"]
    print(
        f"Successfully inserted chest '{chest['chestType']}' with ID {chest['chestId']}")

    for edition in editions_for_chest:
        mutation = """
                    mutation addChestToEdition($chestId: Int!, $editionId: Int!) {
                        addChestToEdition(
                            chestId: $chestId,
                            editionId: $editionId
                        ) {
                            chest {
                                chestId
                            }
                            edition {
                                editionId
                            }
                        }
                    }
                    """
        variables = {
            "chestId": chest['chestId'],
            "editionId": edition
        }

        response = requests.post(
            hasura_url,
            json={"query": mutation, "variables": variables},
            headers=headers
        )

        data = response.json()
        if "errors" in data:
            print(f"Error inserting chest edition for chest ID {chest['chestId']} and edition ID {edition}: {data['errors']}")
            return None

        print(f"Successfully inserted chest edition for chest ID {chest['chestId']} and edition ID {edition}")

    return chest['chestId']