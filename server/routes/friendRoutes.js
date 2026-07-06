const express = require("express");

const router = express.Router();

const {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
} = require("../controllers/friendController");

const { protect } = require("../middleware/authMiddleware");

router.post("/request", protect, sendFriendRequest);

router.get("/requests", protect, getFriendRequests);

router.post("/accept/:id", protect, acceptFriendRequest);

router.post("/decline/:id", protect, declineFriendRequest);

router.get("/", protect, getFriends);

module.exports = router;