-- Drop the existing trigger if it exists
DO $$
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'after_points_insert') THEN
            DROP TRIGGER after_points_insert ON points;
        END IF;
        IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'after_user_groups_insert') THEN
            DROP TRIGGER after_user_groups_insert ON user_groups;
        END IF;
    END $$;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS update_user_level;

-- Create or replace the function to update the user_level table
CREATE OR REPLACE FUNCTION update_user_level() RETURNS TRIGGER AS $$
DECLARE
    sum_of_points_in_edition INTEGER;
    new_level_id BIGINT;
    new_edition_id BIGINT;
    user_label VARCHAR(256);
    current_user_id BIGINT;
    current_subcategory_id BIGINT;
BEGIN
    -- Determine if the trigger is fired by user_groups or points insertion/update/delete
    IF TG_TABLE_NAME = 'user_groups' THEN
        IF TG_OP = 'DELETE' THEN
            current_user_id := OLD.user_id;
        ELSE
            current_user_id := NEW.user_id;
        END IF;

        -- Assume there's a default level and edition for new user groups
        new_edition_id := (SELECT edition_id FROM groups WHERE groups_id = COALESCE(NEW.group_id, OLD.group_id));

        SELECT COALESCE(SUM(p.value), 0) INTO sum_of_points_in_edition
        FROM points p
                 JOIN subcategories s ON p.subcategory_id = s.subcategory_id
        WHERE p.student_id = current_user_id
          AND s.edition_id = new_edition_id;

        SELECT l.level_id INTO new_level_id
        FROM levels l
        WHERE l.edition_id = new_edition_id
          AND sum_of_points_in_edition >= l.minimum_points
          AND (sum_of_points_in_edition < l.maximum_points OR l.highest);

        -- Get the user's label
        SELECT u.label INTO user_label FROM users u WHERE u.user_id = current_user_id;

    ELSIF TG_TABLE_NAME = 'points' THEN
        IF TG_OP = 'DELETE' THEN
            current_user_id := OLD.student_id;
            current_subcategory_id := OLD.subcategory_id;
        ELSE
            current_user_id := NEW.student_id;
            current_subcategory_id := NEW.subcategory_id;
        END IF;

        -- Get the edition_id from the subcategory
        SELECT s.edition_id INTO new_edition_id
        FROM subcategories s
        WHERE s.subcategory_id = current_subcategory_id
        LIMIT 1;

        -- Calculate the total points for the user in the edition
        SELECT COALESCE(SUM(p.value), 0) INTO sum_of_points_in_edition
        FROM points p
                 JOIN subcategories s ON p.subcategory_id = s.subcategory_id
        WHERE p.student_id = current_user_id
          AND s.edition_id = new_edition_id;

        -- Find the appropriate level for the user
        SELECT l.level_id INTO new_level_id
        FROM levels l
        WHERE l.edition_id = new_edition_id
          AND sum_of_points_in_edition >= l.minimum_points
          AND (sum_of_points_in_edition < l.maximum_points OR l.highest)
        ORDER BY l.minimum_points DESC
        LIMIT 1;

        -- Get the label for the user
        SELECT u.label INTO user_label
        FROM users u
        WHERE u.user_id = current_user_id;
    END IF;

    -- Insert or update the user_level table
    INSERT INTO user_level (user_id, level_id, edition_id, label)
    VALUES (current_user_id, new_level_id, new_edition_id, user_label)
    ON CONFLICT (user_id, edition_id) DO UPDATE
        SET level_id = EXCLUDED.level_id,
            label = EXCLUDED.label;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to execute the function after insert, update, or delete on points
CREATE TRIGGER after_points_insert
    AFTER INSERT OR UPDATE OR DELETE ON points
    FOR EACH ROW
EXECUTE FUNCTION update_user_level();

-- Create the trigger to execute the function after insert or delete on user_groups
CREATE TRIGGER after_user_groups_insert
    AFTER INSERT OR UPDATE OR DELETE ON user_groups
    FOR EACH ROW
EXECUTE FUNCTION update_user_level();
