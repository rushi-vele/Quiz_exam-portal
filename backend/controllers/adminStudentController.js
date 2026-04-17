const { client } = require('../config/db');

exports.getAllStudents = async (req, res) => {
    try {
        const { search } = req.query;
        let sql = `
            SELECT id, name, email, created_at as createdAt, 
            (SELECT COUNT(*) FROM attempts WHERE user_id = users.id) as examsTaken 
            FROM users 
            WHERE role = 'student'
        `;
        const args = [];

        if (search) {
            sql += ` AND (name LIKE ? OR email LIKE ?)`;
            args.push(`%${search}%`, `%${search}%`);
        }

        const result = await client.execute({ sql, args });
        
        // Final mapping to ensure match with frontend expectations if needed
        const students = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            email: row.email,
            createdAt: row.createdAt,
            examsTaken: row.examsTaken || 0
        }));

        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.grantRetake = async (req, res) => {
    try {
        const { id } = req.params;
        await client.execute({
            sql: "UPDATE attempts SET status = 'ongoing', submitted = FALSE WHERE user_id = ?",
            args: [id]
        });
        res.json({ message: 'Retake granted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
