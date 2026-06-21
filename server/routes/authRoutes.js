const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  updateProfile,
  changePassword,
  deleteAccount,
  uploadProfileImage,
  removeProfileImage,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post("/register", registerUser);

router.post("/login", loginUser);

router.get("/profile", protect, async (req, res) => {
  req.user.lastActive = new Date();

  await req.user.save();

  res.status(200).json(req.user);
});

router.put("/profile", protect, updateProfile);

router.put("/change-password", protect, changePassword);

router.delete("/delete-account", protect, deleteAccount);

router.post(
  "/upload-profile-image",
  protect,
  upload.single("profileImage"),
  uploadProfileImage
);

router.delete(
  "/remove-profile-image",
  protect,
  removeProfileImage
);

module.exports = router;