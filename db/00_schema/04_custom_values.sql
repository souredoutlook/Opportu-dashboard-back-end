DROP TABLE IF EXISTS custom_values CASCADE;

CREATE TABLE custom_values (
  id SERIAL PRIMARY KEY,
  name varchar(30) NOT NULL
);