DROP TABLE IF EXISTS ranked_values CASCADE;

CREATE TABLE ranked_values (
  id SERIAL PRIMARY KEY,
  assessment_id INTEGER REFERENCES values_assessments(id) ON DELETE CASCADE,
  core_value VARCHAR(30) REFERENCES core_values(name) ON DELETE CASCADE,
  custom_value_id INTEGER REFERENCES custom_values(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL
);