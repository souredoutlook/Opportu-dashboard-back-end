INSERT INTO facet_5_assessments (user_id)
SELECT 1
WHERE NOT EXISTS (
  SELECT 1 FROM facet_5_assessments WHERE user_id = 1
)
RETURNING *;