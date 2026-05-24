const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", protect, (req, res) => {
  res.status(200).json(req.user);
});

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

module.exports = router;