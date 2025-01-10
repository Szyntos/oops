import os

def insert_data_old(conn, cursor, fake, random):

    owlbear_filenames = ["owlbear1.png", "owlbear2.png", "owlbear3.png", "owlbear4.png",
                         "owlbear5.png", "owlbear6.png", "owlbear7.png"]

    group_filenames = [f"gr{i}.png" for i in range(1, 21)]
    avatar_filenames = [f"avatar{i}.png" for i in range(1, 5)] + [f"av{i}.jpg" for i in range(1, 16)]

    sample_pictures = [("sampleAvatar.png", "image/user/sample"), ("sampleGroup.png", "image/group/sample"),
                       ("sampleLevel.png", "image/level/sample"), ("sampleChest.png", "image/chest/sample"),
                       ("sampleAward.png", "image/award/sample")]


    for filename in owlbear_filenames:
        file_path = os.path.abspath(f"../../../resources/files/{filename}")
        cursor.execute("INSERT INTO files (path_to_file, file_name, file_type, label) VALUES (%s, %s, %s, %s)",
                       (file_path, filename, "image/level", ""))

    for filename in group_filenames:
        file_path = os.path.abspath(f"../../../resources/files/{filename}")
        cursor.execute("INSERT INTO files (path_to_file, file_name, file_type, label) VALUES (%s, %s, %s, %s)",
                       (file_path, filename, "image/group", ""))

    for filename in avatar_filenames:
        file_path = os.path.abspath(f"../../../resources/files/{filename}")
        cursor.execute("INSERT INTO files (path_to_file, file_name, file_type, label) VALUES (%s, %s, %s, %s)",
                       (file_path, filename, "image/user", ""))

    for filename, file_type in sample_pictures:
        file_path = os.path.abspath(f"../../../resources/files/{filename}")
        cursor.execute("INSERT INTO files (path_to_file, file_name, file_type, label) VALUES (%s, %s, %s, %s)",
                       (file_path, filename, file_type, ""))

    category_names = ["LABORATORY", "TEST", "PROJECT", "EVENT"]

    # Insert data into categories
    categories = {}
    for category_name in category_names:
        cursor.execute("INSERT INTO categories (category_name, label) VALUES (%s, %s) RETURNING category_id",
                       (category_name, ""))
        categories[category_name] = cursor.fetchone()[0]

    # Insert data into editions
    editions = {}
    for year in range(2020, 2026):
        name = f"Edition {year}"
        cursor.execute("INSERT INTO edition (name, edition_year, label) VALUES (%s, %s, %s) RETURNING edition_id",
                       (name, year, ""))
        editions[year] = cursor.fetchone()[0]

    # Insert data into chests
    chests = [
        ("Gold Chest", "https://raw.githubusercontent.com/Soamid/obiektowe-lab/master/img/reward_gold.png"),
        ("Silver Chest", "https://raw.githubusercontent.com/Soamid/obiektowe-lab/master/img/reward_silver.png"),
        ("Bronze Chest", "https://raw.githubusercontent.com/Soamid/obiektowe-lab/master/img/reward_bronze.png")
    ]
    chest_ids = []
    for year, edition_id in editions.items():
        for name, image_url in chests:
            cursor.execute("INSERT INTO chests (type, label, edition_id) VALUES (%s, %s, %s) RETURNING chest_id",
                           (name, "", edition_id))
            chest_ids.append(cursor.fetchone()[0])

    # Insert data into awards
    awards = [
        ("Lekarstwo", "additive_next", 10, 1, 6, ""),
        ("Weterynarz", "additive_prev", 20, 2, 2, ""),
        ("Marchewka laboratoryjna", "multiplicative", 0.3, 1, 2, ""),
        ("Marchewka projektowa", "multiplicative", 0.6, 3, 2, ""),
        ("Rabat na sianko", "additive", 12, 1, 2, ""),
        ("LekarstwoV2", "additive_next", 14, 1, 2, ""),
        ("WeterynarzV2", "additive_prev", 16, 2, -1, "")
    ]
    award_ids = []
    award_name_map = {}
    for name, award_type, award_value, category_id, max_usages, label in awards:
        cursor.execute(
            "INSERT INTO award (award_name, award_type, award_value, category_id, max_usages, label) VALUES (%s, %s, %s, %s, %s, %s) RETURNING award_id",
            (name, award_type, award_value, category_id, max_usages, ""))
        award_id = cursor.fetchone()[0]
        award_ids.append(award_id)
        award_name_map[award_id] = name

    # Insert data into award_edition with specific editions for each award
    award_editions = {
        "Lekarstwo": [2020, 2021],
        "Weterynarz": [2021, 2022],
        "Marchewka laboratoryjna": [2020, 2021],
        "Marchewka projektowa": [2021, 2023],
        "Rabat na sianko": [2023, 2024],
        "LekarstwoV2": [2022, 2023],
        "WeterynarzV2": [2024, 2025]
    }

    for award_id, name in zip(award_ids, award_name_map.values()):
        for year in award_editions[name]:
            if year in editions:
                cursor.execute("INSERT INTO award_edition (award_id, edition_id, label) VALUES (%s, %s, %s)",
                               (award_id, editions[year], ""))

    # Insert data into groups
    weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"]
    groups = []
    year_group_counts = {year: random.randint(12, 15) for year in range(2020, 2026)}
    for year, count in year_group_counts.items():
        for i in range(1, count + 1):
            group_name = f"gr_{i}"
            cursor.execute("INSERT INTO groups (group_name, edition_id, label, weekday, start_time, end_time) VALUES (%s, %s, %s, %s, %s, %s) RETURNING groups_id",
                           (group_name, editions[year], "", random.choice(weekdays), "16:00:00", "17:30:00"))
            groups.append(cursor.fetchone()[0])

    total_groups = sum(year_group_counts.values())
    min_students_per_group = 14
    max_students_per_group = 23
    students_in_group_count = [random.randint(min_students_per_group, max_students_per_group) for _ in
                               range(total_groups)]
    total_students = sum(students_in_group_count)

    def generate_unique_index_number(existing_index_numbers):
        while True:
            index_number = fake.random_int(min=502000, max=504000)
            if index_number not in existing_index_numbers:
                return index_number

    # Insert data into users
    existing_index_numbers = set()
    users = []
    roles = ['student'] * total_students + ['teacher'] * 7 + ['coordinator']
    random.shuffle(roles)
    for role in roles:
        nick = fake.user_name()
        first_name = fake.first_name()
        second_name = fake.last_name()
        index_number = generate_unique_index_number(existing_index_numbers)
        existing_index_numbers.add(index_number)
        cursor.execute(
            "INSERT INTO users (nick, role, index_number, first_name, second_name, label) VALUES (%s, %s, %s, %s, %s, %s) RETURNING user_id",
            (nick, role, index_number, first_name, second_name, ""))
        users.append(cursor.fetchone()[0])

    # Assign students to groups
    student_ids = [user_id for user_id, role in zip(users, roles) if role == 'student']
    random.shuffle(student_ids)

    student_index = 0
    for group_id, student_count in zip(groups, students_in_group_count):
        for _ in range(student_count):
            if student_index < len(student_ids):
                student_id = student_ids[student_index]
                cursor.execute("INSERT INTO user_groups (user_id, group_id) VALUES (%s, %s)", (student_id, group_id))
                student_index += 1

    # Assign teachers and coordinators to groups randomly
    teacher_ids = [user_id for user_id, role in zip(users, roles) if role == 'teacher']
    coordinator_id = [user_id for user_id, role in zip(users, roles) if role == 'coordinator'][0]

    # Create a list of all teachers and the coordinator
    teachers_and_coordinator = teacher_ids + [coordinator_id]
    random.shuffle(teachers_and_coordinator)

    # Distribute teachers and coordinator among groups
    teacher_to_student_map = {}
    for group_id in groups:
        assigned_teacher = teachers_and_coordinator.pop()
        cursor.execute("INSERT INTO user_groups (user_id, group_id) VALUES (%s, %s)", (assigned_teacher, group_id))
        teachers_and_coordinator.insert(0, assigned_teacher)  # Rotate list to ensure even distribution
        if assigned_teacher not in teacher_to_student_map:
            teacher_to_student_map[assigned_teacher] = []
        teacher_to_student_map[assigned_teacher].append(group_id)

    def generate_levels():
        levels = [0]
        for i in range(1, 8):
            if i < 3:
                levels.append(levels[-1] + random.randint(40, 60))
            else:
                levels.append(levels[-1] + random.randint(10, 20))
        for i in range(0, 8):
            levels[i] = int(levels[i] / max(levels) * 100)
        return levels

    random_levels = [[0, 25, 50, 60, 70, 80, 90, 100]] + [generate_levels() for _ in range(len(editions.values()) - 1)]
    # Insert data into levels
    for i, edition_id in enumerate(editions.values()):
        levels_values = random_levels[i]
        levels_data = [
            ("Jajo", levels_values[0], levels_values[1], 1, 2.0, "", False, 0),
            ("Pisklak", levels_values[1], levels_values[2], 2, 2.0, "", False, 1),
            ("Podlot", levels_values[2], levels_values[3], 3, 3.0, "", False, 2),
            ("Żółtodziób", levels_values[3], levels_values[4], 4, 3.5, "", False, 3),
            ("Nieopierzony odkrywca", levels_values[4], levels_values[5], 5, 4.0, "", False, 4),
            ("Samodzielny Zwierzak", levels_values[5], levels_values[6], 6, 4.5, "", False, 5),
            ("Majestatyczna Bestia", levels_values[6], levels_values[7], 7, 5.0, "", True, 6)
        ]

        for name, min_points, max_points, image_file_id, grade, label, highest, ordinal_number in levels_data:
            cursor.execute(
                "INSERT INTO levels (name, minimum_points, maximum_points, image_file_id, grade, label, edition_id, highest, ordinal_number) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING level_id",
                (name, min_points, max_points, image_file_id, grade, "", edition_id, highest, ordinal_number))
    # Insert data into subcategories
    subcategories_data = {
        "LABORATORY": [(f"lab_{i}", 10) for i in range(1, 15)],
        "TEST": [(f"kart_{i}", 5) for i in range(1, 15)],
        "PROJECT": [(f"proj_{i}", 50) for i in range(1, 4)],
        "EVENT": [("Gitowe Dziady", 10), ("Spooky Spring", 20), ("Constructor Christmas", 100)]
    }
    subcategory_to_category = {}
    subcategories = []

    for edition_id in editions.values():
        for category_name, subcategory_names_and_max_points in subcategories_data.items():
            ordinal_number = 0
            for subcategory_name, max_points in subcategory_names_and_max_points:
                cursor.execute(
                    "INSERT INTO subcategories (subcategory_name, category_id, label, edition_id, max_points, ordinal_number) VALUES (%s, %s, %s, %s, %s, %s) RETURNING subcategory_id",
                    (subcategory_name, categories[category_name], "", edition_id, max_points, ordinal_number))
                subcategory_id = cursor.fetchone()[0]
                subcategories.append(subcategory_id)
                subcategory_to_category[subcategory_id] = category_name
                ordinal_number += 1

    # Insert data into chest_award
    chest_awards = []
    for chest_id in chest_ids:
        cursor.execute("SELECT edition_id FROM chests WHERE chest_id = %s", (chest_id,))
        chest_edition_id = cursor.fetchone()[0]
        cursor.execute("SELECT award_id FROM award_edition WHERE edition_id = %s", (chest_edition_id,))
        valid_awards = cursor.fetchall()
        for award in valid_awards:
            award_id = award[0]
            cursor.execute(
                "INSERT INTO chest_award (chest_id, award_id, label) VALUES (%s, %s, %s) RETURNING award_id",
                (chest_id, award_id, ""))
            chest_awards.append(cursor.fetchone()[0])

    # Function to model giving a chest to a student, choosing an award, and applying the bonus
    def give_chest_and_apply_award(teacher_id):
        # Choose a random student from the teacher's group
        cursor.execute("""
            SELECT u.user_id, g.edition_id
            FROM users u
            JOIN user_groups ug ON u.user_id = ug.user_id
            JOIN groups g ON ug.group_id = g.groups_id
            WHERE ug.group_id IN (
                SELECT group_id
                FROM user_groups
                WHERE user_id = %s
            ) AND u.role = 'student'
        """, (teacher_id,))
        student_record = cursor.fetchall()
        student_record = random.choice(student_record)
        student_id = student_record[0]
        edition_id = student_record[1]

        # Check that both the teacher and student are in the same edition
        cursor.execute("""
            SELECT 1
            FROM user_groups ug
            JOIN groups g ON ug.group_id = g.groups_id
            WHERE ug.user_id = %s AND g.edition_id = %s
        """, (teacher_id, edition_id))
        if cursor.fetchone() is None:
            print(f"Teacher {teacher_id} is not in the same edition as student {student_id}")
            return

        # 1. Insert a record in the chest_history table to represent the student receiving a chest from the teacher.
        cursor.execute("SELECT chest_id FROM chests WHERE edition_id = %s", (edition_id,))
        chest_id = cursor.fetchall()
        chest_id = random.choice(chest_id)[0]
        subcategory_id = random.choice([s for s in subcategories if
                                        subcategory_to_category[s] in ["EVENT", "PROJECT"] and not cursor.execute(
                                            "SELECT 1 FROM subcategories WHERE subcategory_id = %s AND edition_id = %s",
                                            (s, edition_id)) and cursor.fetchone() is not None])
        cursor.execute(
            "INSERT INTO chest_history (user_id, chest_id, subcategory_id, label, created_at, updated_at, teacher_id) VALUES (%s, %s, %s, %s, NOW(), NOW(), %s) RETURNING chest_history_id",
            (student_id, chest_id, subcategory_id, "", teacher_id)
        )
        chest_history_id = cursor.fetchone()[0]

        # 2. The student chooses an award from the chest.
        cursor.execute("SELECT award_id FROM chest_award WHERE chest_id = %s", (chest_id,))
        available_awards = cursor.fetchall()
        chosen_award_id = random.choice(available_awards)[0]

        # 3. Create an initial point record in the points table for the student by the teacher.
        initial_points = 0
        cursor.execute(
            "INSERT INTO points (student_id, teacher_id, value, subcategory_id, label, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, NOW(), NOW()) RETURNING points_id",
            (student_id, teacher_id, initial_points, subcategory_id, "")
        )
        points_id = cursor.fetchone()[0]

        # 4. Insert a record in the bonuses table for the chosen award.
        cursor.execute(
            "INSERT INTO bonuses (points_id, award_id, created_at, updated_at, label, chest_history_id) VALUES (%s, %s, NOW(), NOW(), %s, %s) RETURNING bonus_id",
            (points_id, chosen_award_id, "", chest_history_id)
        )
        bonus_id = cursor.fetchone()[0]

        # 5. Update the points in the points table based on the chosen award from the bonuses table.
        cursor.execute("SELECT value FROM points WHERE points_id = %s", (points_id,))
        current_points = cursor.fetchone()[0]
        bonus_points = chosen_award_id * 10  # Each award gives points based on award_id * 10
        updated_points = current_points + bonus_points
        cursor.execute("UPDATE points SET value = %s WHERE points_id = %s", (updated_points, points_id))

        # Print user roles and award names
        cursor.execute("SELECT role FROM users WHERE user_id = %s", (teacher_id,))
        teacher_role = cursor.fetchone()[0]
        cursor.execute("SELECT role FROM users WHERE user_id = %s", (student_id,))
        student_role = cursor.fetchone()[0]

        print(
            f"Teacher {teacher_id} ({teacher_role}) gave a chest to student {student_id} ({student_role}). Student chose award {chosen_award_id} ({award_name_map[chosen_award_id]}) and received {bonus_points} bonus points.")

    # New function for adding points for laboratory or test
    def add_points_for_laboratory_or_test(teacher_id):
        # Choose a random student from the teacher's group
        cursor.execute("""
            SELECT u.user_id, g.edition_id
            FROM users u
            JOIN user_groups ug ON u.user_id = ug.user_id
            JOIN groups g ON ug.group_id = g.groups_id
            WHERE ug.group_id IN (
                SELECT group_id
                FROM user_groups
                WHERE user_id = %s
            ) AND u.role = 'student'
        """, (teacher_id,))
        student_record = cursor.fetchall()
        student_record = random.choice(student_record)
        student_id = student_record[0]
        edition_id = student_record[1]

        # Choose a subcategory from LABORATORY or TEST within the student's edition
        cursor.execute("""
            SELECT subcategory_id
            FROM subcategories
            WHERE category_id IN (
                SELECT category_id
                FROM categories
                WHERE category_name IN ('LABORATORY', 'TEST')
            ) AND edition_id = %s
        """, (edition_id,))
        subcategory_id = cursor.fetchall()
        subcategory_id = random.choice(subcategory_id)[0]

        # Add points to the student for the chosen subcategory
        points = random.randint(5, 20)
        cursor.execute(
            "INSERT INTO points (student_id, teacher_id, value, subcategory_id, label, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, NOW(), NOW())",
            (student_id, teacher_id, points, subcategory_id, "")
        )

        print(
            f"Teacher {teacher_id} added {points} points to student {student_id} for {subcategory_to_category[subcategory_id]} in edition {edition_id}.")

    # Example of modeling the chest-giving process
    for teacher_id in teacher_ids:
        for _ in range(250):  # Adjust the number of times you want to model this process per teacher
            give_chest_and_apply_award(teacher_id)
            add_points_for_laboratory_or_test(teacher_id)

    # Coordinator gives chests to random students
    for _ in range(250):  # Adjust the number of times you want to model this process for the coordinator
        give_chest_and_apply_award(coordinator_id)
        add_points_for_laboratory_or_test(coordinator_id)

    conn.commit()
    cursor.close()
    conn.close()


if __name__ == '__main__':
    truncate_and_restart_sequences()
    insert_data()
    print("Data inserted successfully.")
