import requests

def insert_groups(hasura_url, headers, editions, random, number_of_groups_per_year_bounds, teacher_ids_and_roles):
    weekdays = [i for i in range(1, 6)]
    timespans = [("08:00", "09:30"), ("10:00", "11:30"), ("12:00", "13:30"), ("14:00", "15:30"), ("16:00", "17:30")]
    groups = []

    teacher_ids = [user_id for user_id, role in teacher_ids_and_roles]

    year_group_counts = {year: random.randint(number_of_groups_per_year_bounds[0], number_of_groups_per_year_bounds[1]) for year in editions.keys()}

    print("Preparing groups for insertion...")

    # Insert groups for each edition year
    for year, count in year_group_counts.items():
        print(f"Processing {count} groups for edition year: {year} (Edition ID: {editions[year]})")
        random.shuffle(teacher_ids)
        for i in range(1, count + 1):
            teacher_id = teacher_ids.pop()
            timespan = random.choice(timespans)
            group_name = f"gr_{i}"
            weekdayId = random.choice(weekdays)

            # Perform addGroup mutation
            mutation = """
            mutation addGroup($editionId: Int!, $usosId: Int!, $weekdayId: Int!, $startTime: String!, $endTime: String!, $teacherId: Int!, $label: String = "", $groupName: String = "") {
                addGroup(
                    editionId: $editionId,
                    usosId: $usosId,
                    weekdayId: $weekdayId,
                    startTime: $startTime,
                    endTime: $endTime,
                    teacherId: $teacherId,
                    label: $label,
                    groupName: $groupName
                ) {
                    groupsId
                    groupName
                    edition {
                        editionId
                    }
                }
            }
            """
            variables = {
                "editionId": editions[year],
                "usosId": i,
                "weekdayId": weekdayId,
                "startTime": timespan[0],
                "endTime": timespan[1],
                "teacherId": teacher_id,
                "label": "",
                "groupName": group_name,
            }

            response = requests.post(
                hasura_url,
                json={"query": mutation, "variables": variables},
                headers=headers
            )
            teacher_ids.insert(0, teacher_id)

            data = response.json()
            if "errors" in data:
                print(f"Error inserting group '{group_name}': {data['errors']}")
            else:
                group = data["data"]["addGroup"]
                group_id = int(group["groupsId"])
                groups.append(group_id)
                print(f"Successfully inserted group '{group['groupName']}' with ID {group_id} for edition ID {group['edition']['editionId']}")

    # Assign photos to groups for each edition
    for edition_id in editions.values():
        mutation_assign_photo = """
        mutation assignPhotosToGroups($editionId: Int!) {
            assignPhotosToGroups(editionId: $editionId)
        }
        """
        variables_assign_photo = {
            "editionId": edition_id,
        }
        response_assign_photo = requests.post(
            hasura_url,
            json={"query": mutation_assign_photo, "variables": variables_assign_photo},
            headers=headers
        )

        if "errors" in response_assign_photo.json():
            print(f"Error assigning photos to groups in edition ID {edition_id}: {response_assign_photo.json()['errors']}")
        else:
            print(f"Successfully assigned photos to groups in edition ID {edition_id}.")

    print("All groups have been processed.")
    return year_group_counts, groups
