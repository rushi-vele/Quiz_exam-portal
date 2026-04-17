const { client } = require('../config/db');

exports.getLeaderboardByExam = async (req, res) => {
    try {
        const result = await client.execute({
            sql: `SELECT u.id as user_id, u.name, e.title as exam_title, l.total_score, e.total_marks, l.percentage, l.time_taken, l.achieved_at 
                  FROM leaderboard l
                  JOIN users u ON l.user_id = u.id
                  JOIN exams e ON l.exam_id = e.id
                  WHERE l.exam_id = ?
                  ORDER BY l.total_score DESC, l.time_taken ASC, l.achieved_at ASC`,
            args: [req.params.examId]
        });

        const rankedResults = result.rows.map((row, index) => ({
            rank: index + 1,
            ...row
        }));

        res.json(rankedResults);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const result = await client.execute(`
            SELECT u.id as user_id, u.name, e.title as exam_title, l.total_score, e.total_marks, l.percentage, l.time_taken, l.achieved_at 
            FROM leaderboard l
            JOIN users u ON l.user_id = u.id
            JOIN exams e ON l.exam_id = e.id
            ORDER BY l.total_score DESC, l.time_taken ASC
            LIMIT 100
        `);

        const rankedResults = result.rows.map((row, index) => ({
            rank: index + 1,
            ...row
        }));

        res.json(rankedResults);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
