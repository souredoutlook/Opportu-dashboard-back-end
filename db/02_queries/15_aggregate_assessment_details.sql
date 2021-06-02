SELECT core_value, custom_values.name AS custom_value
FROM aggregate_assessments
LEFT JOIN values_assessments ON values_assessments.aggregate_assessment_id = aggregate_assessments.id
LEFT JOIN ranked_values ON values_assessments.id = assessment_id
LEFT JOIN custom_values ON custom_value_id = custom_values.id
WHERE values_assessments.completed IS NOT NULL AND aggregate_assessment_id = 1;