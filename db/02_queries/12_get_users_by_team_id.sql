SELECT users.id AS user_id 
FROM users
JOIN assignments ON users.id = user_id
JOIN teams ON team_id = teams.id
WHERE teams.id = 1;

