import requests


def insert_chest_awards(hasura_url, headers, chest_ids, chests_data, awards_data):
    chest_awards = []
    chest_award_objects = []

    chest_awards_rules = {
        chest[0]: [award[0] for award in awards_data if award[2] in chest[2]] for chest in chests_data
    }

    print("Preparing chest awards for bulk insertion...")

    for chest_id in chest_ids:
        print(f"Processing chest ID: {chest_id}")

        # Fetch the edition_id and chestType associated with the chest
        query_edition = """
        query MyQuery($chestId: bigint!) {
            chests(where: {chestId: {_eq: $chestId}}) {
                editionId
                type
            }
        }
        """
        response_edition = requests.post(
            hasura_url,
            json={"query": query_edition, "variables": {"chestId": chest_id}},
            headers=headers
        )
        chest_data = response_edition.json()
        if "errors" in chest_data:
            print(f"Error fetching edition and type for chest ID {chest_id}: {chest_data['errors']}")
            continue

        chest_edition_id = chest_data["data"]["chests"][0]["editionId"]
        chest_type = chest_data["data"]["chests"][0]["type"]
        print(f"  Edition ID for chest {chest_id}: {chest_edition_id}, Chest Type: {chest_type}")

        # Get the award names that match the chest type based on the rules
        eligible_award_names = chest_awards_rules.get(chest_type, [])
        if not eligible_award_names:
            print(f"  No eligible awards found for chest type '{chest_type}'")
            continue

        # Fetch valid awards associated with the edition
        query_awards = """
        query MyQuery($editionId: bigint!) {
            awardEdition(where: {editionId: {_eq: $editionId}}) {
                awardId
                award {
                    awardName
                }
            }
        }
        """
        response_awards = requests.post(
            hasura_url,
            json={"query": query_awards, "variables": {"editionId": chest_edition_id}},
            headers=headers
        )
        awards_data = response_awards.json()
        if "errors" in awards_data:
            print(f"Error fetching awards for edition ID {chest_edition_id}: {awards_data['errors']}")
            continue

        valid_awards = awards_data["data"]["awardEdition"]
        print(f"  Valid awards for edition {chest_edition_id}: {[award['award']['awardName'] for award in valid_awards]}")

        # Filter valid awards to only those that match the eligible award names
        for award in valid_awards:
            if award["award"]["awardName"] in eligible_award_names:
                award_id = award["awardId"]
                chest_award_objects.append({
                    "chestId": chest_id,
                    "awardId": award_id,
                    "label": ""
                })
                print(f"    Prepared chest award for chest {chest_id} and award {award['award']['awardName']}")

    if chest_award_objects:
        # Perform bulk insert
        mutation = """
        mutation MyMutation($chestAwards: [ChestAwardInsertInput!]!) {
            insertChestAward(objects: $chestAwards) {
                returning {
                    chestId
                    awardId
                }
            }
        }
        """
        variables = {"chestAwards": chest_award_objects}

        response = requests.post(
            hasura_url,
            json={"query": mutation, "variables": variables},
            headers=headers
        )

        data = response.json()
        if "errors" in data:
            print(f"Error during bulk insert of chest awards: {data['errors']}")
        else:
            inserted_chest_awards = data["data"]["insertChestAward"]["returning"]
            for chest_award in inserted_chest_awards:
                chest_awards.append(chest_award["awardId"])
                print(f"Successfully inserted chest award for chest ID {chest_award['chestId']} and award ID {chest_award['awardId']}")

    print("All chest awards have been processed.")
    return chest_awards
