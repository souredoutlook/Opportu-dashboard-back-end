require('dotenv').config();
const {
  MAILER_USER,
  MAILER_NOTICE,
  FRONT_END_PATH,
} = process.env;

module.exports = function assessmentsMailer(transporter, user, core_values_assessment, adminEmail) {

  const {first_name, last_name, email} = user;
  const assessment_id = core_values_assessment.id;
  
  const mailOptions = {
    from: MAILER_USER,
    to:  adminEmail,
    subject: `Root Values Assessment for ${first_name} ${last_name}`,
    text:`Assessment Details: \nName - ${first_name} ${last_name} \nUser Email - ${email} \nAssessment Link - ${FRONT_END_PATH}/assessments/${assessment_id}`
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
      const mailOptions = {
        from: MAILER_USER,
        to: MAILER_NOTICE,
        subject: `Failed to send new user details for ${first_name} ${last_name}`,
        text: `Unable to deliver user details for ${first_name} ${last_name} please try again.`
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

};