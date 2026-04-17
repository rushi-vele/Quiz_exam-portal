const { client } = require('../config/db');

exports.getNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;

        // Fetch notifications specific to user OR general for their role
        const result = await client.execute({
            sql: `SELECT * FROM notifications 
                  WHERE (recipient_id = ? OR (recipient_id IS NULL AND recipient_role = ?))
                  ORDER BY created_at DESC 
                  LIMIT 20`,
            args: [userId, role]
        });

        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await client.execute({
            sql: 'UPDATE notifications SET is_read = 1 WHERE id = ?',
            args: [id]
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        await client.execute({
            sql: 'UPDATE notifications SET is_read = 1 WHERE (recipient_id = ? OR (recipient_id IS NULL AND recipient_role = ?))',
            args: [userId, role]
        });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Internal utility function
exports.createNotify = async ({ recipient_id, recipient_role, sender_id, message, type, exam_id }) => {
    try {
        await client.execute({
            sql: `INSERT INTO notifications (recipient_id, recipient_role, sender_id, message, type, exam_id) 
                  VALUES (?, ?, ?, ?, ?, ?)`,
            args: [recipient_id || null, recipient_role || null, sender_id || null, message, type, exam_id || null]
        });
    } catch (error) {
        console.error('Failed to create notification:', error.message);
    }
};
