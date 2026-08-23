const db = require("../config/db");

const getNotices = (req, res) => {
    try {
        db.query("SELECT * FROM notices ORDER BY created_at DESC", (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            res.json({ success: true, data: results });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const createNotice = (req, res) => {
    try {
        const { title, content, is_important } = req.body;
        
        if (req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: "Unauthorized" });

        const { logAudit } = require("./auditController");
        const { notifyResidents } = require("./notificationController");

        const query = "INSERT INTO notices (admin_id, title, content, is_important) VALUES (?, ?, ?, ?)";
        db.query(query, [req.user.id, title, content, is_important ? 1 : 0], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            
            logAudit(req.user.id, "NOTICE_CREATED", "NOTICE", result.insertId, `Created notice: ${title}`);
            if (is_important) {
                notifyResidents("Important Notice", title, "IMPORTANT_NOTICE");
            }
            
            res.status(201).json({ success: true, message: "Notice created successfully" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateNotice = (req, res) => {
    try {
        const noticeId = req.params.id;
        const { title, content, is_important } = req.body;
        
        if (req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: "Unauthorized" });

        const query = "UPDATE notices SET title = ?, content = ?, is_important = ? WHERE id = ?";
        db.query(query, [title, content, is_important ? 1 : 0, noticeId], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Notice not found" });
            res.json({ success: true, message: "Notice updated successfully" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const deleteNotice = (req, res) => {
    try {
        const noticeId = req.params.id;
        
        if (req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: "Unauthorized" });

        const query = "DELETE FROM notices WHERE id = ?";
        db.query(query, [noticeId], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Notice not found" });
            res.json({ success: true, message: "Notice deleted successfully" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getNotices,
    createNotice,
    updateNotice,
    deleteNotice
};
