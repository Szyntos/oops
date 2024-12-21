import requests


def insert_subcategories(hasura_url, headers, editions, categories, category_data, random):
    event_names = ["Spooky Spring", "Constructor Christmas", "Polymorphism Presents",
                   "Inheritance Invites", "Encapsulation Extravaganza", "Abstraction Awards", "Recursion Rendezvous",
                   "Iteration Invitations", "Collections Celebration", "Generics Gala", "Concurrency Convention",
                   "Streams Soiree", "Lambda Luncheon", "Modules Mixer", "Patterns Party", "Testing Tournament",
                   "Debugging Dance"]
    special_event_names = ["Gitowe Dziady"]

    editions_type_id_map = {
        "all": [id for id in editions.values()],
        "odd": [id for id in editions.values() if int(id) % 2 != 0],
        "even": [id for id in editions.values() if int(id) % 2 == 0],
        "first": [min(editions.values())],
        "last": [max(editions.values())],
        "random": random.sample(list(editions.values()), len(editions.values()))
    }

    # category_data = [
    #     (
    #         category['name'],
    #         category['number_of_subcategories'],
    #         category['subcategory_prefix'],
    #         category['max_points_per_subcategory'],
    #         category["can_add_points"],
    #         category["editions"]
    #     )
    #     for category in category_data_struct
    # ]

    subcategories_data = {
        category[0]: [(f"{category[2]}{i}", category[3], editions_type_id_map[category[7]]) for i in range(1, category[1] + 1)] if category[2] and category[3] is not None
        else
            [(f"{category[2]}{i}", random.randint(1, 20) * 10, editions_type_id_map[category[7]]) for i in range(1, category[1] + 1)] if category[2] and not category[3] else

            [(special_name, category[3], editions_type_id_map[category[7]]) for special_name in special_event_names] + [(name, category[3], editions_type_id_map[category[7]]) for name in
                                                                        random.sample(event_names, category[1]-1)] if category[3] else
            [(special_name, 10, editions_type_id_map[category[7]]) for special_name in special_event_names] + [(name, random.randint(1, 20) * 10, editions_type_id_map[category[7]]) for name in
                                       random.sample(event_names, category[1] - 1)]
        for category in category_data
    }

    subcategory_to_category = {}
    subcategories = []

    print("Preparing subcategories for insertion...")

    # Insert subcategories for each edition
    for edition_id in editions.values():
        print(f"Processing subcategories for edition ID: {edition_id}")
        for category_name, subcategory_names_and_max_points_and_editions_to_assign in subcategories_data.items():
            ordinal_number = 0
            for subcategory_name, max_points, editions_to_assign in subcategory_names_and_max_points_and_editions_to_assign:
                if edition_id not in editions_to_assign:
                    continue
                print(f"  Preparing subcategory: {subcategory_name} (Category: {category_name}, Max Points: {max_points})")

                # Perform addSubcategory mutation
                mutation = """
                mutation addSubcategory($subcategoryName: String!, $maxPoints: Float!, $ordinalNumber: Int!, $categoryId: Int!, $editionId: Int!, $label: String = "") {
                    addSubcategory(
                        subcategoryName: $subcategoryName,
                        maxPoints: $maxPoints,
                        ordinalNumber: $ordinalNumber,
                        categoryId: $categoryId,
                        editionId: $editionId,
                        label: $label
                    ) {
                        subcategoryId
                        subcategoryName
                        category {
                            categoryId
                        }
                        edition {
                            editionId
                        }
                    }
                }
                """
                variables = {
                    "subcategoryName": subcategory_name,
                    "maxPoints": float(max_points),
                    "ordinalNumber": ordinal_number,
                    "categoryId": categories[category_name],
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
                    print(f"Error inserting subcategory '{subcategory_name}': {data['errors']}")
                else:
                    subcategory = data["data"]["addSubcategory"]
                    subcategory_id = int(subcategory["subcategoryId"])
                    subcategories.append(subcategory_id)
                    subcategory_to_category[subcategory_id] = category_name
                    print(f"Successfully inserted subcategory '{subcategory['subcategoryName']}' with ID {subcategory_id} for edition ID {subcategory['edition']['editionId']} and category ID {subcategory['category']['categoryId']}")

                ordinal_number += 1

    print("All subcategories have been processed.")
    return subcategories, subcategory_to_category
