const { client } = require('../config/db');

exports.getResultByAttemptId = async (req, res) => {
    try {
        const attemptRes = await client.execute({
            sql: `SELECT a.*, e.title as exam_title, e.total_marks, e.total_questions, u.name as user_name 
                  FROM attempts a 
                  JOIN exams e ON a.exam_id = e.id 
                  JOIN users u ON a.user_id = u.id
                  WHERE a.id = ? AND (a.user_id = ? OR u.role = 'admin')`,
            args: [req.params.id, req.user.id]
        });
        const attempt = attemptRes.rows[0];
        if (!attempt) return res.status(404).json({ message: 'Result not found or unauthorized' });

        // Fetch detailed question-by-question answers
        const questionsRes = await client.execute({
            sql: `SELECT a.submitted_answer, a.is_correct, a.marks_obtained, 
                         q.question_text, q.question_type, q.correct_answer, q.points, q.options
                  FROM answers a
                  JOIN questions q ON a.question_id = q.id
                  WHERE a.attempt_id = ?`,
            args: [req.params.id]
        });

        const questionsWithParsedOptions = questionsRes.rows.map(q => ({
            ...q,
            options: q.options ? JSON.parse(q.options) : []
        }));

        const startTime = new Date(attempt.start_time).getTime();
        const endTime = new Date(attempt.end_time || Date.now()).getTime();
        const timeTaken = Math.round((endTime - startTime) / 1000);

        res.json({
            ...attempt,
            time_taken: timeTaken,
            questions: questionsWithParsedOptions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getMyResults = async (req, res) => {
    try {
        const result = await client.execute({
            sql: `SELECT a.*, e.title, e.total_marks 
                  FROM attempts a 
                  JOIN exams e ON a.exam_id = e.id 
                  WHERE a.user_id = ? AND a.status = 'completed' 
                  ORDER BY a.end_time DESC`,
            args: [req.user.id]
        });
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllResults = async (req, res) => {
    try {
        const result = await client.execute({
            sql: 'SELECT a.*, u.name, u.email FROM attempts a JOIN users u ON a.user_id = u.id WHERE a.exam_id = ? ORDER BY a.score DESC',
            args: [req.params.examId]
        });
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
