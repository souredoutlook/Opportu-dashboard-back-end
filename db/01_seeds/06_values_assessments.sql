INSERT INTO values_assessments (user_id, completed)
VALUES (1, NOW()::TIMESTAMP + INTERVAL '12 minutes');

INSERT INTO values_assessments (user_id)
VALUES (1);