const express = require("express");
const router = express.Router();
const { getAllUsers, getMe, updateProfile, getUserActivity } = require("../controllers/userController");
const protect = require("../middleware/authMiddleware");

// List all users (protected route)
router.get("/", protect(), getAllUsers);

// Get current user profile
router.get("/profile", protect(), getMe);

// Update user profile
router.put("/profile", protect(), updateProfile);

// Get user activity
router.get("/activity", protect(), getUserActivity);

module.exports = router;
