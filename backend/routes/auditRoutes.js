const express = require("express");
const router = express.Router();
const { getAuditLogs } = require("../controllers/auditController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.use(authenticateToken);
router.get("/", getAuditLogs);

module.exports = router;
