const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    school: {
      type: String,
      default: "",
      trim: true,
    },

    program: {
      type: String,
      default: "",
      trim: true,
    },

    studyYear: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },

    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);