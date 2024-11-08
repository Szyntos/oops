-- Create the user_level table
CREATE TABLE user_level (
                            user_id BIGINT NOT NULL,
                            level_id BIGINT NOT NULL,
                            edition_id BIGINT NOT NULL,
                            label VARCHAR(256) NOT NULL DEFAULT '',
                            PRIMARY KEY (user_id, edition_id),
                            CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id),
                            CONSTRAINT fk_level FOREIGN KEY (level_id) REFERENCES levels(level_id),
                            CONSTRAINT fk_edition FOREIGN KEY (edition_id) REFERENCES edition(edition_id)
);

-- Add unique constraint on user_id and edition_id
ALTER TABLE user_level
    ADD CONSTRAINT unique_user_edition UNIQUE (user_id, edition_id);

-- Create or replace the function to update the user_level table
CREATE OR REPLACE FUNCTION update_user_level() RETURNS TRIGGER AS $$
DECLARE
    sum_of_points_in_edition INTEGER;
    new_level_id BIGINT;
    new_edition_id BIGINT;
    user_label VARCHAR(256);
BEGIN
    -- Get the edition_id from the subcategory
    SELECT s.edition_id INTO new_edition_id
    FROM subcategories s
    WHERE s.subcategory_id = NEW.subcategory_id
    LIMIT 1;

    -- Calculate the total points for the user in the edition
    SELECT COALESCE(SUM(p.value), 0) INTO sum_of_points_in_edition
    FROM points p
             JOIN subcategories s ON p.subcategory_id = s.subcategory_id
    WHERE p.student_id = NEW.student_id
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
    WHERE u.user_id = NEW.student_id;

    -- Insert or update the user_level table
    INSERT INTO user_level (user_id, level_id, edition_id, label)
    VALUES (NEW.student_id, new_level_id, new_edition_id, user_label)
    ON CONFLICT (user_id, edition_id) DO UPDATE
        SET level_id = EXCLUDED.level_id,
            label = EXCLUDED.label;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger to execute the function after insert or update on points
CREATE TRIGGER after_points_insert
    AFTER INSERT OR UPDATE ON points
    FOR EACH ROW
EXECUTE FUNCTION update_user_level();
