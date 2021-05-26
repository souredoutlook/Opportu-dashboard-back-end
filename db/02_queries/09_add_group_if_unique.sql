INSERT INTO groups (name, description)
    SELECT 'Test', 'A very testy organization.'
    WHERE NOT EXISTS (
      SELECT 1 FROM groups WHERE name = 'Test'
    )
    RETURNING *;