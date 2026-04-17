const { client } = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const studentRes = await client.execute("SELECT COUNT(*) as count FROM users WHERE role = 'student'");
        const examRes = await client.execute("SELECT COUNT(*) as count FROM exams");
        const questionRes = await client.execute("SELECT COUNT(*) as count FROM questions");
        const attemptRes = await client.execute("SELECT COUNT(*) as count FROM attempts WHERE submitted = 1");
        const avgRes = await client.execute("SELECT AVG(score) as avgScore FROM attempts WHERE submitted = 1");
        const retakeRes = await client.execute("SELECT COUNT(*) as count FROM retake_requests WHERE status = 'pending'");

        // Activity Trend (Last 7 Days)
        const trendRes = await client.execute(`
            SELECT strftime('%m-%d', end_time) as date, COUNT(*) as count 
            FROM attempts 
            WHERE submitted = 1 AND end_time >= date('now', '-7 days')
            GROUP BY date 
            ORDER BY date ASC
        `);

        // Top Performers (Students with highest avg percentage)
        const topRes = await client.execute(`
            SELECT u.name, ROUND(AVG(a.percentage)) as score 
            FROM attempts a 
            JOIN users u ON a.user_id = u.id 
            WHERE a.submitted = 1 
            GROUP BY a.user_id 
            ORDER BY score DESC 
            LIMIT 4
        `);

        // Recent Submissions
        const recentRes = await client.execute(`
            SELECT u.name as student_name, e.title as exam_title, a.score, e.total_marks, a.end_time 
            FROM attempts a 
            JOIN users u ON a.user_id = u.id 
            JOIN exams e ON a.exam_id = e.id 
            WHERE a.submitted = 1 
            ORDER BY a.end_time DESC 
            LIMIT 5
        `);

        res.json({
            students: studentRes.rows[0].count,
            exams: examRes.rows[0].count,
            questions: questionRes.rows[0].count,
            submissions: attemptRes.rows[0].count,
            pendingRetakes: retakeRes.rows[0].count,
            avgScore: Math.round(avgRes.rows[0].avgScore || 0),
            activityTrend: trendRes.rows,
            topPerformers: topRes.rows,
            recentSubmissions: recentRes.rows
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
