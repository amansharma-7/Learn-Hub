const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },

  lastName: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
  },

  accountType: {
    type: String,
    required: true,
    enum: ["Admin", "Student", "Instructor"],
  },

  additionalDetails: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: "Profile",
  },

  courses: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "Course",
    },
  ],

  image: {
    type: String,
    required: true,
  },
  token: { type: String },
  resetPasswordExpires: { type: Date },
  courseProgress: {
    type: mongoose.Schema.ObjectId,
    ref: "CourseProgress",
  },
});

module.exports = mongoose.model("User", userSchema);
