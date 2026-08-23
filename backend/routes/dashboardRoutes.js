const express = require("express");
const { getAdminDashboard, getResidentDashboard } = require("../controllers/dashboardController");
const {
    authenticateToken,
    authorizeRole
} = require("../middleware/authMiddleware");

const router = express.Router();

// Route for admin dashboard
router.get("/admin", authenticateToken, authorizeRole("ADMIN"), getAdminDashboard);

// Route for resident dashboard
router.get("/resident", authenticateToken, authorizeRole("RESIDENT"), getResidentDashboard);

module.exports = router;
