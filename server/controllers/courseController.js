const Course = require("../models/Course");

const createCourse = async (req, res) => {
  try {
    const { name, code, color } = req.body;

    const course = await Course.create({
      name,
      code,
      color,
      user: req.user._id,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      user: req.user._id,
    });

    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
};