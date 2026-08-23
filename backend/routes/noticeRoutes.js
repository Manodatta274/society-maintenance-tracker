const express = require("express");
const { 
    getNotices, 
    createNotice, 
    updateNotice, 
    deleteNotice 
} = require("../controllers/noticeController");
const { authenticateToken, authorizeRole } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, getNotices);
router.post("/", authenticateToken, authorizeRole("ADMIN"), createNotice);
router.put("/:id", authenticateToken, authorizeRole("ADMIN"), updateNotice);
router.delete("/:id", authenticateToken, authorizeRole("ADMIN"), deleteNotice);

module.exports = router;
