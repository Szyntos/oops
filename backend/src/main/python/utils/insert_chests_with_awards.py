import requests
from collections import defaultdict

def insert_chests_with_awards(hasura_url, headers, editions, chests_data, awards_data, award_id_to_edition_ids, random):
    chest_ids = []
    chest_name_to_filename = {
        chests_data[i][0]: chests_data[i][1] for i in range(len(chests_data))
    }

    awards_in_all_editions = []
    for award_id, edition_ids in award_id_to_edition_ids.items():
        if len(edition_ids) == len(editions):
            awards_in_all_editions.append(award_id)

    awards_not_in_all_editions = list(set(award_id_to_edition_ids.keys()) - set(awards_in_all_editions))

    edition_to_awards_not_all = defaultdict(list)

    # Populate the dictionary with awards not in all editions
    for award_id in awards_not_in_all_editions:
        for edition_id in award_id_to_edition_ids[award_id]:
            edition_to_awards_not_all[edition_id].append(award_id)

    # Convert defaultdict to regular dict for better readability
    edition_to_awards_not_all = dict(edition_to_awards_not_all)
    awards_to_chests = []
    if len(edition_to_awards_not_all) < len(chests_data) - 1:
        for i, chest in enumerate(chests_data[1:]):
            if i < len(edition_to_awards_not_all):
                awards_to_chests.append(edition_to_awards_not_all.popitem() + random.sample(awards_in_all_editions, max(1, len(awards_in_all_editions)-3)))
            else:
                awards_to_chests.append((random.choice(list(editions.values())), random.sample(awards_in_all_editions, max(1, len(awards_in_all_editions)-3))))

    else:
        for edition_id, awards in edition_to_awards_not_all.items():
            awards_to_chests.append((edition_id, awards + random.sample(awards_in_all_editions, max(1, len(awards_in_all_editions)-2))))
    additional_chests = []
    additional_chests.append((random.choice(list(editions.values())), random.sample(awards_in_all_editions, max(1, len(awards_in_all_editions)-3))))

    print("Preparing chests for insertion...")
    editions_for_chest = editions.values()
    chest_id = add_chest(hasura_url, headers, chests_data[0][0], chest_name_to_filename, awards_in_all_editions, editions_for_chest, random)
    if chest_id:
        chest_ids.append(chest_id)
    i = 1
    for edition_id, awards in awards_to_chests:
        chest_id = add_chest(hasura_url, headers, chests_data[i][0], chest_name_to_filename, awards, [edition_id], random)
        if chest_id:
            chest_ids.append(chest_id)
        if i == len(chests_data) - 1:
            i = 0
        i += 1

    for edition_id, awards in additional_chests:
        chest_id = add_chest(hasura_url, headers, chests_data[i][0], chest_name_to_filename, awards, [edition_id], random)
        if chest_id:
            chest_ids.append(chest_id)
        if i == len(chests_data) - 1:
            i = 0
        i += 1
    print("All chests have been processed.")
    return chest_ids

def add_chest(hasura_url, headers, name, chest_name_to_filename, awards, editions_for_chest, random):
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
        "awardBundleCount": random.randint(1, max(1, len(awards))),
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