// testSendgrid.js
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// sgMail.setDataResidency('eu'); // Za EU subuser (nije podržano u ovoj verziji)

const msg = {
  to: 'vackadavid@gmail.com', // Promijeni na svoj email
  from: 'vpsolutions.booking@gmail.com', // Verificirani sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent');
  })
  .catch((error) => {
    console.error(error);
  });
