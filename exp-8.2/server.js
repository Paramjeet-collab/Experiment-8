const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key"; // Keep this secret in real apps

app.use(bodyParser.json());

// Sample user (hardcoded)
const user = {
    id: 1,
    username: "testuser",
    password: "password123"
};

// Login route - issues a token
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (username === user.username && password === user.password) {
        // Generate JWT token
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ message: "Invalid credentials" });
    }
});

// Middleware to verify token
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader) return res.status(401).json({ message: "Token missing" });

    const token = authHeader.split(' ')[1]; // Bearer <token>

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = decoded; // Attach decoded token to request
        next();
    });
}

// Protected route
app.get('/protected', verifyToken, (req, res) => {
    res.json({
        message: "You have accessed a protected route!",
        user: req.user
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
