require('dotenv').config();
const { createClient } = require('@libsql/client');

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const testQuery = async () => {
    try {
        console.log('Testing Global Leaderboard Query...');
        const result = await client.execute(`
            SELECT u.id as user_id, u.name, e.title as exam_title, l.total_score, e.total_marks, l.percentage, l.time_taken, l.achieved_at 
            FROM leaderboard l
            JOIN users u ON l.user_id = u.id
            JOIN exams e ON l.exam_id = e.id
            ORDER BY l.total_score DESC, l.time_taken ASC
            LIMIT 100
        `);
        console.log('Query Successful!');
        console.log('Row count:', result.rows.length);
        if (result.rows.length > 0) console.log('First row:', result.rows[0]);
    } catch (err) {
        console.error('❌ Query Failed:', err.message);
        
        console.log('\nTrying individual table select...');
        try {
            const lCheck = await client.execute('SELECT * FROM leaderboard LIMIT 1');
            console.log('Leaderboard table exists');
        } catch (e) {
            console.log('Leaderboard table error:', e.message);
        }
        
        try {
            const eCheck = await client.execute('SELECT * FROM exams LIMIT 1');
            console.log('Exams table exists');
        } catch (e) {
            console.log('Exams table error:', e.message);
        }
    }
};

testQuery();
