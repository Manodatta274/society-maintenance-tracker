const db = require("./config/db");

const alterQueries = [
    "ALTER TABLE complaints ADD COLUMN resolved_at DATETIME NULL",
    "ALTER TABLE complaints ADD COLUMN closed_at DATETIME NULL",
    `CREATE TABLE IF NOT EXISTS audit_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        actor_id INT NOT NULL,
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`
];

async function runQueries() {
    for (const q of alterQueries) {
        try {
            await new Promise((resolve, reject) => {
                db.query(q, (err, res) => {
                    if (err) {
                        // ignore duplicate column errors
                        if (err.code === 'ER_DUP_FIELDNAME') {
                            console.log("Column already exists, skipping...");
                            resolve();
                        } else {
                            reject(err);
                        }
                    } else {
                        console.log("Query success:", q.substring(0, 50) + "...");
                        resolve(res);
                    }
                });
            });
        } catch (e) {
            console.error("Error executing query:", q, e.message);
        }
    }
    console.log("Database schema updated successfully.");
    process.exit(0);
}

runQueries();
