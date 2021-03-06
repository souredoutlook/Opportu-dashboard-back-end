DROP TABLE IF EXISTS values_assessments CASCADE;

CREATE TABLE values_assessments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  aggregate_assessment_id INTEGER REFERENCES aggregate_assessments(id) DEFAULT NULL,
  created TIMESTAMP NOT NULL DEFAULT NOW()::TIMESTAMP,
  completed TIMESTAMP --insert on user completion
);