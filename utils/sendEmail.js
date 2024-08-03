const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // create transporter (allow you to use the services to send emails like: "gmail", "mailGun", "mailTrap")
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_Port, // if secure is false the port will be 587, if true the port will be 465
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_Password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  // define the email options like: from, to, subject and body
  const mailOptions = {
    from: "E-Commerce Website",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  // send the email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
