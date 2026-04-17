const { client } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await client.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: [name, email, hashedPassword, role || 'student']
        });
        
        const userId = Number(result.lastInsertRowid);
        res.status(201).json({
            token: generateToken(userId),
            user: { id: userId, name, email, role: role || 'student' }
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'User already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await client.execute({
            sql: 'SELECT * FROM users WHERE email = ?',
            args: [email]
        });
        
        const user = result.rows[0];
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                token: generateToken(user.id),
                user: { id: user.id, name: user.name, email: user.email, role: user.role }
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const result = await client.execute({
            sql: 'SELECT id, name, email, role FROM users WHERE id = ?',
            args: [req.user.id]
        });
        const user = result.rows[0];
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
