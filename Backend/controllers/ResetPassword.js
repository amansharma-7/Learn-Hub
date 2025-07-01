const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");
exports.resetPasswordToken = async (req, res) => {
  try {
    //getting data
    const email = req.body.email;
    //validating data
    console.log("aman");

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "your email is not registered",
      });
    }
    //generate token
    const token = crypto.randomUUID();

    // add token in user and its expiry time
    const updatedUser = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    //url for reset password
    const url = `http://localhost:3000/update-password/${token}`;

    // send mail for reseting
    await mailSender(
      email,
      "Password Reset Link",
      `Password Reset Link:${url}  Expires in 5 min`
    );

    return res.json({
      success: true,
      message: "Email send successfully ,please check email and reset password",
      token,
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Something went wrong while reseting password ,please try again",
    });
  }
};

//seset password
exports.resetPassword = async (req, res) => {
  try {
    //data fetching
    const { password, confirmPassword, token } = req.body;
    //data validation
    if (password !== confirmPassword) {
      return res.json({
        success: false,
        message: "password not matching",
      });
    }

    // get user details by token
    const userDetails = await User.findOne({ token: token });
    //if no entry ,invalid token
    if (!userDetails) {
      return res.json({
        success: false,
        message: "token invalid",
      });
    }

    //   if token expires
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.json({
        success: false,
        message: "token expire ,please re generate it",
      });
    }

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    //update password
    let user = await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );
    // console.log(user);

    return res.status(200).json({
      success: true,
      message: "password reseted successfully",
    });
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "error while reseting password",
    });
  }
};
