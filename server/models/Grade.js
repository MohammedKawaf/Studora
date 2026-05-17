const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    grade: {
      type: String,
      required: true,
      enum: ["U", "G", "VG", "MVG", "3", "4", "5"],
    },

    credits: {
      type: Number,
      required: true,
    },

    year: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    term: {
      type: Number,
      required: true,
      min: 1,
      max: 2,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Grade", gradeSchema);