from .insert_files_demo import insert_files
from .insert_categories_demo import insert_categories
from .insert_category_editions_demo import insert_category_editions
from .insert_editions_demo import insert_editions
from .insert_chests_demo import insert_chests
from .insert_awards_demo import insert_awards
from .insert_award_editions_demo import insert_award_editions
from .insert_grading_checks_demo import insert_grading_checks
from .insert_groups_demo import insert_groups
from .insert_users_demo import insert_students, insert_teachers, insert_coordinator, assign_photos_to_users
from .insert_user_groups_demo import insert_user_groups
from .insert_levels_demo import insert_levels
from .insert_subcategories_demo import insert_subcategories
from .insert_chests_with_awards_demo import insert_chests_with_awards
from .insert_chest_awards_demo import insert_chest_awards
from .insert_points_demo import insert_points

def insert_data_for_demo(data_insertion_config, base_url, hasura_url, headers, conn, fake, random, admin_mail, cursor):
    number_of_editions = data_insertion_config['number_of_editions']
    number_of_teachers = data_insertion_config['number_of_teachers']
    number_of_groups_per_year_bounds = data_insertion_config['number_of_groups_per_year_bounds']
    students_per_group_bounds = data_insertion_config['students_per_group_bounds']
    subcategories_percentage = data_insertion_config['subcategories_percentage']
    chest_percentage = data_insertion_config['chest_percentage']
    open_chest_percentage = data_insertion_config['open_chest_percentage']
    levels_data_struct = data_insertion_config['levels_data']
    levels_data = [
        (
            level['name'],
            level['filename'],
            level['grade']
        )
        for level in levels_data_struct
    ]
    chests_data_struct = data_insertion_config['chests_data']
    chests_data = [
        (
            chest['name'],
            chest['filename'],
            chest['content_type'],
            chest.get('awardBundleCount', 1),
            chest.get('content', [])
        )
        for chest in chests_data_struct
    ]
    category_data_struct = data_insertion_config['category_data']
    category_data = [
        (
            category['name'],
            category['number_of_subcategories'],
            category['subcategory_prefix'],
            category['max_points_per_subcategory'],
            category["can_add_points"],
            category["light_color"],
            category["dark_color"],
            category["editions"]
        )
        for category in category_data_struct
    ]
    category_names_to_populate = data_insertion_config['category_names_to_populate']
    awards_data_struct = data_insertion_config['awards_data']
    awards_data = [
        (
            award['name'],
            award['filename'],
            award['award_type'],
            award['award_value'],
            award['category_id'],
            award['max_usages'],
            award['description'],
            award['label'],
            award['editions']
        )
        for award in awards_data_struct
    ]

    max_points_in_level = data_insertion_config['max_points_in_level']

    if max_points_in_level['is_computed']:
        max_points = sum([category[1] * category[3] for category in category_data if category[3]])
    else:
        max_points = max_points_in_level['if_not_computed']

    insert_files(base_url + "/files/upload")
    coordinator_id_and_role = insert_coordinator(hasura_url, headers, fake, admin_mail)
    editions = insert_editions(hasura_url, headers, number_of_editions)
    categories, category_editions_type_map = insert_categories(hasura_url, headers, category_data, editions)
    insert_category_editions(hasura_url, headers, editions, category_editions_type_map, random)
    inserted_levels = insert_levels(hasura_url, headers, editions, random, max_points, levels_data)
    insert_grading_checks(hasura_url, headers, editions, inserted_levels)
    award_ids, award_editions_type_map = insert_awards(hasura_url, headers, awards_data)
    award_id_to_edition_ids = insert_award_editions(hasura_url, headers, editions, award_editions_type_map, random)
    # chest_ids = insert_chests(hasura_url, headers, editions, chests_data)
    # insert_chest_awards(hasura_url, headers, chest_ids, chests_data, awards_data)
    insert_chests_with_awards(hasura_url, headers, chests_data, awards_data, editions, random)
    teachers_ids_and_roles = insert_teachers(hasura_url, headers, fake, random, number_of_teachers)
    teachers_ids_and_roles.append(coordinator_id_and_role)
    year_group_counts, groups = insert_groups(hasura_url, headers, editions, random, number_of_groups_per_year_bounds, teachers_ids_and_roles)
    students_ids, students_in_group_count = insert_students(hasura_url, headers, year_group_counts, fake, random, students_per_group_bounds)
    all_user_ids = students_ids + [user_id for user_id, role in teachers_ids_and_roles]
    assign_photos_to_users(hasura_url, headers, all_user_ids, random)
    insert_user_groups(hasura_url, headers, students_ids, teachers_ids_and_roles, groups, students_in_group_count,
                                                     random)

    # subcategories, subcategory_to_category = insert_subcategories(hasura_url, headers, editions, categories,
    #                                                               category_data, random)
    #
    insert_points(hasura_url, headers, cursor, editions, [user_id for user_id, role in teachers_ids_and_roles], random,
                  category_names_to_populate,
                  subcategories_percentage,
                  chest_percentage, open_chest_percentage)

    conn.commit()
    cursor.close()
    conn.close()