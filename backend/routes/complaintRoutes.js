const express = require("express");
const { 
    createComplaint, 
    getComplaints, 
    getComplaintById, 
    updateComplaintStatus, 
    updateComplaintPriority 
} = require("../controllers/complaintController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/", authenticateToken, authorizeRole("RESIDENT"), upload.single("photo"), createComplaint);
router.get("/", authenticateToken, getComplaints);
router.get("/:id", authenticateToken, getComplaintById);
router.put("/:id/status", authenticateToken, authorizeRole("ADMIN"), updateComplaintStatus);
router.put("/:id/priority", authenticateToken, authorizeRole("ADMIN"), updateComplaintPriority);

module.exports = router;
