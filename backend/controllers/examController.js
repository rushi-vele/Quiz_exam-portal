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
            args: [title, description, duration, total_marks, passing_marks, total_questions || 0, published ? 1 : 0, req.user.id]
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

exports.toggleExamStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const examRes = await client.execute({
            sql: 'SELECT id, title, published FROM exams WHERE id = ?',
            args: [id]
        });
        const exam = examRes.rows[0];
        if (!exam) return res.status(404).json({ success: false, message: 'Exam not found' });

        const newStatus = (exam.published === 1 || exam.published === true) ? 0 : 1;
        await client.execute({
            sql: 'UPDATE exams SET published = ? WHERE id = ?',
            args: [newStatus, id]
        });

        // Trigger notification only when publishing
        if (newStatus === 1) {
            try {
                const { createNotify } = require('./notificationController');
                await createNotify({
                    recipient_role: 'student',
                    sender_id: req.user.id,
                    message: `Strategic Update: The assessment "${exam.title}" has been officially published and is now open for enrollment.`,
                    type: 'exam_created',
                    exam_id: Number(id)
                });
            } catch (notifyError) {
                console.error('Notification failed but exam was toggled:', notifyError);
            }
        }

        res.json({ 
            success: true, 
            published: newStatus === 1,
            message: `Assessment ${newStatus ? 'Published and Distributed' : 'Reverted to Draft'} Successfully` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.deleteExam = async (req, res) => {
    try {
        const examId = req.params.id;
        
        console.log(`Starting deep delete for exam ID: ${examId}`);

        // Sequence of deletions to respect dependencies
        // 1. Leaderboard entries
        await client.execute({ sql: 'DELETE FROM leaderboard WHERE exam_id = ?', args: [examId] });

        // 2. Retake requests
        await client.execute({ sql: 'DELETE FROM retake_requests WHERE exam_id = ?', args: [examId] });

        // 3. Notifications
        await client.execute({ sql: 'DELETE FROM notifications WHERE exam_id = ?', args: [examId] });

        // 4. Attempts & Answers (Answers are deleted via CASCADE in DB if configured, or manually)
        // Check if answers needs manual deletion if CASCADE is missing
        const attemptIdsResult = await client.execute({ sql: 'SELECT id FROM attempts WHERE exam_id = ?', args: [examId] });
        const attemptIds = attemptIdsResult.rows.map(r => r.id);
        
        if (attemptIds.length > 0) {
            const placeholders = attemptIds.map(() => '?').join(',');
            await client.execute({ 
                sql: `DELETE FROM answers WHERE attempt_id IN (${placeholders})`, 
                args: attemptIds 
            });
            await client.execute({ sql: 'DELETE FROM attempts WHERE exam_id = ?', args: [examId] });
        }

        // 5. Questions
        await client.execute({ sql: 'DELETE FROM questions WHERE exam_id = ?', args: [examId] });

        // 6. Final step: The Exam
        const result = await client.execute({ sql: 'DELETE FROM exams WHERE id = ?', args: [examId] });

        if (result.rowsAffected === 0) {
            return res.status(404).json({ success: false, message: 'Exam not found' });
        }

        res.json({ 
            success: true, 
            message: 'Exam and all associated intelligence eradicated successfully' 
        });
    } catch (error) {
        console.error('CRITICAL DELETE ERROR:', error);
        res.status(500).json({ 
            success: false, 
            message: `Ingestion failure: ${error.message}` 
        });
    }
};
