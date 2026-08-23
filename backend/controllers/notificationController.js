const db = require("../config/db");

const sendNotification = (userId, title, message, type) => {
    return new Promise((resolve, reject) => {
        const query = `
            INSERT INTO notifications (user_id, title, message, type)
            VALUES (?, ?, ?, ?)
        `;
        db.query(query, [userId, title, message, type], (err, result) => {
            if (err) {
                console.error("Notification error:", err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

const notifyAdmins = (title, message, type) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT id FROM users WHERE role = 'ADMIN'", (err, results) => {
            if (err) return reject(err);
            const promises = results.map(admin => sendNotification(admin.id, title, message, type));
            Promise.all(promises).then(resolve).catch(reject);
        });
    });
};

const notifyResidents = (title, message, type) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT id FROM users WHERE role = 'RESIDENT'", (err, results) => {
            if (err) return reject(err);
            const promises = results.map(res => sendNotification(res.id, title, message, type));
            Promise.all(promises).then(resolve).catch(reject);
        });
    });
};

const getNotifications = (req, res) => {
    try {
        const query = `
            SELECT * FROM notifications 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT 50
        `;
        db.query(query, [req.user.id], (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            res.json({ success: true, data: results });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const markAsRead = (req, res) => {
    try {
        const query = "UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?";
        db.query(query, [req.params.id, req.user.id], (err) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            res.json({ success: true, message: "Marked as read" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const markAllAsRead = (req, res) => {
    try {
        const query = "UPDATE notifications SET is_read = TRUE WHERE user_id = ?";
        db.query(query, [req.user.id], (err) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            res.json({ success: true, message: "All marked as read" });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    sendNotification,
    notifyAdmins,
    notifyResidents,
    getNotifications,
    markAsRead,
    markAllAsRead
};
