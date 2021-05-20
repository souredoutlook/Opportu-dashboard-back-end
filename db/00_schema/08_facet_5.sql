DROP TABLE IF EXISTS facet_5_assessments CASCADE;

CREATE TABLE facet_5_assessments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  will NUMERIC,
  energy NUMERIC,
  control NUMERIC,
  emotionality NUMERIC,
  affection NUMERIC,
  completed TIMESTAMP --insert on user completion
);