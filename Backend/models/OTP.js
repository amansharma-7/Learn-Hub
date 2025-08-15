const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTP = sequelize.define(
  "OTP",
  {
    _id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    email: { type: DataTypes.STRING, allowNull: false },
    otp: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "otps", timestamps: false }
);

OTP.beforeCreate(async (otpInstance) => {
  const emailBody = "Verification Code for Learn Hub login";
  await mailSender(
    otpInstance.email,
    emailBody,
    emailTemplate(otpInstance.otp)
  );
});

module.exports = OTP;
