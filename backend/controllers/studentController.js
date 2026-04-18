const { client } = require('../config/db');
const bcrypt = require('bcryptjs');

exports.createStudent = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const result = await client.execute({
            sql: 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            args: [name, email, hashedPassword, 'student']
        });

        res.status(201).json({ 
            id: Number(result.lastInsertRowid), 
            name, 
            email, 
            role: 'student' 
        });
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ message: 'Email already registered' });
        }
        res.status(500).json({ message: error.message });
    }
};

exports.getStudents = async (req, res) => {
    try {
        // Fetch students and count their attempts as "enrolled"
        const result = await client.execute(`
            SELECT u.id, u.name, u.email, u.created_at,
            (SELECT COUNT(*) FROM attempts WHERE user_id = u.id) as enrolledCount
            FROM users u 
            WHERE u.role = 'student'
            ORDER BY u.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const result = await client.execute({
            sql: `SELECT id, name, email, role, created_at FROM users WHERE id = ? AND role = 'student'`,
            args: [req.params.id]
        });
        
        const student = result.rows[0];
        if (!student) return res.status(404).json({ message: 'Student not found' });
        
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const studentId = req.params.id;

        let sql = 'UPDATE users SET name = ?, email = ?';
        let args = [name, email];

        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            sql += ', password = ?';
            args.push(hashedPassword);
        }

        sql += ' WHERE id = ? AND role = ?';
        args.push(studentId, 'student');

        await client.execute({ sql, args });
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;

        // Cleanup attempts first
        await client.execute({
            sql: 'DELETE FROM attempts WHERE user_id = ?',
            args: [studentId]
        });

        const result = await client.execute({
            sql: 'DELETE FROM users WHERE id = ? AND role = ?',
            args: [studentId, 'student']
        });

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
