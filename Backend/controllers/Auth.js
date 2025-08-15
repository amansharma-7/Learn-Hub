const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
require("dotenv").config();

const { User, OTP, Profile, mailSender } = require("../models"); // Adjust if mailSender is exported separately
const { passwordUpdated } = require("../mail/templates/passwordUpdate");

// Send OTP
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const isExistingUser = await User.findOne({ where: { email } });

    if (isExistingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exists" });
    }

    // Generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Ensure OTP is unique
    let existingOtp = await OTP.findOne({ where: { otp } });
    while (existingOtp) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      existingOtp = await OTP.findOne({ where: { otp } });
    }

    // Create OTP entry
    await OTP.create({ email, otp });

    res
      .status(200)
      .json({ success: true, message: "OTP Sent Successfully", otp });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "OTP sending failed" });
  }
};

// Signup
exports.signup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res
        .status(403)
        .json({ success: false, message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res
        .status(403)
        .json({ success: false, message: "Passwords do not match" });
    }

    const isExistingUser = await User.findOne({ where: { email } });
    if (isExistingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exists" });
    }

    // Find the most recent OTP
    const recentOtp = await OTP.findOne({
      where: { email },
      order: [["createdAt", "DESC"]],
    });

    if (!recentOtp || recentOtp.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Profile
    const profile = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    // Create User
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profile._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
    });

    res.status(200).json({
      success: true,
      message: "User Registered Successfully",
      data: user,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "User registration failed" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all details" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(403)
        .json({ success: false, message: "Password does not match" });
    }

    const payload = {
      email: user.email,
      _id: user._id,
      accountType: user.accountType,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    });
    res.status(200).json({
      success: true,
      token,
      user,
      message: "User logged in successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required details",
      });
    }

    const user = await User.findByPk(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res
        .status(403)
        .json({ success: false, message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    // Send email notification
    try {
      await mailSender(
        user.email,
        "Password for your account has been updated",
        passwordUpdated(user.email, `${user.firstName} ${user.lastName}`)
      );
    } catch (err) {
      console.error("Error sending password update email:", err);
    }

    res
      .status(200)
      .json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong, please try again later",
    });
  }
};
