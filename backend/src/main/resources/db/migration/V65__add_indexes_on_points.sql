CREATE INDEX idx_points_student_id ON points(student_id);
CREATE INDEX idx_points_subcategory_id ON points(subcategory_id);
CREATE INDEX idx_subcategories_edition_id ON subcategories(edition_id);
CREATE INDEX idx_points_student_subcategory ON points(student_id, subcategory_id);
