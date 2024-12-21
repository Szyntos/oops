import requests
import datetime


def insert_grading_checks(hasura_url, headers, editions, inserted_levels):
    grading_checks = {}
    print("Attempting to insert grading checks...")
    for year, edition_id in editions.items():
        print(f"Attempting to insert grading checks for edition: {year}")

        mutation = """
                   mutation AddGradingCheck($editionId: Int!, $endOfLabsDate: String!, $endOfLabsLevelsThreshold: Int!, $projectPointsThreshold: Float!, $projectId: Int!, $checkDates: Boolean = true) {
                       addGradingCheck(editionId: $editionId, endOfLabsDate: $endOfLabsDate, endOfLabsLevelsThreshold: $endOfLabsLevelsThreshold, projectPointsThreshold: $projectPointsThreshold, projectId: $projectId, checkDates: false) {
                            gradingCheckId
                            edition {
                                editionId
                            }
                            endOfLabsDate
                            endOfLabsLevelsThreshold{
                                levelId
                            }
                            projectPointsThreshold
                            project {
                                categoryId
                            }
                       }
                   }
                   """
        endOfLabsDate = datetime.datetime(year + 1, 1, 1).strftime('%Y-%m-%d')
        endOfLabsLevelsThreshold = [level[0] for level in inserted_levels[edition_id] if level[1] == 2][0]
        variables = {
            "editionId": edition_id,
            "endOfLabsDate": endOfLabsDate,
            "endOfLabsLevelsThreshold": endOfLabsLevelsThreshold,
            "projectPointsThreshold": 16,
            "projectId": 3
        }

        response = requests.post(
            hasura_url,
            json={"query": mutation, "variables": variables},
            headers=headers
        )

        data = response.json()
        if "errors" in data:
            print(f"Error inserting grading checks for edition '{year}': {data['errors']}")
        else:
            returned_data = data["data"]["addGradingCheck"]
            print(f"Successfully inserted grading checks for edition '{year}' with ID {returned_data['gradingCheckId']}")

    print("All editions have been processed.")
    return editions
