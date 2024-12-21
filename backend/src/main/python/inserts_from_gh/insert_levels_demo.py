from collections import defaultdict
import requests
import random

def insert_levels(hasura_url, headers, editions, random_gen, max_points_in_level, levels_data):
    def generate_levels():
        level_steps = [0]
        for i in range(1, 8):
            if i < 3:
                level_steps.append(level_steps[-1] + random_gen.randint(40, 60))
            else:
                level_steps.append(level_steps[-1] + random_gen.randint(10, 20))
        for i in range(0, 8):
            level_steps[i] = int(level_steps[i] / level_steps[-1] * max_points_in_level)
        return level_steps

    inserted_levels = {}

    # Iterate over each edition
    for edition_index, edition_id in enumerate(editions.values()):
        print(f"Processing levels for edition ID: {edition_id}")

        # Generate level maximum points for this edition
        if edition_index == 0:
            levels_values = [0, 25, 50, 60, 70, 80, 90, 100]
        else:
            levels_values = generate_levels()

        # Prepare LevelInputType list
        level_inputs = []
        for j, (name, filename, grade) in enumerate(levels_data):
            # Calculate maximumPoints; assuming levels_values has one extra element for cumulative steps
            if j + 1 < len(levels_values):
                maximum_points = levels_values[j + 1]
            else:
                maximum_points = levels_values[-1]

            # Fetch file ID for the image
            query_file_id = """
            query GetFileId($filename: String!) {
                files(where: {fileName: {_eq: $filename}}) {
                    fileId
                }
            }
            """
            variables_file = {"filename": filename}
            try:
                response_file = requests.post(
                    hasura_url,
                    json={"query": query_file_id, "variables": variables_file},
                    headers=headers
                )
                response_file.raise_for_status()
            except requests.exceptions.RequestException as e:
                print(f"HTTP error while fetching file ID for '{filename}': {e}")
                image_file_id = None
            else:
                file_data = response_file.json()
                if "errors" in file_data or not file_data.get("data", {}).get("files"):
                    print(f"Error fetching file ID for '{filename}': {file_data.get('errors', 'File not found')}")
                    image_file_id = None  # or handle as per your requirements
                else:
                    image_file_id = file_data["data"]["files"][0]["fileId"]

            # Prepare the LevelInputType dictionary
            level_input = {
                "name": name,
                "maximumPoints": str(maximum_points),
                "grade": str(grade),
                "imageFileId": image_file_id
            }
            level_inputs.append(level_input)

        level_set_name = ""

        # Mutation to add a level set
        mutation_add_level_set = """
        mutation AddLevelSet($levels: [LevelInputType!]!) {
            addLevelSet(levels: $levels) {
                levelSetId
                levelSetName
                levels {
                    levelId
                    ordinalNumber
                }
            }
        }
        """
        variables_add_level_set = {
            "levels": level_inputs
        }

        try:
            response_add_level_set = requests.post(
                hasura_url,
                json={"query": mutation_add_level_set, "variables": variables_add_level_set},
                headers=headers
            )
            response_add_level_set.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"HTTP error while adding level set for edition {edition_id}: {e}")
            continue  # Skip to the next edition

        data_add_level_set = response_add_level_set.json()

        if "errors" in data_add_level_set:
            print(f"Error adding level set for edition {edition_id}: {data_add_level_set['errors']}")
            continue  # Skip to the next edition

        added_level_set = data_add_level_set["data"]["addLevelSet"]
        print(f"Successfully added level set '{added_level_set['levelSetName']}' with ID {added_level_set['levelSetId']} for edition {edition_id}")

        # Collect level IDs and ordinals
        inserted_levels[edition_id] = [(level["levelId"], level["ordinalNumber"]) for level in added_level_set["levels"]]

        level_set_id = added_level_set["levelSetId"]

        if not level_set_id:
            print(f"Unable to determine levelSet ID for edition {edition_id}. Skipping association.")
            continue

        # Mutation to assign the level set to the edition
        mutation_assign_level_set = """
        mutation AddLevelSetToEdition($levelSetId: Int!, $editionId: Int!) {
            addLevelSetToEdition(levelSetId: $levelSetId, editionId: $editionId) {
                levelSetId
                levelSetName
                edition {
                    editionId
                }
                levels {
                    levelId
                    ordinalNumber
                }
            }
        }
        """
        variables_assign_level_set = {
            "levelSetId": level_set_id,
            "editionId": edition_id
        }

        try:
            response_assign_level_set = requests.post(
                hasura_url,
                json={"query": mutation_assign_level_set, "variables": variables_assign_level_set},
                headers=headers
            )
            response_assign_level_set.raise_for_status()
        except requests.exceptions.RequestException as e:
            print(f"HTTP error while assigning level set {level_set_id} to edition {edition_id}: {e}")
            continue

        data_assign_level_set = response_assign_level_set.json()

        if "errors" in data_assign_level_set:
            print(f"Error assigning level set {level_set_id} to edition {edition_id}: {data_assign_level_set['errors']}")
        else:
            print(f"Successfully assigned level set {level_set_id} to edition {edition_id}")

    print("All levels have been processed.")
    return inserted_levels
