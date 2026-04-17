const { client } = require('../config/db');

exports.createRetakeRequest = async (req, res) => {
    try {
        const { examId, reason } = req.body;
        // Check if they already have a pending request
        const existing = await client.execute({
            sql: "SELECT * FROM retake_requests WHERE user_id = ? AND exam_id = ? AND status = 'pending'",
            args: [req.user.id, examId]
        });
        if (existing.rows.length > 0) return res.status(400).json({ message: 'Request already pending' });

        await client.execute({
            sql: "INSERT INTO retake_requests (user_id, exam_id, reason) VALUES (?, ?, ?)",
            args: [req.user.id, examId, reason]
        });

        // Trigger Notification for Admins
        const { createNotify } = require('./notificationController');
        // Fetch exam title for the message
        const examRes = await client.execute({ sql: "SELECT title FROM exams WHERE id = ?", args: [examId] });
        const examTitle = examRes.rows[0]?.title || 'Assessment';
        
        await createNotify({
            recipient_role: 'admin',
            sender_id: req.user.id,
            message: `Retake requested for "${examTitle}" by student ID ${req.user.id}.`,
            type: 'retake_request',
            exam_id: examId
        });

        res.status(201).json({ message: 'Retake request submitted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStudentRequests = async (req, res) => {
    try {
        const result = await client.execute({
            sql: "SELECT r.*, e.title as exam_title FROM retake_requests r JOIN exams e ON r.exam_id = e.id WHERE r.user_id = ?",
            args: [req.user.id]
        });
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const result = await client.execute(`
            SELECT r.*, e.title as exam_title, u.name as student_name, u.email as student_email 
            FROM retake_requests r 
            JOIN exams e ON r.exam_id = e.id 
            JOIN users u ON r.user_id = u.id 
            ORDER BY r.requested_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.processRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, admin_response } = req.body;

        const requestRes = await client.execute({
            sql: "SELECT * FROM retake_requests WHERE id = ?",
            args: [id]
        });
        const request = requestRes.rows[0];
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (status === 'approved') {
            // Reset the student's attempt for this exam
            await client.batch([
                {
                    sql: "DELETE FROM leaderboard WHERE user_id = ? AND exam_id = ?",
                    args: [request.user_id, request.exam_id]
                },
                {
                    sql: "DELETE FROM answers WHERE attempt_id IN (SELECT id FROM attempts WHERE user_id = ? AND exam_id = ?)",
                    args: [request.user_id, request.exam_id]
                },
                {
                    sql: "DELETE FROM attempts WHERE user_id = ? AND exam_id = ?",
                    args: [request.user_id, request.exam_id]
                }
            ], "write");
        }

        await client.execute({
            sql: "UPDATE retake_requests SET status = ?, admin_response = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?",
            args: [status, admin_response, id]
        });

        res.json({ message: `Request ${status}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
