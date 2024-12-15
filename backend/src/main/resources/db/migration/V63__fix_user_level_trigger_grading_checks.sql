ALTER TABLE user_level
    ADD COLUMN coordinator_override BOOLEAN NOT NULL DEFAULT FALSE;

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
    sum_of_points_in_edition NUMERIC(10, 2);
    new_level_id BIGINT;
    new_edition_id BIGINT;
    user_label VARCHAR(256);
    current_user_id BIGINT;
    current_subcategory_id BIGINT;

    is_coordinator_override BOOLEAN;

    v_level_ordinal INT;
    v_level_grade DOUBLE PRECISION;
    v_levels_threshold_ordinal INT;
    v_grading_check RECORD;
    v_end_of_labs_levels_reached BOOLEAN;
    v_project_points_threshold_reached BOOLEAN;
    v_computed_grade DOUBLE PRECISION;
    v_sum_of_project_points DOUBLE PRECISION;
    v_user_level RECORD;
    v_sum_of_points_in_edition NUMERIC(10, 2);
    v_level_ordinal_before_threshold INT;
BEGIN
    -- Determine if the trigger is fired by user_groups or points insertion/update/delete
    IF TG_TABLE_NAME = 'user_groups' THEN
        IF TG_OP = 'DELETE' THEN
            current_user_id := OLD.user_id;
            new_edition_id := (SELECT edition_id FROM groups WHERE groups_id = OLD.group_id);

            -- Check if there are any other user_groups in the same edition for the user
            IF NOT EXISTS (
                SELECT 1
                    FROM user_groups ug
                    JOIN groups g ON ug.group_id = g.groups_id
                    WHERE ug.user_id = current_user_id
                    AND g.edition_id = new_edition_id
                    AND ug.group_id != OLD.group_id
            ) THEN

                -- No other user_groups in this edition, delete from user_level
                DELETE FROM user_level
                    WHERE user_id = current_user_id
                    AND edition_id = new_edition_id;

                RETURN OLD;
            END IF;
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
        JOIN edition e ON l.level_set_id = e.level_set_id
        WHERE e.edition_id = new_edition_id
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
        JOIN edition e ON l.level_set_id = e.level_set_id
        WHERE e.edition_id = new_edition_id
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

    -- Now, update end_of_labs_levels_reached, project_points_threshold_reached, computed_grade
    -- Fetch the updated user_level record
    SELECT * INTO v_user_level
    FROM user_level ul
    WHERE ul.user_id = current_user_id AND ul.edition_id = new_edition_id;

    SELECT ul.coordinator_override INTO is_coordinator_override
    FROM user_level ul
    WHERE ul.user_id = current_user_id;

    -- Get user's level ordinal_number and grade
    SELECT lvl.ordinal_number, lvl.grade
    INTO v_level_ordinal, v_level_grade
    FROM levels lvl
    WHERE lvl.level_id = v_user_level.level_id;

    -- Get the grading_checks for the edition
    SELECT * INTO v_grading_check
    FROM grading_checks gc
    WHERE gc.edition_id = new_edition_id;

    IF NOT FOUND THEN
        UPDATE user_level SET
            computed_grade = v_level_grade
        WHERE user_id = current_user_id AND edition_id = new_edition_id;

        RETURN NEW;
    END IF;

    -- Calculate the sum of points before end_of_labs_date
    SELECT COALESCE(SUM(p.value), 0) INTO v_sum_of_points_in_edition
    FROM points p
             JOIN subcategories s ON p.subcategory_id = s.subcategory_id
    WHERE p.student_id = v_user_level.user_id
      AND s.edition_id = new_edition_id
      AND p.created_at < v_grading_check.end_of_labs_date;

    SELECT l.ordinal_number INTO v_level_ordinal_before_threshold
    FROM levels l
             JOIN edition e ON l.level_set_id = e.level_set_id
    WHERE e.edition_id = new_edition_id
      AND v_sum_of_points_in_edition >= l.minimum_points
      AND (v_sum_of_points_in_edition < l.maximum_points OR l.highest)
    ORDER BY l.minimum_points DESC
    LIMIT 1;

    -- Get the ordinal_number of the end_of_labs_levels_threshold
    SELECT lvl.ordinal_number INTO v_levels_threshold_ordinal
    FROM levels lvl
    WHERE lvl.level_id = v_grading_check.end_of_labs_levels_threshold;

    IF v_level_ordinal_before_threshold >= v_levels_threshold_ordinal THEN
        v_end_of_labs_levels_reached := TRUE;
    ELSE
        v_end_of_labs_levels_reached := FALSE;
    END IF;

    -- Update end_of_labs_levels_reached in user_level
    UPDATE user_level SET
        end_of_labs_levels_reached = v_end_of_labs_levels_reached
    WHERE user_id = current_user_id AND edition_id = new_edition_id;


    -- Compute sum_of_project_points
    SELECT COALESCE(SUM(p.value), 0) INTO v_sum_of_project_points
    FROM points p
             JOIN subcategories sub ON p.subcategory_id = sub.subcategory_id
    WHERE p.student_id = current_user_id
      AND sub.edition_id = new_edition_id
      AND sub.category_id = v_grading_check.project_id;

    IF v_sum_of_project_points >= v_grading_check.project_points_threshold THEN
        v_project_points_threshold_reached := TRUE;
    ELSE
        v_project_points_threshold_reached := FALSE;
    END IF;

    -- Update project_points_threshold_reached in user_level
    UPDATE user_level SET
        project_points_threshold_reached = v_project_points_threshold_reached
    WHERE user_id = current_user_id AND edition_id = new_edition_id;

    -- Compute computed_grade
    IF COALESCE(v_end_of_labs_levels_reached, v_user_level.end_of_labs_levels_reached) AND v_project_points_threshold_reached THEN
        v_computed_grade := v_level_grade;
    ELSE
        v_computed_grade := 2.0;
    END IF;

    -- Update computed_grade in user_level
    IF NOT is_coordinator_override THEN
        UPDATE user_level SET
            computed_grade = v_computed_grade
        WHERE user_id = current_user_id AND edition_id = new_edition_id;
    END IF;


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
