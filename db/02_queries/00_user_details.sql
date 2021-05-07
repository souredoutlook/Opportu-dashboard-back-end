--details of all users
SELECT first_name, last_name, teams.name as team_name, groups.name as group_name
FROM users
JOIN assignments on users.id = user_id
JOIN teams on team_id = teams.id
JOIN groups on group_id = groups.id;