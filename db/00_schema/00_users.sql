DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id serial PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255)  NOT NULL,
  email varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  is_admin boolean NOT NULL DEFAULT FALSE
);