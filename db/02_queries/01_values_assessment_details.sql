--details of each values_assessment
SELECT completed, user_id, assessment_id, core_value, name as custom_value, rank
FROM values_assessments
JOIN ranked_values ON values_assessments.id = assessment_id
FULL OUTER JOIN custom_values ON custom_value_id = custom_values.id
WHERE user_id = 2
ORDER BY completed DESC, assessment_id, rank;