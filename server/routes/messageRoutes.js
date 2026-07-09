const express = require("express");

const router = express.Router();

const {
  sendMessage,
  getConversation,
  getUnreadMessages,
  markMessagesAsRead,
} = require("../controllers/messageController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, sendMessage);

router.get("/unread", protect, getUnreadMessages);

router.put("/read/:friendId", protect, markMessagesAsRead);

router.get("/:friendId", protect, getConversation);

module.exports = router;