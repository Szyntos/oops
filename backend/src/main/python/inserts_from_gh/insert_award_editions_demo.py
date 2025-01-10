import requests


def insert_award_editions(hasura_url, headers, editions, award_editions_type_map, random):
    # Map of awards to their respective editions
    editions_type_year_map = {
        "all": [year for year in editions.keys()],
        "odd": [year for year in editions.keys() if year % 2 != 0],
        "even": [year for year in editions.keys() if year % 2 == 0],
        "first": [min(editions.keys())],
        "last": [max(editions.keys())],
        "random": random.sample(list(editions.keys()), len(editions.keys()))
    }
    award_id_to_edition_ids = {}
    # Process each award and add it to the specified editions
    for award_id, editions_type_and_name in award_editions_type_map.items():
        print(f"Processing award '{editions_type_and_name[1]}' with ID {award_id}")
        print(editions_type_year_map[editions_type_and_name[0]])
        for year in editions_type_year_map[editions_type_and_name[0]]:
            if year in editions:
                edition_id = editions[year]
                print(f"  Preparing to add award to edition for year {year} (Edition ID: {edition_id})")

                # Perform addAwardToEdition mutation
                mutation = """
                mutation addAwardToEdition($awardId: Int!, $editionId: Int!) {
                    addAwardToEdition(awardId: $awardId, editionId: $editionId) {
                        award{
                            awardId
                        }
                        edition{
                            editionId
                        }
                    }
                }
                """
                variables = {
                    "awardId": award_id,
                    "editionId": edition_id
                }

                response = requests.post(
                    hasura_url,
                    json={"query": mutation, "variables": variables},
                    headers=headers
                )

                data = response.json()
                if "errors" in data:
                    print(f"Error adding award ID {award_id} to edition ID {edition_id}: {data['errors']}")
                else:
                    inserted_award_edition = data["data"]["addAwardToEdition"]
                    print(
                        f"Successfully added award ID {inserted_award_edition['award']['awardId']} to edition ID {inserted_award_edition['edition']['editionId']}")
                    if award_id in award_id_to_edition_ids:
                        award_id_to_edition_ids[award_id].append(edition_id)
                    else:
                        award_id_to_edition_ids[award_id] = [edition_id]

    print("All award editions processed.")
    return award_id_to_edition_ids
