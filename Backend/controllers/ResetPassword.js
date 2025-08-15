const { User } = require("../models");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Generate reset password token and send email
exports.resetPasswordToken = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.json({
        success: false,
        message: "Your email is not registered",
      });
    }

    // Generate token
    const token = crypto.randomUUID();
    const resetPasswordExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update user with token and expiry
    await user.update({ token, resetPasswordExpires });

    // URL for reset password
    const url = `http://localhost:3000/update-password/${token}`;

    // Send email
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link: ${url}  Expires in 5 minutes`
    );

    return res.json({
      success: true,
      message:
        "Email sent successfully. Please check your inbox to reset password",
      token, // optional: remove in production for security
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while resetting password. Please try again",
    });
  }
};

// Reset password using token
exports.resetPassword = async (req, res) => {
  try {
    const { password, confirmPassword, token } = req.body;

    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Find user by token
    const user = await User.findOne({ where: { token } });
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid token",
      });
    }

    // Check token expiry
    if (user.resetPasswordExpires < new Date()) {
      return res.json({
        success: false,
        message: "Token expired. Please generate a new one",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password and clear token
    await user.update({
      password: hashedPassword,
      token: null,
      resetPasswordExpires: null,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while resetting password",
    });
  }
};
