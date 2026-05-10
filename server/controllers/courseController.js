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

const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    if (course.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({
        message: "Not authorized",
      });
    }

    await course.deleteOne();

    res.status(200).json({
      message: "Course deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getCourses,
  deleteCourse,
};