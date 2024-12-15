CREATE TABLE chest_edition (
                                  chest_id INT NOT NULL,
                                  edition_id INT NOT NULL,
                                  label VARCHAR(256) NOT NULL DEFAULT '',
                                  PRIMARY KEY (chest_id, edition_id),
                                  CONSTRAINT fk_categories FOREIGN KEY (chest_id) REFERENCES chests(chest_id),
                                  CONSTRAINT fk_edition FOREIGN KEY (edition_id) REFERENCES edition(edition_id)
);

-- Add unique constraint on user_id and edition_id
ALTER TABLE chest_edition
    ADD CONSTRAINT unique_chest_edition UNIQUE (chest_id, edition_id);

ALTER TABLE chests
    DROP COLUMN edition_id;