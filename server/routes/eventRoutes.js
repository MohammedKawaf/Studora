const express = require("express");

const router = express.Router();

const {
  createEvent,
  getEvents,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createEvent);

router.get("/", protect, getEvents);

module.exports = router;const express = require("express");

const router = express.Router();

const {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createEvent);

router.get("/", protect, getEvents);

router.put("/:id", protect, updateEvent);

router.delete("/:id", protect, deleteEvent);

module.exports = router;