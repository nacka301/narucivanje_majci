// verifySendgrid.js
require('dotenv').config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// sgMail.setDataResidency('eu'); // Ova linija ostaje zakomentirana dok ne bude podržana

const msg = {
to: 'vpsolutions.booking@gmail.com', // Zamijeni s tvojom email adresom
  from: 'vpsolutions.booking@gmail.com', // Zamijeni s verificiranim senderom
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
