require('dotenv').config();
const {
  MAILER_USER,
  MAILER_NOTICE,
} = process.env;

module.exports = function usersMailer(transporter, first_name, last_name, email, password, adminEmail) {

  const mailOptions = {
    from: MAILER_USER,
    to:  adminEmail,
    subject: `Successfully added user ${first_name} ${last_name}`,
    text: `User details: \nName - ${first_name} ${last_name} \nEmail - ${email} \nPassword - ${password}`
  };
  
  transporter.sendMail(mailOptions, function(error, info) {
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