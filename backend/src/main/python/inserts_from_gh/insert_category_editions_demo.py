import requests


def insert_category_editions(hasura_url, headers, editions, category_editions_type_map, random):

    admin_header = headers.copy()
    admin_header["Authorization"] = admin_header["Authorization"][:-1] + "0"

    editions_type_year_map = {
        "all": [year for year in editions.keys()],
        "odd": [year for year in editions.keys() if year % 2 != 0],
        "even": [year for year in editions.keys() if year % 2 == 0],
        "first": [min(editions.keys())],
        "last": [max(editions.keys())],
        "random": random.sample(list(editions.keys()), len(editions.keys()))
    }

    for category_id, editions_type_and_name in category_editions_type_map.items():
        print(f"Processing category '{editions_type_and_name[1]}' with ID {category_id}")
        print(editions_type_year_map[editions_type_and_name[0]])
        for year in editions_type_year_map[editions_type_and_name[0]]:
            if year in editions:
                edition_id = editions[year]
                print(f"  Preparing to add category to edition for year {year} (Edition ID: {edition_id})")

                # Perform addCategoryToEdition mutation
                mutation = """
                mutation addCategoryToEdition($categoryId: Int!, $editionId: Int!) {
                    addCategoryToEdition(categoryId: $categoryId, editionId: $editionId) {
                        category {
                            categoryId
                            categoryName
                        }
                        edition {
                            editionId
                            editionYear
                        }
                        label
                    }
                }
                """
                variables = {
                    "categoryId": category_id,
                    "editionId": edition_id
                }

                response = requests.post(
                    hasura_url,
                    json={"query": mutation, "variables": variables},
                    headers=admin_header
                )

                data = response.json()
                if "errors" in data:
                    print(f"Error during adding category to edition: {data['errors']}")
                else:
                    inserted_category_edition = data["data"]["addCategoryToEdition"]
                    print(
                        f"Successfully added category '{inserted_category_edition['category']['categoryName']}' to edition year {inserted_category_edition['edition']['editionYear']}"
                    )

    print("All category editions processed.")
