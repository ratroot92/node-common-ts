const nodemailer = require('nodemailer');

// SMTP_HOST="mail.pec.org.pk"
// SMTP_PORT=25
// SMTP_SECURE=false
// SMTP_AUTH_USER="no-reply@pec.org.pk"
// SMTP_AUTH_PASS= "Noreply@12#$43@!"

const emailUtils = {
  host: process.env.SMTP_HOST || 'mail.pec.org.pk',
  port: process.env.SMTP_PORT || 25,
  secure: process.env.SMTP_SECURE || false,
  auth: {
    user: process.env.SMTP_AUTH_USER || 'no-reply@pec.org.pk',
    pass: process.env.SMTP_AUTH_PASS || 'Noreply@12#$43@!',
  },
  reciever: 'maliksblr92@gmail.com',
  transport: function () {
    return nodemailer.createTransport({
      host: this.host,
      port: this.port,
      secure: this.secure,
      auth: this.auth,
    });
  },

  send: async function (options = {}) {
    const mailTransporter = this.transport();
    let mailData = {
      from: this.host,
      to: this.reciever,
      subject: options.subject || 'Email Subject',
      text: options.text || 'Otp',
      //   attachments: [{ filename: 'epe_rollno_slip.pdf', path: sysPath, contentType: 'application/pdf' }],
      html: options.html || `<p> This email is originated from www.evergreen.com<p><p>Your Otp is <b>${options.otp} </b> </p>`,
    };
    return mailTransporter.sendMail(mailData);
  },
};

modulex.exports = emailUtils;
