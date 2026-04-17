const { client } = require('../config/db');

exports.createExam = async (req, res) => {
    try {
        const { title, description, duration, total_marks, passing_marks, total_questions, published } = req.body;
        
        const existing = await client.execute({
            sql: 'SELECT id FROM exams WHERE title = ?',
            args: [title]
        });
        
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'Exam with this title already exists' });
        }

        const result = await client.execute({
            sql: 'INSERT INTO exams (title, description, duration, total_marks, passing_marks, total_questions, published, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            args: [title, description, duration, total_marks, passing_marks, total_questions || 0, 0, req.user.id]
        });

        res.status(201).json({ id: Number(result.lastInsertRowid), title, description, duration });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getExams = async (req, res) => {
    try {
        const result = await client.execute('SELECT * FROM exams ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getActiveExams = async (req, res) => {
    try {
        const result = await client.execute('SELECT * FROM exams WHERE published = 1 ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getExamById = async (req, res) => {
    try {
        const examRes = await client.execute({
            sql: 'SELECT * FROM exams WHERE id = ?',
            args: [req.params.id]
        });
        const exam = examRes.rows[0];
        if (!exam) return res.status(404).json({ message: 'Exam not found' });
        
        const qRes = await client.execute({
            sql: 'SELECT id, question_text, question_type, options, points FROM questions WHERE exam_id = ?',
            args: [exam.id]
        });
        
        // Parse options JSON strings back to arrays
        const questions = qRes.rows.map(q => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : []
        }));

        res.json({ exam, questions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.publishExam = async (req, res) => {
    try {
        await client.execute({
            sql: 'UPDATE exams SET published = 1 WHERE id = ?',
            args: [req.params.id]
        });
        res.json({ message: 'Exam published' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateExam = async (req, res) => {
    try {
        const { title, description, duration, total_marks, passing_marks, total_questions, published } = req.body;
        const examId = req.params.id;

        await client.execute({
            sql: `UPDATE exams 
                  SET title = ?, description = ?, duration = ?, total_marks = ?, passing_marks = ?, total_questions = ?, published = ?
                  WHERE id = ?`,
            args: [title, description, duration, total_marks, passing_marks, total_questions, published ? 1 : 0, examId]
        });

        res.json({ message: 'Exam configuration updated' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.publishExam = async (req, res) => {
    try {
        const examRes = await client.execute({
            sql: 'SELECT title FROM exams WHERE id = ?',
            args: [req.params.id]
        });
        const exam = examRes.rows[0];
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        await client.execute({
            sql: 'UPDATE exams SET published = 1 WHERE id = ?',
            args: [req.params.id]
        });

        // Trigger Notification for Students
        const { createNotify } = require('./notificationController');
        await createNotify({
            recipient_role: 'student',
            sender_id: req.user.id,
            message: `Official Release: The assessment "${exam.title}" is now live and available for participation.`,
            type: 'exam_created',
            exam_id: Number(req.params.id)
        });

        res.json({ message: 'Exam Published Successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteExam = async (req, res) => {
    try {
        const examId = req.params.id;
        
        // Step 1: Delete deep-linked data (Answers are linked via attempts)
        // Since answers has ON DELETE CASCADE with attempts, it will be handled when we delete attempts.
        // However, we should be explicit for non-cascading tables linked to examId.

        // Delete leaderboard entries
        await client.execute({ sql: 'DELETE FROM leaderboard WHERE exam_id = ?', args: [examId] });

        // Delete retake requests
        await client.execute({ sql: 'DELETE FROM retake_requests WHERE exam_id = ?', args: [examId] });

        // Delete notifications linked to this exam
        await client.execute({ sql: 'DELETE FROM notifications WHERE exam_id = ?', args: [examId] });

        // Delete attempts (this will CASCADE to answers)
        await client.execute({ sql: 'DELETE FROM attempts WHERE exam_id = ?', args: [examId] });

        // Delete questions (this will CASCADE to answers if question_id is used, but mostly CASCADE is on attempts)
        await client.execute({ sql: 'DELETE FROM questions WHERE exam_id = ?', args: [examId] });

        // Final step: Delete the exam itself
        await client.execute({ sql: 'DELETE FROM exams WHERE id = ?', args: [examId] });

        res.json({ message: 'Exam and all associated records deleted successfully' });
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ message: `Failed to delete assessment: ${error.message}` });
    }
};
