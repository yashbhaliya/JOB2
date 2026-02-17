const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp.gmail.com',
  port: process.env.MAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

transporter.sendMail = (mailOptions) => {
  return transporter.sendMail({
    ...mailOptions,
    from: process.env.MAIL_USER
  });
};

module.exports = transporter;
