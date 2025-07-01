const nodemailer = require("nodemailer");
require("dotenv").config();
const mailSender = async (email, title, body) => {
  let info;
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    //send mail

    info = await transporter.sendMail({
      from: '"Aman Sharma" <amansharma83242@gmail.com>',
      to: email, // Recipient's email
      subject: title, // Email subject
      html: body, // Email body (HTML format)
    });
  } catch (error) {
    console.log(error);
  }

  return info;
};

module.exports = mailSender;

// const sgMail = require("@sendgrid/mail");
// require("dotenv").config();

// sgMail.setApiKey(process.env.SG_KEY);

// async function mailSender(email, title, body) {
//   const senderName = process.env.SG_SENDER_NAME;
//   const senderEmail = process.env.SG_SENDER_EMAIL;

//   const msg = {
//     to: email,
//     from: {
//       name: senderName,
//       email: senderEmail,
//     },

//     subject: title,
//     html: body,
//   };

//   // Send the email
//   let info = await sgMail.send(msg);
//   console.log(info);
//   return info;
// }
// module.exports = mailSender;
