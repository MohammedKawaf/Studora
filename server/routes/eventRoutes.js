const express = require("express");

const router = express.Router();

const {
  createEvent,
  getEvents,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createEvent);

router.get("/", protect, getEvents);

module.exports = router;