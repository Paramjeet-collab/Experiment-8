const express = require("express");
const { verifyToken, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

// Admin-only route
router.get("/admin/dashboard", verifyToken, authorizeRoles("Admin"), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.username}!` });
});

// Moderator-only route
router.get("/moderator/manage", verifyToken, authorizeRoles("Moderator"), (req, res) => {
  res.json({ message: `Moderator ${req.user.username} can manage content.` });
});

// User route (accessible by any authenticated user)
router.get("/user/profile", verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, this is your profile.` });
});

module.exports = router;
