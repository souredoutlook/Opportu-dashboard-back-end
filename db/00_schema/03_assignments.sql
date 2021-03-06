DROP TABLE IF EXISTS assignments CASCADE;

CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  is_leader BOOLEAN NOT NULL DEFAULT FALSE
);