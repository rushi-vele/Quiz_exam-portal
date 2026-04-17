const { client, connectDB } = require('./config/db');

const resetDB = async () => {
    try {
        await connectDB();
        console.log('Dropping all tables...');
        const tables = ['leaderboard', 'answers', 'attempts', 'questions', 'exams', 'users'];
        for (const table of tables) {
            await client.execute(`DROP TABLE IF EXISTS ${table}`);
            console.log(`Dropped ${table}`);
        }
        console.log('✅ Database reset complete.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during reset:', error.message);
        process.exit(1);
    }
};

resetDB();
