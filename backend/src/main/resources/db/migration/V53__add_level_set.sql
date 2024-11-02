ALTER TABLE levels
    ADD COLUMN level_set INT;

ALTER TABLE levels
    ALTER COLUMN edition_id DROP NOT NULL;