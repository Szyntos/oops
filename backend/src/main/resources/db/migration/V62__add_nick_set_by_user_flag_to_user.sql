ALTER TABLE users
    ADD COLUMN nick_set_by_user BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
    ADD COLUMN avatar_set_by_user BOOLEAN NOT NULL DEFAULT FALSE;

