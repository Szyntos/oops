import requests
import datetime


def insert_editions(hasura_url, headers, number_of_editions=6):
    editions = {}
    current_year = int(datetime.datetime.now().year)
    print(f"Attempting to insert {number_of_editions} editions starting from {current_year}")
    for year in range(current_year, current_year + number_of_editions + 1):
        name = f"Edition {year}/{year+1}"
        print(f"Attempting to insert edition: {name}")

        mutation = """
        mutation AddEdition($editionName: String!, $editionYear: Int!, $label: String) {
            addEdition(editionName: $editionName, editionYear: $editionYear, label: $label) {
                editionId
                editionName
                editionYear
            }
        }
        """
        variables = {"editionName": name, "editionYear": year, "label": ""}

        response = requests.post(
            hasura_url,
            json={"query": mutation, "variables": variables},
            headers=headers
        )

        data = response.json()
        if "errors" in data:
            print(f"Error inserting edition '{name}': {data['errors']}")
        else:
            returned_data = data["data"]["addEdition"]
            if year != current_year + number_of_editions:
                editions[returned_data["editionYear"]] = returned_data["editionId"]
            print(f"Successfully inserted edition '{name}' with ID {returned_data['editionId']} for year {year}")

    print("All editions have been processed.")
    return editions
