const Task = require("../models/Task");

const createTask = async (req, res) => {
  try {
    const { title, dueDate, course } = req.body;

    const task = await Task.create({
      title,
      dueDate,
      course,
      user: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user._id,
    }).populate("course", "name code");

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  createTask,
  getTasks,
};