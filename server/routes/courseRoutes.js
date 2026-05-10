const express = require("express");

const router = express.Router();

const { createCourse } = require("../controllers/courseController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createCourse);

module.exports = router;