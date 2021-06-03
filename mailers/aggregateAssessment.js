const {
  MAILER_USER,
  MAILER_NOTICE,
  BACK_END_PATH,
  FRONT_END_PATH
} = process.env;

const divider = '\n\n--- --- ---\n'

module.exports = function aggregateAssessmentMailer (transporter, rows, users, adminEmail) {
  const { team_name, group_name } = users[0];
  
  const userHash = users.reduce((prev, cur) => {
    const {first_name, last_name, email, user_id} = cur;

    prev[user_id] = {first_name, last_name, email};

    return prev;
  },{})

  const { aggregate_assessment_id } = rows[0];

  let text = `View aggregate assessment results at: ${BACK_END_PATH}/assessments/aggregate/${aggregate_assessment_id}`;

  rows.forEach(element => {
    const {first_name, last_name, email} = userHash[element.user_id.toString()]
    text += divider
    text += `\nAssessment Details: \nName - ${first_name} ${last_name} \nUser Email - ${email} \nAssessment Link - ${FRONT_END_PATH}/assessments/${element.id}`
  });

  const mailOptions = {
    from: MAILER_USER,
    to:  adminEmail,
    subject: `Successfully generated aggregate assessment for ${group_name ? group_name : team_name}`,
    text,
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
      const mailOptions = {
        from: MAILER_USER,
        to: MAILER_NOTICE,
        subject: `Failed to send aggregate assessment details for ${team_name}${group_name ? ' - ' + group_name : ''}`,
        text: `Unable to deliver aggregate assessment details for ${team_name}${group_name ? ' - ' + group_name : ''} please try again.`
      };

      transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
          console.log('Failed to send failure notice: ', error);
        } else {
          console.log(console.log('Email sent: ' + info.response));
        }
      });

    } else {
      console.log('Email sent: ' + info.response);
    }
  });

}