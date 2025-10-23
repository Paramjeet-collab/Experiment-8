const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("../users");

const router = express.Router();
const SECRET_KEY = "mySecretKey";

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

module.exports = router;
