CREATE TABLE level_sets(
    level_set_id serial primary key,
    level_set_name varchar(255) not null
);

ALTER TABLE levels
    DROP COLUMN edition_id;

ALTER TABLE levels
    DROP COLUMN level_set;

ALTER TABLE levels
    ADD COLUMN level_set_id BIGINT;

ALTER TABLE levels
    ADD CONSTRAINT fk_levels_level_sets
        FOREIGN KEY (level_set_id) REFERENCES level_sets(level_set_id);

ALTER TABLE edition
    ADD COLUMN level_set_id BIGINT,
    ADD CONSTRAINT fk_edition_level_sets
        FOREIGN KEY (level_set_id) REFERENCES level_sets(level_set_id);
