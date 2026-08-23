const db = require("../config/db");

const getAdminDashboard = async (req, res) => {
    try {
        const LOW_SLA = parseInt(process.env.LOW_SLA_DAYS || "5", 10);
        const MED_SLA = parseInt(process.env.MEDIUM_SLA_DAYS || "3", 10);
        const HIGH_SLA = parseInt(process.env.HIGH_SLA_DAYS || "1", 10);

        db.query("SELECT * FROM complaints", (err, results) => {
            if (err) return res.status(500).json({ success: false, message: "Database error" });

            let total = results.length;
            let byStatus = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
            let byCategory = {};
            let byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0 };
            let complaintsOverTime = {};
            let overdue = 0;
            let highPriority = 0;
            let totalResolutionTime = 0;
            let resolvedCount = 0;

            const now = new Date();

            results.forEach((c) => {
                if (c.status) byStatus[c.status] = (byStatus[c.status] || 0) + 1;
                if (c.category) byCategory[c.category] = (byCategory[c.category] || 0) + 1;
                if (c.priority) byPriority[c.priority] = (byPriority[c.priority] || 0) + 1;
                
                if (c.priority === 'HIGH') highPriority++;

                // Overdue logic
                if (c.status !== 'RESOLVED') {
                    const daysOpen = (now - new Date(c.created_at)) / (1000 * 60 * 60 * 24);
                    let isOverdue = false;
                    if (c.priority === 'LOW' && daysOpen > LOW_SLA) isOverdue = true;
                    if (c.priority === 'MEDIUM' && daysOpen > MED_SLA) isOverdue = true;
                    if (c.priority === 'HIGH' && daysOpen > HIGH_SLA) isOverdue = true;
                    if (isOverdue) overdue++;
                }

                // Resolution stats
                if (c.status === 'RESOLVED') {
                    resolvedCount++;
                    const resTimeTarget = c.resolved_at || c.updated_at || c.created_at;
                    const resTime = (new Date(resTimeTarget) - new Date(c.created_at)) / (1000 * 60 * 60); // hours
                    totalResolutionTime += resTime;
                }

                // Time series
                const dateKey = new Date(c.created_at).toISOString().split('T')[0];
                complaintsOverTime[dateKey] = (complaintsOverTime[dateKey] || 0) + 1;
            });

            const resolutionRate = total > 0 ? ((resolvedCount / total) * 100).toFixed(1) : 0;
            const avgResolutionHours = resolvedCount > 0 ? (totalResolutionTime / resolvedCount).toFixed(1) : 0;

            db.query(
                `SELECT a.*, u.name as actor_name 
                 FROM audit_logs a 
                 JOIN users u ON a.actor_id = u.id 
                 ORDER BY a.created_at DESC LIMIT 5`,
                (auditErr, recentActivity) => {
                    if (auditErr) recentActivity = []; // Gracefully handle if table is missing or error
                    
                    res.json({
                        success: true,
                        data: {
                            total,
                            byStatus,
                            byCategory,
                            byPriority,
                            complaintsOverTime,
                            overdue,
                            highPriority,
                            resolutionRate,
                            avgResolutionHours,
                            recentActivity
                        }
                    });
                }
            );
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getResidentDashboard = async (req, res) => {
    try {
        const residentId = req.user.id;
        
        // Fetch complaints for this resident
        db.query(
            "SELECT * FROM complaints WHERE resident_id = ?",
            [residentId],
            (err, complaints) => {
                if (err) {
                    console.error("Database error", err);
                    return res.status(500).json({ success: false, message: "Database error" });
                }

                let byStatus = { OPEN: 0, IN_PROGRESS: 0, RESOLVED: 0 };
                
                complaints.forEach((c) => {
                    if (c.status) {
                        byStatus[c.status] = (byStatus[c.status] || 0) + 1;
                    }
                });

                const recentComplaints = complaints
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5)
                    .map(c => ({
                        id: c.id.toString(),
                        category: c.category,
                        status: c.status,
                        description: c.description,
                        created_at: c.created_at
                    }));

                // Fetch recent notices
                db.query(
                    "SELECT * FROM notices ORDER BY created_at DESC LIMIT 5",
                    (err, notices) => {
                        if (err) {
                            console.error("Database error", err);
                            return res.status(500).json({ success: false, message: "Database error" });
                        }
                        
                        const recentNotices = notices.map(n => ({
                            id: n.id.toString(),
                            is_important: !!n.is_important,
                            title: n.title,
                            created_at: n.created_at
                        }));

                        res.json({
                            success: true,
                            data: {
                                byStatus,
                                recentComplaints,
                                recentNotices
                            }
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports = {
    getAdminDashboard,
    getResidentDashboard
};
