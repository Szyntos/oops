-- Drop the existing function and trigger if they exist
DROP FUNCTION IF EXISTS update_user_levels_after_grading_check;
DROP TRIGGER IF EXISTS after_grading_checks_insert_update_delete ON grading_checks;

-- Create or replace the function to update user_level after grading_checks insert, update, or delete
CREATE OR REPLACE FUNCTION update_user_levels_after_grading_check() RETURNS TRIGGER AS $$
DECLARE
    v_user_level RECORD;
    v_level_ordinal INT;
    v_level_grade DOUBLE PRECISION;
    v_levels_threshold_ordinal INT;
    v_end_of_labs_levels_reached BOOLEAN;
    v_project_points_threshold_reached BOOLEAN;
    v_computed_grade DOUBLE PRECISION;
    v_sum_of_project_points DOUBLE PRECISION;
    v_grading_check RECORD;
    v_edition_id BIGINT;
    v_sum_of_points_in_edition NUMERIC(10, 2);
    v_level_ordinal_before_threshold INT;
BEGIN
    -- Determine the operation and set the edition_id accordingly
    IF TG_OP = 'DELETE' THEN
        v_edition_id := OLD.edition_id;
        -- Since the grading_check is removed, set default values
        -- For all user_level records of the edition, set fields as specified
        FOR v_user_level IN
            SELECT * FROM user_level ul WHERE ul.edition_id = v_edition_id
            LOOP
                -- Get user's level grade
                SELECT lvl.grade INTO v_level_grade
                FROM levels lvl
                WHERE lvl.level_id = v_user_level.level_id;

                -- Update user_level fields
                UPDATE user_level SET
                                      end_of_labs_levels_reached = TRUE,
                                      project_points_threshold_reached = TRUE,
                                      computed_grade = v_level_grade
                WHERE user_id = v_user_level.user_id AND edition_id = v_user_level.edition_id;
            END LOOP;

        RETURN OLD;

    ELSE
        v_edition_id := NEW.edition_id;

        -- Fetch the updated grading_check record
        SELECT * INTO v_grading_check FROM grading_checks gc WHERE gc.edition_id = v_edition_id;

        -- Loop over each user_level record associated with the edition
        FOR v_user_level IN
            SELECT * FROM user_level ul WHERE ul.edition_id = v_edition_id
            LOOP
                -- Get user's level ordinal_number and grade
                SELECT lvl.ordinal_number, lvl.grade
                INTO v_level_ordinal, v_level_grade
                FROM levels lvl
                WHERE lvl.level_id = v_user_level.level_id;

                -- Get the ordinal_number of the end_of_labs_levels_threshold
                SELECT lvl.ordinal_number INTO v_levels_threshold_ordinal
                FROM levels lvl
                WHERE lvl.level_id = v_grading_check.end_of_labs_levels_threshold;

                -- Check if the current time is before end_of_labs_date
                -- Calculate the sum of points before end_of_labs_date
                SELECT COALESCE(SUM(p.value), 0) INTO v_sum_of_points_in_edition
                FROM points p
                         JOIN subcategories s ON p.subcategory_id = s.subcategory_id
                WHERE p.student_id = v_user_level.user_id
                  AND s.edition_id = v_edition_id
                  AND p.created_at < v_grading_check.end_of_labs_date;

                SELECT l.ordinal_number INTO v_level_ordinal_before_threshold
                FROM levels l
                         JOIN edition e ON l.level_set_id = e.level_set_id
                WHERE e.edition_id = v_edition_id
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
                WHERE user_id = v_user_level.user_id AND edition_id = v_user_level.edition_id;


                -- Compute sum_of_project_points for the user
                SELECT COALESCE(SUM(p.value), 0) INTO v_sum_of_project_points
                FROM points p
                         JOIN subcategories sub ON p.subcategory_id = sub.subcategory_id
                WHERE p.student_id = v_user_level.user_id
                  AND sub.edition_id = v_user_level.edition_id
                  AND sub.category_id = v_grading_check.project_id;

                -- Determine if the project_points_threshold is reached
                IF v_sum_of_project_points >= v_grading_check.project_points_threshold THEN
                    v_project_points_threshold_reached := TRUE;
                ELSE
                    v_project_points_threshold_reached := FALSE;
                END IF;

                -- Update project_points_threshold_reached in user_level
                UPDATE user_level SET
                    project_points_threshold_reached = v_project_points_threshold_reached
                WHERE user_id = v_user_level.user_id AND edition_id = v_user_level.edition_id;

                -- Compute the computed_grade based on the updated fields
                IF COALESCE(v_end_of_labs_levels_reached, v_user_level.end_of_labs_levels_reached) AND v_project_points_threshold_reached THEN
                    v_computed_grade := v_level_grade;
                ELSE
                    v_computed_grade := 2.0;
                END IF;

                -- Update computed_grade in user_level
                UPDATE user_level SET
                    computed_grade = v_computed_grade
                WHERE user_id = v_user_level.user_id AND edition_id = v_user_level.edition_id;
            END LOOP;

        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to execute the function after insert, update, or delete on grading_checks
CREATE TRIGGER after_grading_checks_insert_update_delete
    AFTER INSERT OR UPDATE OR DELETE ON grading_checks
    FOR EACH ROW
EXECUTE FUNCTION update_user_levels_after_grading_check();
