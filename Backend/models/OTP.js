const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

// function for send mail

async function sendVerifcationEmail(email, otp) {
  try {
    const emailBody = "Verification Code for Learn Hub login";
    const mailResponse = await mailSender(email, emailBody, emailTemplate(otp));
  } catch (error) {
    console.log("error occured while send email", error);
    throw error;
  }
}

OTPSchema.pre("save", async function (next) {
  await sendVerifcationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
