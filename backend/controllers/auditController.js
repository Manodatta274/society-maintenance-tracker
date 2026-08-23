const db = require("../config/db");

const logAudit = (actorId, action, entityType, entityId, description) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, description)
            VALUES (?, ?, ?, ?, ?)
        `;
        db.query(query, [actorId, action, entityType, entityId, description], (err, result) => {
            if (err) {
                console.error("Audit log error:", err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const getAuditLogs = (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: "Unauthorized" });
        
        const query = `
            SELECT a.*, u.name as actor_name 
            FROM audit_logs a 
            JOIN users u ON a.actor_id = u.id 
            ORDER BY a.created_at DESC 
            LIMIT 50
        `;
        db.query(query, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            res.json({ success: true, data: results });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    logAudit,
    getAuditLogs
};
