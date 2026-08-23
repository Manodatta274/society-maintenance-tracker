const db = require('./config/db');
const bcrypt = require('bcryptjs');

async function seedUsers() {
    console.log("Checking database...");

    // Create table if it doesn't exist
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role ENUM('ADMIN', 'RESIDENT') DEFAULT 'RESIDENT',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.query(createTableQuery, async (err) => {
        if (err) {
            console.error("Error creating users table:", err);
            process.exit(1);
        }

        console.log("Users table exists or was created.");

        const usersToCreate = [
            {
                name: 'System Admin',
                email: 'admin@society.com',
                password: 'Admin@123',
                role: 'ADMIN'
            },
            {
                name: 'Alice',
                email: 'alice@society.com',
                password: 'Resident@123',
                role: 'RESIDENT'
            }
        ];

        for (const user of usersToCreate) {
            db.query("SELECT * FROM users WHERE email = ?", [user.email], async (err, results) => {
                if (err) {
                    console.error("Error querying user:", user.email, err);
                } else if (results.length === 0) {
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    db.query(
                        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                        [user.name, user.email, hashedPassword, user.role],
                        (err, result) => {
                            if (err) {
                                console.error("Error inserting user:", user.email, err);
                            } else {
                                console.log(`Created user: ${user.email}`);
                            }
                        }
                    );
                } else {
                    console.log(`User already exists: ${user.email}`);
                    // Optionally, update password if it's wrong? The user said "If the required users do not exist, create the demo users". We'll just update them to make sure they work.
                    const hashedPassword = await bcrypt.hash(user.password, 10);
                    db.query(
                        "UPDATE users SET password = ?, role = ?, name = ? WHERE email = ?",
                        [hashedPassword, user.role, user.name, user.email],
                        (err) => {
                            if (err) console.error("Error updating user:", user.email);
                            else console.log(`Updated user password for: ${user.email}`);
                        }
                    );
                }
            });
        }
        
        setTimeout(() => {
            console.log("Seeding complete.");
            process.exit(0);
        }, 2000);
    });
}

seedUsers();
