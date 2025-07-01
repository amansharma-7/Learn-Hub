const mongoose = require("mongoose");

const section = new mongoose.Schema({
  sectionName: {
    type: String,
    trim: true,
    required: true,
  },
  subSection: [
    {
      type: mongoose.Schema.ObjectId,
      required: true,
      ref: "SubSection",
    },
  ],
});

module.exports = mongoose.model("Section", section);
