import requests
from tqdm import tqdm
import scipy
import numpy as np

def insert_points(hasura_url, headers, cursor, editions, teacher_ids, random, category_names_to_populate=["LABORATORY", "TEST"], subcategories_percentage=0.5, chest_percentage=0.01, open_chest_percentage=0.9):
    def get_groups_for_teacher(teacher_id, edition_id):
        query_groups = """
        query MyQuery($teacherId: bigint!, $editionId: bigint!) {
            userGroups(where: {userId: {_eq: $teacherId}, group: {editionId: {_eq: $editionId}}}) {
                group {
                    groupsId
                    groupName
                }
            }
        }
        """
        response_groups = requests.post(
            hasura_url,
            json={"query": query_groups, "variables": {"teacherId": teacher_id, "editionId": edition_id}},
            headers=headers
        )
        return response_groups.json()["data"]["userGroups"]

    def get_students_for_group(group_id):
        query_students = """
        query MyQuery($groupId: bigint!) {
            users(where: {userGroups: {groupId: {_eq: $groupId}}, role: {_eq: "student"}}) {
                userId
            }
        }
        """
        response_students = requests.post(
            hasura_url,
            json={"query": query_students, "variables": {"groupId": group_id}},
            headers=headers
        )
        return response_students.json()["data"]["users"]

    def get_subcategories_for_edition(edition_id, subcategories_percentage, category_names_to_populate):
        query_subcategories = """
        query MyQuery($editionId: bigint!, $categoryNames: [String!]!) {
            subcategories(where: {
                editionId: {_eq: $editionId},
                category: {categoryName: {_in: $categoryNames}}
            }) {
                subcategoryId
                subcategoryName
                maxPoints
                ordinalNumber
            }
        }
        """
        response_subcategories = requests.post(
            hasura_url,
            json={"query": query_subcategories,
                  "variables": {"editionId": edition_id, "categoryNames": category_names_to_populate}},
            headers=headers
        )

        subcategories = response_subcategories.json()["data"]["subcategories"]

        if not subcategories:
            return []

        # Determine the cutoff ordinal based on the specified percentage
        max_ordinal = max(subcategory["ordinalNumber"] for subcategory in subcategories)
        cutoff_ordinal = int(max_ordinal * subcategories_percentage)

        # Filter subcategories below the cutoff ordinal
        return [
            subcategory for subcategory in subcategories
            if subcategory["ordinalNumber"] <= cutoff_ordinal
        ]

    def give_chest_with_probability(student_id, teacher_id, subcategory_id, edition_id):
        if random.random() < chest_percentage:  # 1% chance to give a chest
            query_chests = """
            query MyQuery($editionId: bigint!) {
                chests(where: {chestEditions: {editionId: {_eq: $editionId}}}) {
                    chestId
                }
            }
            """
            response_chests = requests.post(
                hasura_url,
                json={"query": query_chests, "variables": {"editionId": edition_id}},
                headers=headers
            )
            chests = response_chests.json()["data"]["chests"]

            if chests:
                chest_id = random.choice(chests)["chestId"]
                mutation_chest_history = """
                mutation MyMutation($studentId: bigint!, $chestId: bigint!, $subcategoryId: bigint!, $teacherId: bigint!) {
                    insertChestHistory(objects: {
                        userId: $studentId,
                        chestId: $chestId,
                        subcategoryId: $subcategoryId,
                        label: "",
                        teacherId: $teacherId
                    }) {
                        returning {
                            chestHistoryId
                            chestId
                            userId
                            teacherId
                        }
                    }
                }
                """
                variables_chest_history = {
                    "studentId": student_id,
                    "chestId": chest_id,
                    "subcategoryId": subcategory_id,
                    "teacherId": teacher_id
                }
                response_chest_history = requests.post(
                    hasura_url,
                    json={"query": mutation_chest_history, "variables": variables_chest_history},
                    headers=headers
                )

                if "errors" in response_chest_history.json():
                    print(f"Error inserting chest history: {response_chest_history.json()['errors']}")
                else:
                    return response_chest_history.json()["data"]["insertChestHistory"]["returning"][0]
        return None

    def generate_single_point_from_skewed_distribution(max_points):
        mean = max_points * 0.9  # Mean at 90% of max_points
        std_dev = max_points / 5  # Further increased standard deviation to extend the left tail more
        skewness = -6  # Reduced skewness to balance the left tail extension

        skewed_distribution = scipy.stats.skewnorm(skewness, loc=mean, scale=std_dev)
        point = skewed_distribution.rvs()  # Generate a single point

        # Ensure the point is within the range [0, max_points]
        point = np.clip(point, 0, max_points)
        point = round(point, 1)

        return point

    def add_points_for_student(student_id, teacher_id, subcategory_id, max_points):
        # Generating points from a normal distribution
        points = generate_single_point_from_skewed_distribution(max_points)

        mutation_add_points = """
        mutation AddPoints($studentId: Int!, $teacherId: Int!, $value: Float!, $subcategoryId: Int!) {
            addPoints(studentId: $studentId, teacherId: $teacherId, value: $value, subcategoryId: $subcategoryId, checkDates: false) {
                pointsId
                value
                subcategory {
                    subcategoryName
                }
            }
        }
        """
        variables_add_points = {
            "studentId": student_id,
            "teacherId": teacher_id,
            "value": float(points),
            "subcategoryId": subcategory_id
        }

        response_add_points = requests.post(
            hasura_url,
            json={"query": mutation_add_points, "variables": variables_add_points},
            headers=headers
        )

        if "errors" in response_add_points.json():
            print(f"Error adding points for student {student_id}: {response_add_points.json()['errors']}")
        # else:
        #     subcategory_name = response_add_points.json()["data"]["addPointsMutation"]["subcategory"]["subcategoryName"]
        #     print(f"Successfully added {points} points for student {student_id} in subcategory {subcategory_name}.")

    def apply_award_from_chest(chest_history_id, chest_id, student_id, teacher_id):
        # Step 1: The student chooses an award from the chest
        query_awards = """
        query MyQuery($chestId: bigint!) {
            chests(where: {chestId: {_eq: $chestId}}) {
                awardBundleCount
                chestAwards {
                    awardId
                }
            }
        }
        """
        variables = {"chestId": chest_id}

        response_awards = requests.post(
            hasura_url,
            json={"query": query_awards, "variables": variables},
            headers=headers
        )
        available_awards = response_awards.json()["data"]["chests"][0]["chestAwards"]
        awardBundleCount = response_awards.json()["data"]["chests"][0]["awardBundleCount"]

        if not available_awards:
            print(f"No awards available for chest {chest_id}")
            return None

        chosen_award_ids = [award["awardId"] for award in random.sample(available_awards, awardBundleCount)]

        # Step 2: Apply the chosen award using addBonusMutation
        mutation_add_bonus = """
        mutation AddBonus($chestHistoryId: Int!, $awardIds: [Int!]!) {
            addBonus(chestHistoryId: $chestHistoryId, awardIds: $awardIds, checkDates: false) {
                bonus {
                    bonusId
                }
                points {
                    pointsId
                    value
                }
            }
        }
        """
        variables_add_bonus = {
            "chestHistoryId": chest_history_id,
            "awardIds": chosen_award_ids
        }

        response_add_bonus = requests.post(
            hasura_url,
            json={"query": mutation_add_bonus, "variables": variables_add_bonus},
            headers=headers
        )

        if "errors" in response_add_bonus.json():
            print(f"Error applying bonus for chest history {chest_history_id}: {response_add_bonus.json()['errors']}")
            return None

        result = response_add_bonus.json()["data"]["addBonus"][0]
        bonus_id = result["bonus"]["bonusId"]
        points_id = result["points"]["pointsId"]
        points_value = result["points"]["value"]

        # Step 3: Output the result
        # print(
        #     f"Teacher {teacher_id} gave chest {chest_id} to student {student_id}. Award {chosen_award_id} applied. Bonus ID: {bonus_id}, Points ID: {points_id}, Points Value: {points_value}.")

    # Example of modeling the chest-giving process
    chests_given = []

    total_steps = 0  # Calculate the total number of iterations (steps)
    for edition_id in editions.values():
        for teacher_id in teacher_ids:
            groups = get_groups_for_teacher(teacher_id, edition_id)
            for group in groups:
                group_id = group["group"]["groupsId"]
                students = get_students_for_group(group_id)
                subcategories = get_subcategories_for_edition(edition_id, subcategories_percentage, category_names_to_populate)
                for subcategory in subcategories:
                    total_steps += len(students)

    with tqdm(total=total_steps, desc="Processing") as pbar:
        for edition_id in editions.values():
            for teacher_id in teacher_ids:
                groups = get_groups_for_teacher(teacher_id, edition_id)
                for group in groups:
                    group_id = group["group"]["groupsId"]
                    students = get_students_for_group(group_id)
                    subcategories = get_subcategories_for_edition(edition_id, subcategories_percentage, category_names_to_populate)
                    for subcategory in subcategories:
                        subcategory_id = subcategory["subcategoryId"]
                        max_points = float(subcategory["maxPoints"])
                        for student in students:
                            student_id = student["userId"]
                            add_points_for_student(student_id, teacher_id, subcategory_id, max_points)
                            chest_entry = give_chest_with_probability(student_id, teacher_id, subcategory_id, edition_id)
                            if chest_entry:
                                chests_given.append(chest_entry)
                            pbar.update(1)

    # Open 90% of the chests
    chests_to_open = random.sample(chests_given, int(len(chests_given) * open_chest_percentage))
    for chest in tqdm(chests_to_open):
        apply_award_from_chest(chest["chestHistoryId"], chest["chestId"], chest["userId"], chest["teacherId"])

    print("Points and chests have been processed.")
