const db = require("../config/db");

const createComplaint = (req, res) => {
    try {
        const residentId = req.user.id;
        const { category, description } = req.body;
        
        let photoUrl = null;
        if (req.file) {
            photoUrl = `/uploads/${req.file.filename}`;
        }

        const query = `
            INSERT INTO complaints (resident_id, category, description, photo_url, status, priority)
            VALUES (?, ?, ?, ?, 'OPEN', 'MEDIUM')
        `;

        db.query(query, [residentId, category, description, photoUrl], (err, result) => {
            if (err) {
                console.error("Database error inserting complaint", err);
                return res.status(500).json({ success: false, message: "Database error" });
            }

            const complaintId = result.insertId;

            // Also insert into complaint_history
            const historyQuery = `
                INSERT INTO complaint_history (complaint_id, new_status, actor_id, note)
                VALUES (?, 'OPEN', ?, 'Complaint raised')
            `;

            db.query(historyQuery, [complaintId, residentId], (hErr) => {
                if (hErr) console.error("Database error inserting complaint history", hErr);
                
                const { notifyAdmins } = require("./notificationController");
                notifyAdmins("New Complaint", `A new ${category} complaint (#${complaintId}) was raised by Resident #${residentId}`, "NEW_COMPLAINT");

                res.status(201).json({
                    success: true,
                    message: "Complaint raised successfully",
                    data: { id: complaintId }
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getComplaints = (req, res) => {
    try {
        const LOW_SLA_DAYS = parseInt(process.env.LOW_SLA_DAYS || "5", 10);
        const MEDIUM_SLA_DAYS = parseInt(process.env.MEDIUM_SLA_DAYS || "3", 10);
        const HIGH_SLA_DAYS = parseInt(process.env.HIGH_SLA_DAYS || "1", 10);

        const { status, category, priority, search, overdue, sortBy, startDate, endDate } = req.query;
        let query = `
            SELECT c.*, u.name as resident_name, u.email as resident_email,
            IF(c.status != 'RESOLVED' AND (
                (c.priority = 'LOW' AND DATEDIFF(CURRENT_TIMESTAMP, c.created_at) > ?) OR
                (c.priority = 'MEDIUM' AND DATEDIFF(CURRENT_TIMESTAMP, c.created_at) > ?) OR
                (c.priority = 'HIGH' AND DATEDIFF(CURRENT_TIMESTAMP, c.created_at) > ?)
            ), 1, 0) as is_overdue
            FROM complaints c 
            JOIN users u ON c.resident_id = u.id 
            WHERE 1=1
        `;
        const params = [LOW_SLA_DAYS, MEDIUM_SLA_DAYS, HIGH_SLA_DAYS];

        // Role-based filtering
        if (req.user.role === 'RESIDENT') {
            query += " AND c.resident_id = ?";
            params.push(req.user.id);
        }

        if (status) {
            query += " AND c.status = ?";
            params.push(status);
        }
        if (category) {
            query += " AND c.category = ?";
            params.push(category);
        }
        if (priority) {
            query += " AND c.priority = ?";
            params.push(priority);
        }
        if (startDate && endDate) {
            query += " AND DATE(c.created_at) BETWEEN ? AND ?";
            params.push(startDate, endDate);
        }
        if (search) {
            query += " AND (c.id = ? OR u.name LIKE ? OR u.email LIKE ?)";
            // Use search as ID if it's numeric, otherwise just use it for string match but it's safe to pass string to INT id (MySQL handles it mostly, but better to pass 0 if NaN)
            const searchId = isNaN(search) ? 0 : parseInt(search, 10);
            params.push(searchId, `%${search}%`, `%${search}%`);
        }

        if (overdue === 'true') {
            query += " HAVING is_overdue = 1";
        }

        if (sortBy === 'priority') {
            query += " ORDER BY CASE c.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 END, c.created_at DESC";
        } else if (sortBy === 'oldest') {
            query += " ORDER BY c.created_at ASC";
        } else {
            query += " ORDER BY c.created_at DESC";
        }

        // Pagination
        const limitVal = parseInt(req.query.limit) || 50;
        const pageVal = parseInt(req.query.page) || 1;
        const offsetVal = (pageVal - 1) * limitVal;
        
        query += " LIMIT ? OFFSET ?";
        params.push(limitVal, offsetVal);

        db.query(query, params, (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Database error" });
            }
            const formattedResults = results.map(c => {
                c.resident = { name: c.resident_name, email: c.resident_email };
                delete c.resident_name;
                delete c.resident_email;
                return c;
            });
            res.json({ success: true, data: formattedResults });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getComplaintById = (req, res) => {
    try {
        const complaintId = req.params.id;
        let query = `
            SELECT c.*, u.name as resident_name, u.email as resident_email
            FROM complaints c 
            JOIN users u ON c.resident_id = u.id 
            WHERE c.id = ?
        `;
        const params = [complaintId];

        if (req.user.role === 'RESIDENT') {
            query += " AND c.resident_id = ?";
            params.push(req.user.id);
        }

        db.query(query, params, (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            if (results.length === 0) return res.status(404).json({ success: false, message: "Complaint not found" });
            
            const complaint = results[0];
            
            // Reformat object to match frontend expectations
            complaint.resident = {
                name: complaint.resident_name,
                email: complaint.resident_email
            };
            delete complaint.resident_name;
            delete complaint.resident_email;

            // Fetch history
            db.query(
                `SELECT h.*, u.name as actor_name 
                 FROM complaint_history h 
                 JOIN users u ON h.actor_id = u.id 
                 WHERE h.complaint_id = ? 
                 ORDER BY h.created_at DESC`, 
                [complaintId], 
                (hErr, hResults) => {
                    if (hErr) return res.status(500).json({ success: false, message: "Database error" });
                    complaint.history = hResults;
                    res.json({ success: true, data: complaint });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateComplaintStatus = (req, res) => {
    try {
        const complaintId = req.params.id;
        const { status, note } = req.body;
        
        if (req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: "Unauthorized" });

        const { logAudit } = require("./auditController");
        const { sendNotification } = require("./notificationController");

        let updateQuery = "UPDATE complaints SET status = ?";
        const queryParams = [status];
        
        if (status === 'RESOLVED') {
            updateQuery += ", resolved_at = CURRENT_TIMESTAMP, closed_at = CURRENT_TIMESTAMP";
        }
        
        updateQuery += " WHERE id = ?";
        queryParams.push(complaintId);

        db.query(updateQuery, queryParams, (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Complaint not found" });

            const historyQuery = `
                INSERT INTO complaint_history (complaint_id, new_status, actor_id, note)
                VALUES (?, ?, ?, ?)
            `;
            db.query(historyQuery, [complaintId, status, req.user.id, note || `Status changed to ${status}`], () => {
                logAudit(req.user.id, "STATUS_UPDATE", "COMPLAINT", complaintId, `Complaint #${complaintId} status changed to ${status}`);
                
                db.query("SELECT resident_id, category FROM complaints WHERE id = ?", [complaintId], (err, rows) => {
                    if (!err && rows.length > 0) {
                        sendNotification(
                            rows[0].resident_id, 
                            "Complaint Update", 
                            `Your ${rows[0].category} complaint #${complaintId} status changed to ${status}.`, 
                            "COMPLAINT_UPDATE"
                        );
                    }
                });

                res.json({ success: true, message: "Status updated successfully" });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateComplaintPriority = (req, res) => {
    try {
        const complaintId = req.params.id;
        const { priority } = req.body;
        
        if (req.user.role !== 'ADMIN') return res.status(403).json({ success: false, message: "Unauthorized" });

        const { logAudit } = require("./auditController");

        const updateQuery = "UPDATE complaints SET priority = ? WHERE id = ?";
        db.query(updateQuery, [priority, complaintId], (err, result) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });
            if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Complaint not found" });

            const historyQuery = `
                INSERT INTO complaint_history (complaint_id, new_status, actor_id, note)
                SELECT ?, status, ?, ? FROM complaints WHERE id = ?
            `;
            db.query(historyQuery, [complaintId, req.user.id, `Priority changed to ${priority}`, complaintId], () => {
                logAudit(req.user.id, "PRIORITY_UPDATE", "COMPLAINT", complaintId, `Complaint #${complaintId} priority changed to ${priority}`);
                res.json({ success: true, message: "Priority updated successfully" });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    createComplaint,
    getComplaints,
    getComplaintById,
    updateComplaintStatus,
    updateComplaintPriority
};
