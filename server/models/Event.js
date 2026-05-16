const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: ["exam", "assignment", "lecture", "meeting", "study", "other"],
      default: "other",
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", eventSchema);