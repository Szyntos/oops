import requests
import random  # Ensure you import random if you're using it for generating data

def insert_categories(hasura_url, headers, category_data, editions):
    categories = {}
    category_editions_type_map = {}

    # Mapping of editions types to their IDs
    editions_type_id_map = {
        "all": [id for id in editions.values()],
        "odd": [id for id in editions.values() if int(id) % 2 != 0],
        "even": [id for id in editions.values() if int(id) % 2 == 0],
        "first": [min(editions.values())],
        "last": [max(editions.values())],
        "random": random.sample(list(editions.values()), len(editions.values()))
    }

    event_names = ["Quiz1", "Quiz2", "Quiz3", "Quiz4", "Quiz5", "Quiz6", "Quiz7", "Quiz8", "Dodatek Lab1", "Dodatek Lab2", "Dodatek Lab3", "Dodatek Proj1", "Dodatek Proj2", "Constructor Christmas", "Polymorphism Presents"]
    special_event_names = ["Laboratorium z Gita"]

    for category in category_data:

        # "name": "LABORATORY",
        # "number_of_subcategories": 14,
        # "subcategory_prefix": "lab_",
        # "max_points_per_subcategory": 10,
        # "can_add_points": true,
        # "light_color": "#a58bce",
        # "dark_color": "#242263",
        # "editions": "all"
        category_name = category[0]
        number_of_subcategories = category[1]
        subcategory_prefix = category[2] if category[2] is not None else ""
        max_points_per_subcategory = category[3]
        can_add_points = category[4] if category[4] is not None else False
        lightColor = category[5] if category[5] is not None else "#FFFFFF"
        darkColor = category[6] if category[6] is not None else "#000000"
        editions_type = category[7] if category[7] is not None else "all"
        label = ""
        subcategories_list = []

        # Generate subcategories for this category
        editions_to_assign = editions_type_id_map.get(editions_type, [])
        if not editions_to_assign:
            print(f"No editions found for edition type '{editions_type}'")
            continue

        # Prepare subcategories data
        if subcategory_prefix and max_points_per_subcategory is not None:
            subcategories_data = [
                {
                    "subcategoryName": f"{subcategory_prefix}{i}",
                    "maxPoints": max_points_per_subcategory,
                    "ordinalNumber": i - 1,
                    "categoryId": None,  # Will be set in the mutation
                    "editionId": None,   # Not needed here
                    "label": ""
                }
                for i in range(1, number_of_subcategories + 1)
            ]
        elif subcategory_prefix and max_points_per_subcategory is None:
            subcategories_data = [
                {
                    "subcategoryName": f"{subcategory_prefix}{i}",
                    "maxPoints": random.randint(1, 20) * 10,
                    "ordinalNumber": i - 1,
                    "categoryId": None,
                    "editionId": None,
                    "label": ""
                }
                for i in range(1, number_of_subcategories + 1)
            ]
        else:
            if max_points_per_subcategory:
                subcategories_data = [
                    {
                        "subcategoryName": name,
                        "maxPoints": max_points_per_subcategory,
                        "ordinalNumber": idx,
                        "categoryId": None,
                        "editionId": None,
                        "label": ""
                    }
                    for idx, name in enumerate(special_event_names)
                ]
            else:
                subcategories_data = [
                    {
                        "subcategoryName": name,
                        "maxPoints": 0,
                        "ordinalNumber": idx,
                        "categoryId": None,
                        "editionId": None,
                        "label": ""
                    }
                    for idx, name in enumerate(event_names)
                ]

        # Now, include subcategories in the mutation
        mutation = """
        mutation addCategory($categoryName: String!, $canAddPoints: Boolean!, $subcategories: [SubcategoryInputType!]!, $lightColor: String = "#FFFFFF", $darkColor: String = "#000000", $label: String = "") {
            addCategory(
                categoryName: $categoryName,
                canAddPoints: $canAddPoints,
                subcategories: $subcategories,
                lightColor: $lightColor,
                darkColor: $darkColor,
                label: $label
            ) {
                categoryId
                categoryName
                label
            }
        }
        """

        variables = {
            "categoryName": category_name,
            "canAddPoints": can_add_points,
            "subcategories": subcategories_data,
            "lightColor": lightColor,
            "darkColor": darkColor,
            "label": label
        }

        print(f"Attempting to insert category: {category_name}")
        response = requests.post(
            hasura_url,
            json={"query": mutation, "variables": variables},
            headers=headers
        )

        data = response.json()
        if "errors" in data:
            print(f"Error inserting category '{category_name}': {data['errors']}")
        else:
            returned_data = data["data"]["addCategory"]
            categories[returned_data["categoryName"]] = returned_data["categoryId"]
            category_editions_type_map[returned_data["categoryId"]] = [editions_type, returned_data["categoryName"]]
            print(f"Successfully inserted category '{category_name}' with ID {returned_data['categoryId']}")

    print("Final categories inserted with their IDs:", categories)
    return categories, category_editions_type_map
