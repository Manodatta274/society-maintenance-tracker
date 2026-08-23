const express = require("express");
const { register, login } = require("../controllers/authController");
const {
    authenticateToken,
    authorizeRole
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

const db = require("../config/db");

// Test route - any logged-in user
router.get("/profile", authenticateToken, (req, res) => {
    db.query("SELECT id, name, email, role FROM users WHERE id = ?", [req.user.id], (err, results) => {
        if (err || results.length === 0) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.json({
            success: true,
            message: "You are authenticated!",
            user: results[0]
        });
    });
});

// Test route - ADMIN only
router.get(
    "/admin-test",
    authenticateToken,
    authorizeRole("ADMIN"),
    (req, res) => {
        res.json({
            success: true,
            message: "Admin access granted!"
        });
    }
);

module.exports = router;