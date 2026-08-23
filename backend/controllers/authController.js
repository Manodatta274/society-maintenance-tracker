const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const userRole = role === "ADMIN" ? "ADMIN" : "RESIDENT";

        db.query(
            "SELECT id FROM users WHERE email = ?",
            [email],
            async (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (results.length > 0) {
                    return res.status(409).json({
                        success: false,
                        message: "Email already registered"
                    });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                db.query(
                    `INSERT INTO users (name, email, password, role)
                     VALUES (?, ?, ?, ?)`,
                    [name, email, hashedPassword, userRole],
                    (err, result) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({
                                success: false,
                                message: "Failed to create user"
                            });
                        }

                        res.status(201).json({
                            success: true,
                            message: "User registered successfully",
                            userId: result.insertId
                        });
                    }
                );
            }
        );
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            async (err, results) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (results.length === 0) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email or password"
                    });
                }

                const user = results[0];

                const passwordMatch = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!passwordMatch) {
                    return res.status(401).json({
                        success: false,
                        message: "Invalid email or password"
                    });
                }

                const token = jwt.sign(
                    {
                        id: user.id,
                        role: user.role
                    },
                    process.env.JWT_SECRET,
                    {
                        expiresIn: "1d"
                    }
                );

                res.json({
                    success: true,
                    message: "Login successful",
                    data: {
                        token: token,
                        user: {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role
                        }
                    }
                });
            }
        );
    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

module.exports = {
    register,
    login
};