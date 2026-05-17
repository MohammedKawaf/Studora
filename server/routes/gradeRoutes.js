const express = require("express");

const router = express.Router();

const {
  createGrade,
  getGrades,
  updateGrade,
  deleteGrade,
} = require("../controllers/gradeController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createGrade);

router.get("/", protect, getGrades);

router.put("/:id", protect, updateGrade);

router.delete("/:id", protect, deleteGrade);

module.exports = router;