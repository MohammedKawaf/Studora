const Grade = require("../models/Grade");

const createGrade = async (req, res) => {
  try {
    const { title, grade, credits, year, term, course } = req.body;

    const newGrade = await Grade.create({
      title,
      grade,
      credits,
      year,
      term,
      course,
      user: req.user._id,
    });

    res.status(201).json(newGrade);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getGrades = async (req, res) => {
  try {
    const grades = await Grade.find({
      user: req.user._id,
    }).populate("course", "name code color");

    res.status(200).json(grades);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateGrade = async (req, res) => {
  try {
    const { title, grade, credits, year, term, course } = req.body;

    const existingGrade = await Grade.findById(req.params.id);

    if (!existingGrade) {
      return res.status(404).json({
        message: "Grade not found",
      });
    }

    existingGrade.title = title;
    existingGrade.grade = grade;
    existingGrade.credits = credits;
    existingGrade.year = year;
    existingGrade.term = term;
    existingGrade.course = course;

    const updatedGrade = await existingGrade.save();

    res.status(200).json(updatedGrade);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const deleteGrade = async (req, res) => {
  try {
    const grade = await Grade.findById(req.params.id);

    if (!grade) {
      return res.status(404).json({
        message: "Grade not found",
      });
    }

    await grade.deleteOne();

    res.status(200).json({
      message: "Grade deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createGrade,
  getGrades,
  updateGrade,
  deleteGrade,
};