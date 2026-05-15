const express = require("express");

const router = express.Router();

const {
  createTask,
  getTasks,
  toggleTaskCompleted,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createTask);

router.get("/", protect, getTasks);

router.put("/:id", protect, toggleTaskCompleted);

router.put("/edit/:id", protect, updateTask);

router.delete("/:id", protect, deleteTask);

module.exports = router;